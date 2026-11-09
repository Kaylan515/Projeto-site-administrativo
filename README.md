# AAPM SENAI — Sistema de gestão

Aplicação web para gerenciar produtos, estoque, categorias, clientes, usuários, armários e vendas da AAPM SENAI. Desenvolvida com FastAPI, SQLAlchemy, Jinja2 e JavaScript, com tema escuro, fundo interativo e transições entre páginas.

## Funcionalidades

- Dashboard com indicadores e produtos com estoque baixo: até 5 unidades, incluindo produtos sem estoque.
- Cadastro e edição de produtos, imagens, categorias e variações.
- Entradas e saídas de estoque com histórico de movimentações.
- Cadastro de clientes e identificação de associados.
- Gestão de usuários com perfis de administrador e operador.
- Gestão de armários, locações, liberações e histórico de reservas.
- PDV com carrinho, desconto de associado e pagamento dividido entre dinheiro, PIX, débito e crédito.
- Histórico de vendas, extrato diário e comprovante com as formas e os valores dos pagamentos.
- Confirmações visuais para ações e saída da conta.

O menu lateral abre ao carregar a página e pode ser recolhido manualmente. A animação dura 1,2 segundo e respeita a preferência por movimento reduzido.

## Requisitos

- Python 3.10 ou superior.
- Dependências de [requirements.txt](requirements.txt).
- Node.js 20 ou superior para executar os testes JavaScript. O sistema funciona sem Node.js em execução.

Execute os comandos abaixo a partir da raiz do projeto. Os exemplos de ativação do ambiente usam PowerShell no Windows.

## Instalação

Crie e ative um ambiente virtual:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Se preferir não ativar o ambiente, use `.\.venv\Scripts\python.exe` no lugar de `python` nos comandos seguintes.

### Configuração do ambiente

Crie um arquivo `.env` na raiz com as variáveis abaixo. Use seus próprios valores; o exemplo não contém a chave PIX nem os segredos do ambiente local.

```dotenv
DATABASE_URL=sqlite:///./estoque.db
SECRET_KEY=substitua_por_um_segredo_aleatorio
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
PIX_KEY=sua_chave_pix
PIX_RECEIVER_NAME=NOME DO RECEBEDOR
PIX_RECEIVER_CITY=SUA CIDADE
```

