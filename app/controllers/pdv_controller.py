# ============================================================
# controllers/pdv_controller.py — Ponto de Venda
# ============================================================
# O PDV funciona assim:
# 1. GET /pdv        → tela com produtos + campo de cliente
# 2. O carrinho vive inteiro no JavaScript (sessionStorage)
# 3. POST /pdv/finalizar → recebe um JSON com os itens
#                          cria Venda + ItensVenda + baixa estoque
# ============================================================

import json
import math
from datetime import datetime, time, timedelta
from fastapi import APIRouter, Depends, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from sqlalchemy import String, func, or_

from app.database import get_db
from app.models.venda import Venda, ItemVenda
from app.models.produto import Produto
from app.models.cliente import Cliente
from app.auth import get_usuario_logado

router = APIRouter(prefix="/pdv", tags=["PDV"])
templates = Jinja2Templates(directory="app/templates")

DESCONTO_ASSOCIADO = 10.0  # percentual fixo


@router.get("/")
def tela_pdv(
    request: Request,
    db: Session = Depends(get_db),
    usuario = Depends(get_usuario_logado)
):
    """
    Carrega a tela do PDV com todos os produtos ativos
    e a lista de clientes para o campo de busca.
    """
    produtos  = (
        db.query(Produto)
        .filter(Produto.ativo == True, Produto.estoque_atual > 0)
        .order_by(Produto.nome)
        .all()
    )
    clientes  = (
        db.query(Cliente)
        .filter(Cliente.ativo == True)
        .order_by(Cliente.nome)
        .all()
    )

    return templates.TemplateResponse(
        request,
        "pdv/index.html",
        {
            "request":             request,
            "usuario":             usuario,
            "produtos":            produtos,
            "clientes":            clientes,
            "desconto_associado":  DESCONTO_ASSOCIADO,
        }
    )


@router.post("/finalizar")
def finalizar_venda(
    request: Request,
    carrinho_json: str = Form(...),  # JSON serializado pelo JS
    cliente_id: int    = Form(0),    # 0 = sem cliente identificado
    observacao: str    = Form(""),
    db: Session        = Depends(get_db),
    usuario            = Depends(get_usuario_logado)
):
    """
    Recebe o carrinho como JSON, valida e persiste a venda.

    Formato esperado do carrinho_json:
    [
        {"produto_id": 1, "nome": "Caneta", "preco": 2.50, "quantidade": 3},
        {"produto_id": 2, "nome": "Caderno", "preco": 15.00, "quantidade": 1}
    ]
    """
    try:
        itens = json.loads(carrinho_json)
    except (json.JSONDecodeError, ValueError):
        return RedirectResponse(url="/pdv?erro=json", status_code=302)

    if not itens:
        return RedirectResponse(url="/pdv?erro=vazio", status_code=302)

    # Busca o cliente e verifica se é associado
    cliente             = None
    desconto_percentual = 0.0

    if cliente_id:
        cliente = db.query(Cliente).filter(
            Cliente.id == cliente_id,
            Cliente.ativo == True
        ).first()

        if cliente and cliente.is_associado:
            desconto_percentual = DESCONTO_ASSOCIADO

    # ── Valida estoque e calcula totais ──────────────────────
    total_bruto = 0.0
    itens_validados = []

    for item in itens:
        produto = db.query(Produto).filter(
            Produto.id == item["produto_id"],
            Produto.ativo == True
        ).with_for_update().first()

        if not produto:
            return RedirectResponse(
                url=f"/pdv?erro=produto_inexistente&id={item['produto_id']}",
                status_code=302
            )

        qtd = int(item["quantidade"])

        if qtd <= 0:
            return RedirectResponse(url="/pdv?erro=quantidade", status_code=302)

        if produto.estoque_atual < qtd:
            return RedirectResponse(
                url=f"/pdv?erro=estoque&produto={produto.nome}",
                status_code=302
            )

        subtotal    = produto.preco * qtd
        total_bruto += subtotal

        itens_validados.append({
            "produto":       produto,
            "quantidade":    qtd,
            "preco":         produto.preco,
            "produto_nome":  produto.nome,
        })

    # ── Calcula desconto e total final 
    desconto_valor = total_bruto * (desconto_percentual / 100)
    total_liquido  = total_bruto - desconto_valor

    # ── Persiste tudo em uma única transação
    venda = Venda(
        cliente_id          = cliente_id or None,
        usuario_id          = usuario.get("id"),
        desconto_percentual = desconto_percentual,
        total_bruto         = round(total_bruto, 2),
        total_liquido       = round(total_liquido, 2),
        observacao          = observacao or None,
    )
    db.add(venda)
    db.flush()  # gera o venda.id sem commitar ainda

    for item in itens_validados:
        db.add(ItemVenda(
            venda_id       = venda.id,
            produto_id     = item["produto"].id,
            produto_nome   = item["produto_nome"],
            quantidade     = item["quantidade"],
            preco_unitario = item["preco"],
        ))
        # Baixa o estoque do produto
        item["produto"].estoque_atual -= item["quantidade"]

    db.commit()

    return RedirectResponse(
        url=f"/pdv/venda/{venda.id}?sucesso=ok",
        status_code=302
    )


