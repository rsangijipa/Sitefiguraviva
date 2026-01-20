-- Execute este script no SQL Editor do seu Dashboard Supabase para garantir que a tabela da galeria suporte todas as funcionalidades implementadas.

-- 1. Adicionar coluna 'category' se ela não existir
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';

-- 2. Garantir que as políticas de RLS estão corretas para edição
-- Política para UPDATE (permitir apenas usuários autenticados)
DROP POLICY IF EXISTS "Authenticated users can update gallery items" ON gallery;
CREATE POLICY "Authenticated users can update gallery items" ON gallery 
FOR UPDATE TO authenticated 
USING (true)
WITH CHECK (true);

-- 3. Opcional: Converter tags para array se preferir (atualmente tratadas como string separada por vírgula para compatibilidade)
-- ALTER TABLE gallery ALTER COLUMN tags TYPE text[] USING string_to_array(tags, ',');
