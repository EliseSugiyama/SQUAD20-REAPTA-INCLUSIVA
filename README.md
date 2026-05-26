# SQUAD20-REAPTA-INCLUSIVA

Projeto acadêmico do Squad 20 (3º semestre do curso de Ciência da Computação, Universidade Católica de Brasília - UCB), desenvolvido em parceria com a Residência Porto Digital e a empresa Reapta Inclusiva.

## Sobre

Plataforma web que gera materiais visuais e insights baseados em planilhas (Excel) enviadas pelos usuários. Oferece histórico de uploads, filtros para exploração dos dados facilitando a análise e a visualização das informações extraídas automaticamente.

## Como rodar o projeto

### Requisitos

- Node.js instalado (recomenda-se Node 18+)
- npm instalado (npm 7+ para suportar workspaces)
- Uma conta e projeto Supabase configurados

### Instalação de dependências

No diretório raiz do projeto:

```bash
npm install
```

Isso instalará as dependências de ambos os workspaces:
- `apps/backend`
- `apps/frontend`

### Configuração de variáveis secretas

Crie um arquivo `.env` na raiz do repositório com as variáveis necessárias do Supabase:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ou
SUPABASE_KEY=your-anon-or-service-key
```

O backend depende dessas variáveis para conectar ao Supabase.

Veja também o arquivo `env.example` (incluso neste repositório) para um exemplo das variáveis esperadas. Recomendações de uso:

- `SUPABASE_ANON_KEY`: chave pública/anon — utilizada pelo frontend (exposta ao cliente).
- `SUPABASE_SERVICE_ROLE_KEY`: chave privilegiada — utilizada apenas pelo backend; mantenha-a em segredo e **nunca** a exponha no frontend.

### Executando localmente

#### Backend

No diretório `apps/backend/src`:

```bash
npm run dev
```

ou, a partir da raiz do projeto:

```bash
node apps/backend/src/server.js
```

#### Frontend

No diretório `apps/frontend`:

```bash
npm run dev
```

ou, a partir da raiz do projeto:

```bash
npm run dev -w apps/frontend
```

### Observações

- O frontend e o backend devem ser executados em terminais separados.
- O backend usa o arquivo `.env` da raiz.