@router.get("/venda/{venda_id}")
def detalhe_venda(
    venda_id: int,
    request: Request,
    db: Session = Depends(get_db),
    usuario = Depends(get_usuario_logado)
):
    """Comprovante da venda — exibido imediatamente após finalizar."""
    venda = db.query(Venda).filter(Venda.id == venda_id).first()

    if not venda:
        return RedirectResponse(url="/pdv", status_code=302)

    return templates.TemplateResponse(
        request,
        "pdv/comprovante.html",
        {"request": request, "usuario": usuario, "venda": venda}
    )


@router.get("/historico")
def historico_vendas(
    request: Request,
    busca: str = "",
    cliente_id: int = 0,
    data_inicio: str = "",
    data_fim: str = "",
    ordenar_por: str = "data",
    direcao: str = "desc",
    pagina: int = 1,
    db: Session = Depends(get_db),
    usuario = Depends(get_usuario_logado)
):
    """Histórico de vendas com filtros, ordenação e paginação."""
    query = db.query(Venda)
    if cliente_id:
        query = query.filter(Venda.cliente_id == cliente_id)
    if busca:
        termo = f"%{busca}%"
        query = query.outerjoin(Cliente).filter(
            or_(Cliente.nome.ilike(termo), Venda.observacao.ilike(termo), Venda.id.cast(String).ilike(termo))
        )
    try:
        if data_inicio:
            query = query.filter(Venda.criado_em >= datetime.fromisoformat(data_inicio))
        if data_fim:
            query = query.filter(Venda.criado_em < datetime.fromisoformat(data_fim) + timedelta(days=1))
    except ValueError:
        data_inicio = ""
        data_fim = ""

    ordenacoes = {"data": Venda.criado_em, "total": Venda.total_liquido, "desconto": Venda.desconto_percentual, "id": Venda.id}
    ordenar_por = ordenar_por if ordenar_por in ordenacoes else "data"
    direcao = direcao if direcao in ("asc", "desc") else "desc"
    coluna_ordenacao = ordenacoes[ordenar_por]
    query = query.order_by(coluna_ordenacao.desc() if direcao == "desc" else coluna_ordenacao.asc(), Venda.id.desc())
    total_vendas = query.count()
    pagina = max(pagina, 1)
    por_pagina = 10
    total_paginas = max(math.ceil(total_vendas / por_pagina), 1)
    pagina = min(pagina, total_paginas)
    vendas = query.offset((pagina - 1) * por_pagina).limit(por_pagina).all()
    clientes = db.query(Cliente).filter(Cliente.ativo == True).order_by(Cliente.nome).all()
    return templates.TemplateResponse(
        request,
        "pdv/historico.html",
        {
            "request": request, "usuario": usuario, "vendas": vendas,
            "clientes": clientes, "busca": busca, "cliente_id": cliente_id,
            "data_inicio": data_inicio, "data_fim": data_fim,
            "ordenar_por": ordenar_por, "direcao": direcao,
            "pagina": pagina, "por_pagina": por_pagina,
            "total_paginas": total_paginas, "total_vendas": total_vendas,
        }
    )


@router.get("/extrato")
def extrato_pdv(
    request: Request,
    db: Session = Depends(get_db),
    usuario = Depends(get_usuario_logado)
):
    """Resumo financeiro e operacional das vendas realizadas no dia."""
    inicio_hoje = datetime.combine(datetime.now().date(), time.min)
    vendas_hoje = db.query(Venda).filter(Venda.criado_em >= inicio_hoje)
    resumo = vendas_hoje.with_entities(
        func.count(Venda.id),
        func.coalesce(func.sum(Venda.total_bruto), 0),
        func.coalesce(func.sum(Venda.total_liquido), 0),
    ).one()
    ultimas_vendas = vendas_hoje.order_by(Venda.criado_em.desc()).limit(10).all()

    return templates.TemplateResponse(
        request,
        "pdv/extrato.html",
        {
            "request": request,
            "usuario": usuario,
            "quantidade_vendas": resumo[0],
            "total_bruto": resumo[1],
            "total_liquido": resumo[2],
            "total_descontos": resumo[1] - resumo[2],
            "ultimas_vendas": ultimas_vendas,
        }
    )
