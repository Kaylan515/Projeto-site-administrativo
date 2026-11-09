# AAPM SENAI — Sistema de gestão

Aplicação web para gerenciar produtos, estoque, categorias, clientes, usuários, armários e vendas da AAPM SENAI. Desenvolvida com FastAPI, SQLAlchemy, Jinja2 e JavaScript, com tema escuro, fundo interativo e transições entre páginas.

## Funcionalidades

- Dashboard com indicadores e produtos com estoque baixo: de 1 a 5 unidades, excluindo produtos sem estoque.
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

## Perfis e permissões

As permissões são verificadas nas rotas do servidor, além da exibição dos itens no menu.

| Operação | Administrador | Operador |
| --- | --- | --- |
| Consultar dashboard, produtos e detalhes dos produtos | Sim | Sim |
| Criar, editar e desativar produtos | Sim | Não |
| Gerenciar categorias, clientes e usuários | Sim | Não |
| Consultar armários e históricos de reservas | Sim | Sim |
| Cadastrar, editar, alugar, liberar ou desativar armários | Sim | Não |
| Consultar a listagem geral de movimentações | Sim | Não |
| Registrar movimentação e consultar histórico de um produto | Sim | Sim |
| Realizar vendas e consultar histórico, extrato e comprovantes | Sim | Sim |

O administrador não pode desativar a própria conta pela opção de alternar status. Na edição de um usuário, deixar a senha vazia mantém a senha anterior.

## Operação dos módulos

### Produtos e estoque

A listagem de produtos é única. Os filtros de nome, categoria, variação e estoque alteram os resultados dessa mesma tela.

- **Todos os estoques:** inclui os produtos ativos com saldo positivo ou zerado.
- **Estoque baixo:** inclui somente produtos ativos com **1 a 5 unidades**. Produtos com zero unidades não entram nesse indicador.
- **PDV:** mostra apenas produtos ativos com estoque maior que zero.
- **Desativação:** retira o produto da listagem ativa sem apagar a venda já registrada.

A coluna de estoque mostra a quantidade disponível de cada produto. Quando não houver resultado para os filtros, use **Limpar** ou **Mostrar todos os produtos**.

As imagens de produtos são armazenadas em `app/static/uploads/`. As extensões aceitas pelo upload são `.jpg`, `.jpeg`, `.png` e `.webp`. Inclua essa pasta nas cópias de segurança; guardar somente o banco não preserva as imagens.

### Movimentações

Uma entrada aumenta o estoque; uma saída reduz o estoque. A quantidade deve ser maior que zero, e uma saída não pode superar a quantidade disponível.

O histórico por produto mostra entradas e saídas. As vendas do PDV também reduzem o estoque, mas os registros da venda ficam nas tabelas de vendas e itens; não se deve assumir que toda venda cria uma movimentação manual.

### Clientes e associados

O cliente pode ser identificado no carrinho antes de fechar a venda. Quando estiver cadastrado como associado ativo, o desconto configurado será aplicado ao total. Uma venda também pode ser feita sem identificação de cliente.

A matrícula, quando informada, não pode ser duplicada. O cadastro de clientes e a alteração do vínculo de associado são operações administrativas.

### Armários

O fluxo de locação é:

1. Cadastrar o número e a localização do armário.
2. Selecionar um armário disponível.
3. Informar o nome do locatário e o semestre.
4. Confirmar a locação.
5. Liberar o armário ao encerrar o uso.

A reserva fica no histórico após a liberação. Não é permitido alugar novamente um armário já ocupado nem desativá-lo enquanto estiver alugado.

## Exemplo de venda com pagamento dividido

Para uma venda de **R$ 100,00**:

1. Informe **R$ 40,00** em débito.
2. Abra a opção **Dinheiro**: o saldo em dinheiro será **R$ 60,00**.
3. Se o cliente entregar R$ 80,00, escolha **Informar troco a receber** e digite **R$ 20,00**.
4. Registre o dinheiro e confira o resumo.
5. Confirme a venda.

A soma registrada na venda será R$ 40,00 em débito e R$ 60,00 em dinheiro. Os R$ 20,00 de troco não aumentam o valor da venda.

Para dividir entre cartão e PIX, informe primeiro a parcela do cartão e gere o QR Code para o saldo restante. O valor do PIX também pode ser ajustado antes de gerar o código. Se o valor for alterado, gere outro QR Code e confira novamente o recebimento correspondente.

**Gerar ou copiar um QR Code não confirma o pagamento.** Somente registre o PIX após conferir o crédito no banco. A aplicação ainda não faz conciliação automática.

