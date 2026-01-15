# comercIA · IMEC – Assistente Clínico

Projeto React/Vite + Tailwind/shadcn para o assistente da clínica IMEC, desenvolvido pela comercIA.

## Requisitos
- Node.js 18+
- npm

## Desenvolvimento
```sh
npm install
npm run dev
```
O preview abre em `http://localhost:5173` (ou porta configurada em `vite.config.ts`).

## Build e preview estático
```sh
npm run build
npm run preview
```

## Tecnologias
- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (funções e storage)

## Notas de configuração
- APIs de IA: configure `AI_API_URL` e `AI_API_KEY` nas funções Supabase.
- Ajuste variáveis de ambiente conforme o deploy escolhido (ex.: Vercel, Netlify ou Supabase Functions).
