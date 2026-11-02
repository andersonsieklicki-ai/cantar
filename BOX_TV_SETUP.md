# Integração do Assistente Vocal com o armazenamento do TV Box

## O que esta parte faz

- O painel administrativo envia o arquivo diretamente ao backend do TV Box com `POST /api/box-music/upload`.
- O backend grava em disco, por padrão em `storage/music-library/<musicId>/<tipo>/`.
- O backend valida o token Firebase e exige o administrador principal com e-mail verificado ou `admins/{uid}.ativo == true`.
- O Firestore recebe a URL e o caminho devolvidos pelo servidor; as músicas e o progresso continuam no Firestore.
- O stream oferece suporte a `Range` para reprodução e busca no áudio.

## Atenção à rede

O endereço inicial configurado no painel é `https://mxqpro-h313-1.tail8b8cce.ts.net`. Esse é um endereço privado do Tailscale. A pessoa que envia e as cantoras que reproduzem os arquivos precisam estar conectadas ao mesmo Tailnet. O site Vercel continuará público, mas os arquivos do TV Box não serão acessíveis a quem estiver fora da VPN.

Para cantoras sem Tailscale, será necessário publicar apenas a API de mídia por um túnel HTTPS/reverse proxy com autenticação e limites. Não habilite Tailscale Funnel nem exponha o servidor diretamente sem revisar o controle de acesso.

## Instalação no TV Box

O pacote inclui `box-tv-music-router.js`, mas a rota ainda precisa ser montada no `backend/server.js` existente. Não substitua esse arquivo inteiro: o projeto atual já tem rotas de upload e streaming que devem ser preservadas.

1. Copie `box-tv-music-router.js` para `/automatiza/assistente-vocal/backend/`.
2. No diretório do backend, instale `multer` se ainda não existir: `npm install multer`.
3. No `server.js`, reutilize a instância Firebase Admin que o backend já inicializa e acrescente o require/mount abaixo, depois da criação do Express `app` e antes de iniciar o servidor:

```js
const path = require('path');
const { createBoxMusicRouter } = require('./box-tv-music-router');
// Reutilize a variável admin já inicializada pelo backend; não inicialize outra vez.
app.use('/api/box-music', createBoxMusicRouter({
  admin,
  storageDir: path.join(__dirname, '../storage/music-library'),
  publicBaseUrl: process.env.BOX_MUSIC_PUBLIC_URL,
  allowedOrigins: (process.env.APP_ORIGINS || 'https://cantar-kohl.vercel.app').split(',')
}));
```

Se a variável de Firebase Admin no servidor tiver outro nome, passe essa variável existente no lugar de `admin`. Se o servidor não usar Express, esta integração precisa ser adaptada à implementação real.

4. Gere uma chave de assinatura forte no próprio TV Box: `openssl rand -hex 32`.
5. Adicione ao `.env` do backend (não ao Vercel e não ao HTML):

```env
BOX_MUSIC_PUBLIC_URL=https://mxqpro-h313-1.tail8b8cce.ts.net
BOX_MEDIA_SIGNING_SECRET=COLE_AQUI_A_CHAVE_GERADA_NO_TV_BOX
```

6. Garanta a pasta persistente e permissões para o usuário do serviço:

```bash
mkdir -p /automatiza/assistente-vocal/storage/music-library
chown -R anderson:anderson /automatiza/assistente-vocal/storage/music-library
```

7. Revise CORS: `APP_ORIGINS` deve incluir o domínio Vercel exato, por exemplo `https://cantar-kohl.vercel.app`.
8. Valide o backend e reinicie o serviço somente depois de confirmar a integração no `server.js`.

## No painel administrativo

- Abra `/admin.html`.
- No campo “Servidor de arquivos — TV Box”, mantenha a URL Tailscale ou informe o endpoint público HTTPS autorizado.
- Envie a música original, instrumental e referências vocais separadamente.
- O sistema salva o caminho e a URL retornados pelo TV Box no documento da música no Firestore.

## Limitações importantes

- A API recebe arquivos por disco, sem carregar todo o áudio na RAM; o limite padrão é 200 MB por arquivo.
- O motor de playback do navegador ainda decodifica as faixas na memória e possui limite interno de 80 MB por faixa / 140 MB somadas. Para arquivos maiores, gere uma cópia de reprodução comprimida.
- O TV Box H313 tem cerca de 1 GB de RAM. Ele pode armazenar e transmitir arquivos, mas não é o equipamento recomendado para executar Demucs ou separação vocal pesada. Use outro worker para a separação e copie o resultado para o armazenamento do TV Box.
- A URL de reprodução é assinada por 365 dias. Se a chave de assinatura for alterada, será necessário regenerar as URLs no Firestore ou reenviar as faixas.
- A separação de uma música mixada normalmente produz instrumental e voz combinada; não separa automaticamente Silvane e Marla em duas vozes independentes.

## O que preciso para finalizar a integração sem risco

O módulo está pronto, mas o `server.js` real não foi incluído neste pacote. Envie `/automatiza/assistente-vocal/backend/server.js` para que a montagem seja feita no ponto correto, preservando as rotas atuais e sem reiniciar nada às cegas.
