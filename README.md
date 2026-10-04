# Vida Universitária

Versão "de verdade" do protótipo: um app React real, com login de usuário
e dados salvos no Supabase (o banco que você já configurou), em vez do
armazenamento local do artifact.

## O que já vem pronto

- O arquivo `.env` já está preenchido com a URL e a chave pública (anon)
  do seu projeto Supabase. Essa chave é segura para ficar exposta no
  frontend — quem protege os dados de cada usuário são as políticas de
  RLS que você já criou no `supabase-schema.sql`.
- Todas as telas do protótipo (Hoje, Inbox, Agenda, Desempenho,
  Biblioteca, Foco, Secretária, Minha Rotina) já estão implementadas
  aqui, conectadas às tabelas reais.
- Agora existe uma tela de **login/cadastro** — sem ela, o Supabase não
  saberia de quem são os dados.

## O que muda em relação ao artifact: a chave de IA

Dentro do artifact do Claude, as chamadas de IA funcionavam "de graça",
sem chave, porque a Anthropic gerencia isso só dentro do ambiente do
Claude.ai. **Fora dali, isso não existe mais.** Este projeto chama uma
Edge Function do Supabase (`supabase/functions/ai-proxy`), que por sua
vez chama a **API da Groq** (rápida e com camada gratuita) usando **a
sua própria chave de API**, guardada em segredo no servidor (nunca no
navegador).

Ou seja: para usar a Inbox, o Modo Professor, o Quiz e a Secretária
neste app real, você precisa:

