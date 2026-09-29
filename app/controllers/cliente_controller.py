# ============================================================
# controllers/cliente_controller.py — CRUD de clientes
# ============================================================

import math

from fastapi import APIRouter, Depends, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cliente import Cliente
from app.auth import get_admin

router = APIRouter(prefix="/clientes", tags=["Clientes"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/")
def listar_clientes(
    request: Request,
    busca: str = "",
    apenas_associados: bool = False,
    status: str = "",
    ordenar_por: str = "nome",
    direcao: str = "asc",
    pagina: int = 1,
    db: Session = Depends(get_db),
    admin = Depends(get_admin)
):
    query = db.query(Cliente)

    if busca:
        query = query.filter(
            Cliente.nome.ilike(f"%{busca}%") |
            Cliente.matricula.ilike(f"%{busca}%")
        )

    if apenas_associados:
        query = query.filter(Cliente.is_associado == True)

    if status in ("ativo", "inativo"):
        query = query.filter(Cliente.ativo == (status == "ativo"))

    ordenacoes = {"nome": Cliente.nome, "matricula": Cliente.matricula, "criado_em": Cliente.criado_em}
    ordenar_por = ordenar_por if ordenar_por in ordenacoes else "nome"
    direcao = direcao if direcao in ("asc", "desc") else "asc"
    coluna_ordenacao = ordenacoes[ordenar_por]
    query = query.order_by(coluna_ordenacao.desc() if direcao == "desc" else coluna_ordenacao.asc(), Cliente.id.asc())

    total_clientes = query.count()
    pagina = max(pagina, 1)
    por_pagina = 10
    total_paginas = max(math.ceil(total_clientes / por_pagina), 1)
    pagina = min(pagina, total_paginas)
    clientes = query.offset((pagina - 1) * por_pagina).limit(por_pagina).all()

    total_associados = db.query(Cliente).filter(
        Cliente.is_associado == True,
        Cliente.ativo == True
    ).count()

    return templates.TemplateResponse(
        request,
        "clientes/index.html",
        {
            "request":           request,
            "usuario":           admin,
            "clientes":          clientes,
            "busca":             busca,
            "apenas_associados": apenas_associados,
            "status":             status,
            "ordenar_por":        ordenar_por,
            "direcao":            direcao,
            "pagina":             pagina,
            "por_pagina":         por_pagina,
            "total_paginas":      total_paginas,
            "total_clientes":     total_clientes,
            "total_associados":  total_associados,
        }
    )


@router.get("/novo")
def form_novo(request: Request, admin = Depends(get_admin)):
    return templates.TemplateResponse(
        request,
        "clientes/form.html",
        {"request": request, "usuario": admin, "editando": None}
    )


@router.post("/novo")
def criar(
    request: Request,
    nome: str          = Form(...),
    matricula: str     = Form(""),
    telefone: str      = Form(""),
    is_associado: bool = Form(False),
    db: Session        = Depends(get_db),
    admin              = Depends(get_admin)
):
    # Verifica duplicidade de matrícula (apenas se preenchida)
    if matricula:
        existente = db.query(Cliente).filter(
            Cliente.matricula == matricula.strip()
        ).first()

        if existente:
            return templates.TemplateResponse(
                request,
                "clientes/form.html",
                {
                    "request":  request,
                    "usuario":  admin,
                    "editando": None,
                    "erro":     f"Matrícula {matricula} já cadastrada.",
                    "valores":  {
                        "nome": nome, "matricula": matricula,
                        "telefone": telefone, "is_associado": is_associado
                    }
                },
                status_code=400
            )

    db.add(Cliente(
        nome         = nome.strip(),
        matricula    = matricula.strip() or None,
        telefone     = telefone.strip() or None,
        is_associado = is_associado,
    ))
    db.commit()

    return RedirectResponse(url="/clientes?criado=ok", status_code=302)


@router.get("/{cliente_id}/editar")
def form_editar(
    cliente_id: int,
    request: Request,
    db: Session = Depends(get_db),
    admin = Depends(get_admin)
):
    editando = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not editando:
        return RedirectResponse(url="/clientes", status_code=302)

    return templates.TemplateResponse(
        request,
        "clientes/form.html",
        {"request": request, "usuario": admin, "editando": editando}
    )


@router.post("/{cliente_id}/editar")
def editar(
    cliente_id: int,
    nome: str          = Form(...),
    matricula: str     = Form(""),
    telefone: str      = Form(""),
    is_associado: bool = Form(False),
    db: Session        = Depends(get_db),
    admin              = Depends(get_admin)
):
    editando = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not editando:
        return RedirectResponse(url="/clientes", status_code=302)

    if matricula:
        conflito = db.query(Cliente).filter(
            Cliente.matricula == matricula.strip(),
            Cliente.id != cliente_id
        ).first()
        if conflito:
            return RedirectResponse(
                url=f"/clientes/{cliente_id}/editar?erro=matricula",
                status_code=302
            )

    editando.nome         = nome.strip()
    editando.matricula    = matricula.strip() or None
    editando.telefone     = telefone.strip() or None
    editando.is_associado = is_associado
    db.commit()

    return RedirectResponse(url="/clientes?editado=ok", status_code=302)


@router.post("/{cliente_id}/toggle-ativo")
def toggle_ativo(
    cliente_id: int,
    db: Session = Depends(get_db),
    admin = Depends(get_admin)
):
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if cliente:
        cliente.ativo = not cliente.ativo
        db.commit()
    return RedirectResponse(url="/clientes", status_code=302)
