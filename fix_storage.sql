-- 1. Cria o bucket 'materials' se ele não existir
insert into storage.buckets (id, name, public) 
values ('materials', 'materials', false) 
on conflict (id) do nothing;

-- 2. Habilita as políticas de segurança na tabela de arquivos
alter table storage.objects enable row level security;

-- 3. Permite que o usuário faça upload de seus próprios arquivos
create policy "Permitir upload proprio" 
on storage.objects for insert 
with check ( bucket_id = 'materials' and auth.uid() = owner );

-- 4. Permite que o usuário leia seus próprios arquivos
create policy "Permitir leitura propria" 
on storage.objects for select 
using ( bucket_id = 'materials' and auth.uid() = owner );

-- 5. Permite que o usuário delete seus próprios arquivos
create policy "Permitir delete proprio" 
on storage.objects for delete 
using ( bucket_id = 'materials' and auth.uid() = owner );
