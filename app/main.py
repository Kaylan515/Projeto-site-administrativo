# ============================================================
# main.py — Ponto de entrada da aplicação
# ============================================================

from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.controllers import auth_controller
from app.auth import get_usuario_opcional  # ← troca aqui
from app.controllers import usuario_controller  # ← adicionar
from app.controllers import produto_controller  # ← adicionar
from app.controllers import categoria_controller
from app.controllers import movimentacao_controller
from app.controllers import armario_controller  # ← adicionar

from app.controllers import cliente_controller, pdv_controller
from app.database import engine
from app.models.produto import Produto
from app.models.categoria import Categoria
from app.models.movimentacao import Movimentacao
from app.models.armario import Armario, StatusArmario
from app.models.cliente import Cliente
from app.models.venda import Venda
from sqlalchemy.orm import Session, joinedload

app = FastAPI(title="Sistema de Estoque")

#Configura o FastAPI para servir arquivos estáticos (CSS, JS, imagens)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Configura o Jinja2 para renderizar os templates HTML
templates = Jinja2Templates(directory="app/templates")


@app.exception_handler(StarletteHTTPException)
async def pagina_http_erro(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 401:
        return RedirectResponse(
            url="/auth/login?mensagem=sessao_expirada",
            status_code=303
        )
    if exc.status_code == 404:
        return templates.TemplateResponse(request, "erro.html", {"request": request, "codigo": 404, "titulo": "Pagina nao encontrada", "mensagem": "O endereco acessado nao esta disponivel ou foi movido."}, status_code=404)
    return templates.TemplateResponse(request, "erro.html", {"request": request, "codigo": exc.status_code, "titulo": "Acesso indisponivel", "mensagem": "Nao foi possivel concluir esta solicitacao."}, status_code=exc.status_code)


@app.exception_handler(Exception)
async def pagina_erro_interno(request: Request, exc: Exception):
    return templates.TemplateResponse(request, "erro.html", {"request": request, "codigo": 500, "titulo": "Erro interno", "mensagem": "Ocorreu uma falha inesperada. Tente novamente ou retorne ao painel."}, status_code=500)
def _dados_dashboard() -> dict:
    """Monta os indicadores exibidos no painel principal."""
    with Session(engine) as db:
        total_produtos = db.query(Produto).filter(Produto.ativo == True).count()
        total_categorias = db.query(Categoria).filter(Categoria.ativo == True).count()
        estoque_baixo = (
            db.query(Produto)
            .filter(Produto.ativo == True, Produto.estoque_atual <= 5)
            .order_by(Produto.estoque_atual, Produto.nome)
            .all()
        )
        movimentacoes_recentes = (
            db.query(Movimentacao)
            .options(joinedload(Movimentacao.produto))
            .order_by(Movimentacao.criado_em.desc())
            .limit(5)
            .all()
        )
        itens_grafico = (
            db.query(Produto)
            .filter(Produto.ativo == True)
            .order_by(Produto.estoque_atual.desc(), Produto.nome)
            .limit(5)
            .all()
        )
        total_itens_grafico = sum(item.estoque_atual for item in itens_grafico)
        cores_grafico = ["#ff4b5f", "#f59e0b", "#22c55e", "#60a5fa", "#a78bfa"]
        acumulado = 0
        grafico_estoque = []
        partes_pizza = []
        for indice, item in enumerate(itens_grafico):
            percentual = round(item.estoque_atual / total_itens_grafico * 100, 2) if total_itens_grafico else 0
            inicio = acumulado
            acumulado += percentual
            cor = cores_grafico[indice]
            grafico_estoque.append({"nome": item.nome, "quantidade": item.estoque_atual, "percentual": percentual, "cor": cor})
            partes_pizza.append(f"{cor} {inicio}% {acumulado}%")
        grafico_pizza = ", ".join(partes_pizza) or "#443633 0 100%"
        total_armarios = db.query(Armario).filter(Armario.ativo == True).count()
        total_clientes = db.query(Cliente).filter(Cliente.ativo == True).count()
        total_vendas = db.query(Venda).count()
        armarios_disponiveis = (
            db.query(Armario)
            .filter(Armario.ativo == True, Armario.status == StatusArmario.DISPONIVEL)
            .count()
        )
        armarios_alugados = (
            db.query(Armario)
            .filter(Armario.ativo == True, Armario.status == StatusArmario.ALUGADO)
            .count()
        )

        return {
            "total_produtos": total_produtos,
            "total_categorias": total_categorias,
            "estoque_baixo": estoque_baixo,
            "movimentacoes_recentes": movimentacoes_recentes,
            "grafico_estoque": grafico_estoque,
            "grafico_pizza": grafico_pizza,
            "total_armarios": total_armarios,
            "armarios_disponiveis": armarios_disponiveis,
            "armarios_alugados": armarios_alugados,
            "total_clientes": total_clientes,
            "total_vendas": total_vendas,
        }

# Inclui os routers dos controladores
app.include_router(auth_controller.router)
app.include_router(cliente_controller.router)
app.include_router(pdv_controller.router)
# Inclui o router do controlador de usuários (admin)
app.include_router(usuario_controller.router)  # ← adicionar
app.include_router(produto_controller.router)  # ← adicionar
app.include_router(categoria_controller.router)
app.include_router(movimentacao_controller.router)
app.include_router(armario_controller.router)   # ← adicionar


#Rodar o código: python -m uvicorn app.main:app --reload


@app.get("/")
def dashboard(
    request: Request,
    usuario = Depends(get_usuario_opcional)  # ← não lança erro se não logado
):
    """
    Se o usuário estiver logado, mostra o dashboard.
    Se não estiver, renderiza uma página de boas-vindas
    com links para login e cadastro — sem nenhum erro.
    """

    if usuario is None:
        # Não logado — exibe página pública de boas-vindas
        return templates.TemplateResponse(
            request,
            "welcome.html",
            {"request": request}
        )

    # Logado — exibe o dashboard com os dados do usuário
    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {"request": request, "usuario": usuario, **_dados_dashboard()}
    )


@app.get("/dashboard", include_in_schema=False)
def redirecionar_dashboard():
    """Mantém links antigos funcionando após o painel passar a usar '/'."""
    return RedirectResponse(url="/", status_code=302)
    
