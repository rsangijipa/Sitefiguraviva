# Compactação dos uploads de imagem

Os novos uploads do site passam por processamento no servidor com Sharp antes de serem armazenados no Supabase. Não há serviço pago adicional nem nova chave de API.

## API do painel

`POST /api/admin/images/upload`, com `Authorization: Bearer <token Supabase>` e corpo multipart:

- `file`: JPG, PNG ou WebP, até 5 MB.
- `bucket`: `course-assets`, `public-avatars` ou `public-book-covers`.
- `folder`: pasta de destino; padrão `uploads/admin`.

Exige administrador ativo, limita envios e valida o conteúdo real do arquivo. Retorna URL, caminho, nome, tamanho armazenado, bytes originais/finais e dimensões. A imagem é orientada corretamente, tem os metadados removidos e é convertida em WebP com qualidade 82, limitada a 2048 px no maior lado. Imagens pequenas não são ampliadas; transparência é preservada. Imagens animadas são rejeitadas.

O helper `uploadAdminAsset` utiliza essa API automaticamente para imagens, inclusive quando chamado como upload genérico. Em caso de falha, não envia o arquivo original diretamente ao Storage.

## Outros fluxos

- Avatares: mesma rotina, recorte de até 512 × 512 px, WebP com qualidade 85.
- Comprovantes Pix e imagens anexadas às avaliações: processamento nos endpoints existentes, mantendo JPEG/PNG para respeitar os buckets privados; limite de 2560 px e qualidade JPEG 88. PNG usa compactação sem perda na codificação. As verificações de proprietário permanecem antes do processamento.
- Helper de imagens de cursos e script de importação de capas: mesma rotina, mantendo o formato do arquivo.
- PDFs e outros anexos seguem seus fluxos existentes.

A rotina comum fica em `src/lib/image-compression.js`, com uma fachada `server-only` para o aplicativo. Ela limita o processamento a 40 milhões de pixels por imagem e verifica os limites de entrada e saída. A redução varia conforme a imagem; arquivos já pequenos ou muito otimizados podem não ficar menores após a recodificação.

As imagens existentes no Storage não são alteradas. Scripts que apenas migram arquivos existentes entre buckets não executam nova compactação.

## Verificação

Os testes utilizam imagens geradas e processadas pelo Sharp real para verificar dimensões, formato, transparência, orientação, remoção de EXIF e bytes enviados ao Storage. Os acessos ao Supabase são simulados; a implementação não modifica schemas, políticas ou arquivos remotos.
