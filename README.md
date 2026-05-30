# Aureon Systems - Levantamento de Projeto

Pagina profissional de levantamento de requisitos para clientes da Aureon Sistemas preencherem antes da etapa de orcamento.

## Estrutura

- `index.html`: estrutura da pagina e formulario.
- `styles.css`: layout responsivo e identidade visual.
- `script.js`: validacao, rascunho local e armazenamento de envios em `localStorage`.
- `assets/`: logo e imagem de fundo.
- `vercel.json`: configuracao basica para hospedagem na Vercel.

## Hospedagem na Vercel

1. Importe este repositorio na Vercel.
2. Framework preset: `Other`.
3. Build command: deixe vazio ou use `npm run build`.
4. Output directory: deixe vazio ou use `.`.

O projeto e estatico e nao depende de backend para funcionar. A integracao futura com Supabase pode ser feita no ponto indicado em `script.js`, dentro da funcao `saveSubmission`.

