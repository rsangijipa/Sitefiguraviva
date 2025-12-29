
# Gerenciamento de Cursos e Galeria (Local vs Online)

Este sistema permite gerenciar o conteúdo do site (Galeria e Cursos) através do Painel Admin.

## Workflow (Fluxo de Trabalho)

### 1. Desenvolvimento Local (No seu computador)

Ao editar ou criar cursos/fotos pelo Admin (`localhost:5001/admin`):

- O sistema **salva automaticamente** os arquivos nas pastas `public/images` ou `public/cursos`.
- Ele atualiza os arquivos `.txt` (metadata) e `.json` (dados do site).
- Você verá as alterações refletidas imediatamente no site local.

### 2. Publicação Online (Vercel)

O Vercel é um sistema "Read-Only" (Somente Leitura) em produção. Isso significa que **alterações feitas pelo Admin Online NÃO salvam arquivos permanentemente**.

**Para atualizar o site online:**

1. Faça as edições no seu **ambiente local** (como feito no passo 1).
2. Verifique se as pastas `public/cursos` e `public/images` contêm os novos arquivos.
3. Execute os comandos do Git para enviar as alterações:

```bash
git add .
git commit -m "Atualizando cursos e galeria"
git push
```

1. O Vercel irá detectar o `git push` e fará o deploy automático da nova versão com o conteúdo atualizado.

---
**Recapitulando:**

- **Edite** no Localhost.
- **Sincronize** com Git.
- **Visualize** no Vercel.
