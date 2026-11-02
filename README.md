# Assistente Vocal v3.1 — navegação guiada e biblioteca no TV Box

## Interface

- Navegação inferior fixa no estilo de aplicativo bancário: Início, Músicas, Treinar e Evolução.
- Fluxo de quatro etapas: selecionar música, escolher modalidade, definir habilidade e iniciar sessão.
- Uma ferramenta por tela para reduzir rolagem e excesso de informação.
- Layout responsivo para celular e computador.
- Mantém o login Firebase, biblioteca musical, player multifaixa, afinador, exercícios, mapa de notas, gravações, banda e avaliação.

## Objetivos de treino

- Voz principal: melodia, afinação, respiração e dicção.
- Segunda voz: independência harmônica, entradas e sustentação.
- Cantar juntas: sincronização, equilíbrio e final das frases.

O seletor de foco explica quais critérios serão trabalhados. A comparação nota a nota só funciona quando há referência musical validada pelo administrador.

## Armazenamento

- O `admin.html` agora envia áudios à API do TV Box `/api/box-music/upload`.
- O módulo backend `box-tv-music-router.js` grava no disco persistente e retorna URL assinada.
- **A rota ainda precisa ser integrada ao `backend/server.js` real**, que não foi disponibilizado para esta montagem. Consulte `BOX_TV_SETUP.md`.
- O Firestore continua guardando metadados, permissões, convites e progresso.

## Arquivos principais

- `index.html` — aplicação das alunas.
- `admin.html` — cadastro de músicas, convites e upload das faixas.
- `firebase-config.js` — configuração pública do Firebase Web.
- `box-tv-music-router.js` — módulo Express para armazenamento e streaming no TV Box.
- `BOX_TV_SETUP.md` — integração no backend e configuração de rede.
- `SEPARACAO_AUDIO.md` — separação de fontes e requisitos do worker.

## Publicação

Substitua os arquivos do site no repositório GitHub e publique na Vercel. Não publique `.env`, credenciais Firebase Admin ou `BOX_MEDIA_SIGNING_SECRET`. A API TV Box deve aceitar somente tokens Firebase de administradores ativos e somente o domínio oficial em CORS.