As parcelas de pagamento são armazenadas em centavos inteiros. O servidor recalcula o total usando os preços do banco, verifica o estoque e compara a soma dos pagamentos antes de salvar.

## Histórico, extrato e comprovante

- **Histórico de vendas:** consulta vendas anteriores com filtros de cliente, busca e período, além de ordenação e paginação.
- **Extrato:** resume quantidade de vendas, total bruto, descontos e total líquido do dia.
- **Comprovante:** mostra os itens e as formas de pagamento da venda; possui opção de impressão.

O extrato usa a data local do processo que executa o servidor. Configure o relógio e o fuso horário do ambiente de execução para que o fechamento diário corresponda ao horário de operação.

O registro histórico guarda o nome e o preço unitário do item vendido, os totais da venda e os valores por forma de pagamento. Alterar depois o preço do cadastro não recalcula uma venda anterior.

## Cópias de segurança e atualização

Para o SQLite local, pare o servidor antes de copiar o arquivo. O exemplo abaixo considera o `DATABASE_URL=sqlite:///./estoque.db`; se a configuração apontar para outro arquivo, use o caminho correspondente.

```powershell
New-Item -ItemType Directory -Path .\backups -Force
$backupStamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item -LiteralPath .\estoque.db -Destination ".\backups\estoque-$backupStamp.db"
```

Preserve também:

- `app/static/uploads/`, para as imagens.
- A configuração do ambiente, em local privado, sem publicar segredos.
- A versão do código e das migrações que corresponde ao backup.

Antes de atualizar uma instalação:

1. Pare o servidor e faça o backup.
2. Instale as dependências atualizadas.
3. Confira a revisão do banco e aplique as migrações.
4. Execute os testes.
5. Inicie o servidor e confira login, dashboard, produtos e PDV.

```powershell
python -m pip install -r requirements.txt
python -m alembic current
python -m alembic upgrade head
python -m pytest tests -q -p no:cacheprovider
python -m uvicorn app.main:app --reload
```

Para restaurar um backup, pare o servidor, preserve uma cópia do banco atual e recupere o arquivo e as imagens correspondentes. Confira a compatibilidade entre a revisão do banco restaurado e o código antes de voltar a operar. Não use `alembic stamp` para contornar um erro sem verificar o esquema existente.

## Desenvolvimento e diagnóstico

O ponto de entrada documentado é `app.main:app`. Execute o servidor a partir da raiz do projeto, pois os caminhos de templates, arquivos estáticos, uploads e banco SQLite são relativos ao diretório de trabalho.

A documentação HTTP gerada pelo FastAPI está disponível em:

- [Swagger UI](http://127.0.0.1:8000/docs)
- [ReDoc](http://127.0.0.1:8000/redoc)

Algumas rotas recebem formulários e retornam páginas HTML ou redirecionamentos; a documentação HTTP não substitui o fluxo das telas.

Para executar testes de um módulo específico:

```powershell
python -m pytest tests/test_auth.py -q -p no:cacheprovider
python -m pytest tests/test_armarios_api.py -q -p no:cacheprovider
python -m pytest tests/test_regressoes.py -q -p no:cacheprovider
```

Para encerrar no primeiro teste com falha e mostrar mais detalhes:

```powershell
python -m pytest tests -x -vv -p no:cacheprovider
```

Ao investigar um erro interno, confira a saída do terminal do Uvicorn e registre a tela, a ação e o horário em que ele ocorreu. Não inclua senhas, tokens, o conteúdo do `.env` ou dados de clientes em relatos públicos.

### Outras situações comuns

| Situação | O que conferir |
| --- | --- |
| Porta 8000 ocupada | Inicie com `python -m uvicorn app.main:app --reload --port 8001` e acesse a porta correspondente. |
| Produtos não aparecem no PDV | Confira se estão ativos e com estoque maior que zero. |
| Indicador de estoque baixo mostra zero | Não há produtos ativos com 1 a 5 unidades; produtos zerados não entram nessa contagem. |
| Botão de finalizar está desabilitado | Confira os valores por forma, o saldo restante e a confirmação manual do PIX. |
| QR Code não aparece | Confira a chave configurada, o valor da parcela, o ambiente Python e a instalação de `qrcode`. |
| Código PIX não copia automaticamente | Use o campo copia e cola para selecionar e copiar manualmente. |
| Imagem não aparece após restaurar o banco | Recupere também a pasta de uploads do mesmo backup. |
| Testes JavaScript aparecem como ignorados | Instale Node.js e confira `node --version`. |
| Animações não aparecem | Confira se o sistema operacional ou navegador está com movimento reduzido habilitado. |