1. Criar uma conta em [console.groq.com](https://console.groq.com) e
   gerar uma chave de API — os limites e condições atuais da camada
   gratuita ficam no próprio console, não vou chutar número aqui, já
   que isso muda com frequência.
2. Configurar essa chave como segredo no Supabase (passo a passo abaixo).

A função usa o modelo `openai/gpt-oss-120b`, que é o recomendado hoje
pela própria Groq para uso geral. Se um dia ele for descontinuado
(acontece de tempos em tempos com modelos hospedados na Groq), troque a
constante `GROQ_MODEL` em `supabase/functions/ai-proxy/index.ts` pelo
substituto indicado em console.groq.com/docs/models.

## Novidade: Inbox multimodal (PDF, foto, áudio)

Além de texto digitado, a Inbox agora aceita três tipos de arquivo, cada
um convertido em texto e jogado no MESMO classificador que já existe:

- **PDF** — o texto é extraído no próprio navegador (não precisa de IA
  para isso). Não funciona para PDFs que são só uma foto escaneada —
  nesse caso, envie como **Foto** em vez de PDF.
- **Foto** — vai para um modelo de visão da Groq, que descreve/transcreve
  o conteúdo (print de slide, foto de quadro, anotação à mão, etc.).
- **Áudio** — vai para transcrição via Whisper na Groq. **Importante:**
  por enquanto é upload de um arquivo de áudio já gravado (ex: pelo
  gravador de voz do celular), não gravação ao vivo dentro do app —
  isso fica para uma próxima etapa.

Depois que o texto é extraído, ele aparece na caixa de texto pra você
revisar/editar antes de clicar em "Interpretar" — exatamente como já
funcionava para texto digitado. O arquivo original fica guardado na
Biblioteca, dentro da disciplina, com um link para abrir de novo depois.

Isso exige dois passos extras de configuração antes de funcionar (veja
abaixo): rodar uma nova migração no banco e publicar a Edge Function
atualizada.

## Novidade: Compromisso como Espaço de Trabalho (Fase A)

A Biblioteca agora tem duas seções:

- **Compromissos** — cada prova/trabalho/entrega vira um cartão clicável.
  Clicar abre um espaço de trabalho dedicado: anotações, PDFs, fotos,
  áudios, resumo e quiz **daquele compromisso específico**, tudo
  editável a qualquer momento (adicione uma anotação nova quando o
  professor avisar algo, apague o que ele disser que não cai mais).
- **Por disciplina** — o conteúdo geral, não ligado a nenhuma prova
  específica, continua aparecendo aqui como antes.

Isso exige rodar mais uma migração no banco (veja abaixo) — ela é
aditiva, não apaga nada do que você já tem.

### 4d. Rodar a migração da Fase D (Compromissos de Rotina)

No SQL Editor do Supabase, cole e rode o conteúdo de
`supabase-migration-fase-d.sql`. Ela migra automaticamente suas aulas
fixas existentes para o novo formato — nada precisa ser recadastrado,
e a tabela antiga (`aulas_fixas`) continua intacta como backup, só não
é mais usada pelo app.

### 4e. Rodar a migração da Fase B (Modo Foco ligado a compromissos)

No SQL Editor do Supabase, cole e rode o conteúdo de
`supabase-migration-fase-b.sql`. Ela só adiciona uma coluna nova —
nada existente é afetado.

### 4f. Fase E — Secretária com poder de ação (sem migração nova)

A Fase E não precisa de nenhuma migração — a tabela `routine_exceptions`
já foi criada na Fase D. Você só precisa **republicar a Edge Function**,
já que ela ganhou suporte a "tool calling":

```bash
supabase functions deploy ai-proxy
```

A partir daqui, a Secretária consegue criar, editar e excluir
compromissos recorrentes, e criar alterações pontuais (só para uma
data específica) sem mexer na rotina padrão — tudo com checagem de
conflito de horário antes de qualquer gravação.

### 4g. Migração: Metas de Estudo

No SQL Editor do Supabase, cole e rode o conteúdo de
`supabase-migration-metas-estudo.sql`.

## Passo a passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar localmente

```bash
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).
Crie sua conta pela própria tela de login do app — isso cria seu usuário
real no Supabase.

> As funcionalidades com IA (Inbox, Resumo, Quiz, Modo Professor,
> Secretária) só vão funcionar depois do passo 3 e 4 abaixo. O resto do
> app (Agenda, Rotina, Foco, marcar blocos como concluídos) já funciona
> sem isso.

### 3. Instalar a CLI do Supabase e conectar ao seu projeto

```bash
npm install -g supabase
supabase login
supabase link --project-ref cecbttzofecrekgaduip
```

(`cecbttzofecrekgaduip` é o identificador do seu projeto, tirado da URL
que você me passou.)

### 4. Configurar sua chave da Groq e publicar a Edge Function

```bash
supabase secrets set GROQ_API_KEY=sua-chave-groq-aqui
supabase functions deploy ai-proxy
```

A partir daqui, a Inbox, o Resumo, o Quiz, o Modo Professor e a
Secretária devem funcionar também em produção.

Se você já tinha feito o deploy antes (ou seja, já tem a Edge Function
publicada) e está só adicionando o Inbox multimodal agora, rode de novo
o `supabase functions deploy ai-proxy` — o arquivo mudou para suportar
foto e áudio, então precisa republicar.

### 4b. Rodar a nova migração do banco (Inbox multimodal)

No SQL Editor do Supabase, cole e rode o conteúdo de
`supabase-migration-materials.sql` (é adicional ao `supabase-schema.sql`
que você já rodou — não precisa rodar aquele de novo). Isso cria a
tabela `materials` e o espaço de armazenamento de arquivos, com as
mesmas políticas de privacidade das outras tabelas (cada usuário só
acessa os próprios arquivos).

### 4c. Rodar a migração da Fase A (Compromisso como Espaço de Trabalho)

No SQL Editor do Supabase, cole e rode o conteúdo de
`supabase-migration-fase-a.sql`. Ela liga materiais, anotações,
resumos e tentativas de quiz/Modo Professor a um compromisso
específico (opcionalmente — conteúdo geral da disciplina continua
funcionando normalmente).

Se você apagar um compromisso na Agenda, as anotações e materiais que
estavam ligados a ele NÃO são apagados — eles só voltam a aparecer como
conteúdo geral da disciplina, na outra seção da Biblioteca.

### 5. Publicar o app para valer (opcional, quando quiser testar com colegas)

1. Suba esta pasta para um repositório no GitHub.
2. Crie uma conta em [vercel.com](https://vercel.com) e importe o repositório.
3. Nas configurações do projeto na Vercel, adicione as mesmas duas
   variáveis do seu `.env` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
4. Clique em "Deploy". Você recebe um link público para compartilhar.

## Estrutura do projeto

```
src/
  lib/
    supabaseClient.js   → conexão com o Supabase
    ai.js               → chama a Edge Function de IA
    aiHelpers.js         → os "prompts" usados por cada funcionalidade
    db.js                → todas as leituras/escritas nas tabelas
    utils.js             → planejador automático e funções de data
  components/
    ui.jsx               → cores, tipografia e peças visuais reutilizáveis
    Auth.jsx              → tela de login/cadastro
    Tabs.jsx              → as 8 abas do app
  App.jsx                 → carrega os dados do usuário e organiza tudo
supabase/
  functions/ai-proxy/     → a Edge Function que protege sua chave de IA
```

## Se algo der errado

- **"Failed to fetch" ou tela em branco**: confira se `npm install`
  terminou sem erros e se o `.env` está na raiz do projeto (não dentro de `src`).
- **Login funciona mas os dados não aparecem**: confira no painel do
  Supabase, em Table Editor, se as tabelas realmente têm as linhas
  esperadas — e se a confirmação de e-mail está pedindo para você clicar
  em um link antes de liberar o login.
- **IA não responde**: normalmente é a Edge Function sem o segredo
  configurado (passo 4) ou sem deploy feito ainda.
