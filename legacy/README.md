# Versão anterior (v1)

Código da primeira versão do Manna, preservado apenas como referência. **Não faz parte do build.**

- `app/api/`: rotas de API com MongoDB, JWT e Auth0 (login, cadastro, conteúdo, upload, perfil).
- `components/`, `hooks/`, `lib/`: interface e utilitários da v1.

A v2 é um site estático (GitHub Pages) e usa a camada de serviço em `lib/api.js`. Se quiser voltar a ter um backend, estas rotas podem servir de ponto de partida. Quando não forem mais úteis, esta pasta pode ser apagada.