Para gerar um segredo:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão usada pela aplicação e pelo Alembic. O projeto está configurado para SQLite. |
| `SECRET_KEY` | Assinatura dos tokens de autenticação JWT. |
| `ALGORITHM` | Algoritmo JWT; padrão `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Validade do token em minutos; padrão `60`. |
| `PIX_KEY` | Chave do recebedor incluída no QR Code PIX. |
| `PIX_RECEIVER_NAME` | Nome incluído no código; padrão `AAPM SENAI`. |
| `PIX_RECEIVER_CITY` | Cidade incluída no código; padrão `SAO PAULO`. |

O `.env` está no `.gitignore`. Após alterar as variáveis, reinicie o servidor para carregar a configuração atualizada.

### Banco de dados

Em uma instalação nova, aplique as migrações antes de executar o seed:

```powershell
python -m alembic upgrade head
python seed.py
```

O [seed.py](seed.py) cria dados de demonstração: usuários, categorias, produtos e armários. Registros já encontrados não são recriados.

| Perfil | E-mail | Senha inicial de demonstração |
| --- | --- | --- |
| Administrador | `admin@estoque.com` | `admin123` |
| Operador | `operador@estoque.com` | `operador123` |

Altere as senhas de demonstração antes de disponibilizar o sistema para uso real. O cadastro público está desativado; novos usuários são cadastrados pelo administrador.

Para atualizar um banco existente, faça uma cópia de segurança e execute:

```powershell
python -m alembic current
python -m alembic upgrade head
```

As migrações já estão incluídas no repositório. Não é necessário executar `alembic init` nem gerar uma nova revisão para instalar o sistema. Se houver conflito entre tabelas existentes e o histórico de migrações, confira o esquema antes de alterar a versão registrada.

## Execução

```powershell
python -m uvicorn app.main:app --reload
```

Acesse [http://127.0.0.1:8000](http://127.0.0.1:8000). O parâmetro `--reload` é destinado ao desenvolvimento.

| Endereço | Tela |
| --- | --- |
| `/` | Boas-vindas sem sessão; dashboard para usuário autenticado. |
| `/auth/login` | Login. |
| `/dashboard` | Dashboard protegido por autenticação. |
| `/produtos/` | Produtos e filtros de estoque. |
| `/categorias/` | Categorias. |
| `/clientes/` | Clientes. |
| `/usuarios/` | Administração de usuários. |
| `/armarios/` | Armários e locações. |
| `/movimentacoes/` | Movimentações de estoque. |
| `/pdv/` | Ponto de venda. |
| `/pdv/historico` | Histórico de vendas. |
| `/pdv/extrato` | Extrato diário. |

Os acessos a histórico de vendas e extrato ficam dentro do PDV. O acesso às operações administrativas depende do perfil da conta.

## Pagamentos no PDV

Informe os valores de débito e crédito no carrinho. Use os botões de dinheiro e PIX para abrir suas respectivas telas. O resumo mostra total, valor pago e saldo restante.

A soma dos valores deve fechar exatamente o total da venda, após o desconto de associado. O sistema bloqueia valores insuficientes ou excedentes tanto no JavaScript quanto no servidor. O desconto de associado está definido em `DESCONTO_ASSOCIADO`, no [controlador do PDV](app/controllers/pdv_controller.py), atualmente em 10%.

### Dinheiro

O dinheiro cobre o saldo restante após as outras formas de pagamento. A tela oferece duas opções: informar o troco que o cliente receberá ou indicar que não haverá troco. O troco não é somado ao valor pago pela venda.

### PIX

O sistema gera localmente um QR Code e um código copia e cola para a chave configurada, sem enviar a chave a um serviço externo de geração de imagens.

**A confirmação de recebimento é manual.** O operador deve conferir o crédito no aplicativo do banco e marcar a confirmação antes de registrar o PIX. A venda com PIX sem essa confirmação é bloqueada no servidor. Essa marcação não equivale a uma consulta bancária: não há integração com API de banco ou webhook para validar automaticamente o recebimento.

O botão **X** cancela o PIX e retira seu valor do pagamento. Confira sempre o destinatário e o valor no aplicativo bancário antes de transferir.

### Registro dos pagamentos

As formas de pagamento e seus valores são salvos por venda e aparecem no histórico, extrato e comprovante. Vendas anteriores à inclusão desse registro exibem **Não informado**.

## Testes

Execute a suíte completa:

```powershell
python -m pytest tests -q -p no:cacheprovider
```

A suíte usa banco SQLite em memória e não altera o `estoque.db`. Ela cobre autenticação, permissões, cadastros, paginação, estoque, reservas, vendas, pagamentos divididos, confirmação manual de PIX, geração de QR Code e migração dos pagamentos.

Os testes JavaScript são executados pelo pytest quando Node.js está instalado. Sem Node.js, os dois grupos JavaScript são indicados como ignorados. Também podem ser executados separadamente, sem instalar dependências npm:

```powershell
node --test tests/js/pdv.test.cjs tests/js/navigation.test.cjs
```

Para executar apenas os testes do PDV e PIX:

```powershell
python -m pytest tests/test_pdv_api.py tests/test_pix.py -q -p no:cacheprovider
```

Os testes JavaScript verificam a lógica com DOM simulado. A aparência, as transições no navegador e o recebimento real de uma transferência exigem conferência própria.

## Estrutura do projeto

```text
app/
  main.py             Entrada da aplicação e dashboard
  auth.py             Autenticação e permissões
  database.py         Conexão e sessões do banco
  controllers/        Rotas e regras de cada módulo
  models/             Modelos SQLAlchemy
  services/pix.py     Geração local do código e QR Code PIX
  templates/          Páginas Jinja2
  static/             CSS, JavaScript, imagens e uploads
migrations/           Histórico de migrações Alembic
tests/                Testes Python e JavaScript
seed.py               Dados iniciais de demonstração
requirements.txt      Dependências Python
```

## Problemas comuns

- **Estilo antigo após uma alteração:** atualize a página com `Ctrl + F5`.
- **Erro ao importar `qrcode`:** instale novamente o `requirements.txt` no mesmo ambiente Python usado pelo servidor.
- **Tabela ou coluna inexistente:** confira o `DATABASE_URL` e aplique `python -m alembic upgrade head` no banco correto.
- **PIX indisponível:** confira `PIX_KEY` no `.env`, reinicie o servidor e tente gerar o código novamente.
- **Sessão expirada:** entre novamente. Alterar `SECRET_KEY` também invalida os tokens emitidos com a chave anterior.
