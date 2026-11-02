# Separação automática do playback — contrato do backend

## Estado desta entrega

O painel administrativo já permite enviar a música original e solicitar a separação por IA. **O endpoint `/api/audio/separar` não faz parte do backend atualmente em produção.** Portanto, o botão fica funcional como integração somente depois que o serviço abaixo for implementado e publicado em um servidor acessível por HTTPS.

O HTML não executa Demucs/UVR. A separação de fontes exige um modelo de IA e processamento pesado. O TV Box H313 com aproximadamente 1 GB de RAM não é adequado para executar essa etapa com segurança. Use uma VM/worker com memória e CPU/GPU compatíveis ou serviço dedicado.

## Requisição esperada

`POST https://SEU-BACKEND/api/audio/separar`

Cabeçalhos:

```http
Authorization: Bearer <Firebase ID token>
Content-Type: application/json
```

Corpo:

```json
{
  "musicId": "ID_DA_MUSICA",
  "originalPath": "musicas/ID_DA_MUSICA/originais/arquivo.mp3",
  "originalUrl": "URL_DO_ARQUIVO_ORIGINAL",
  "outputPrefix": "musicas/ID_DA_MUSICA/separados"
}
```

## Resposta síncrona de sucesso

`HTTP 200`

```json
{
  "status": "completed",
  "engine": "demucs-ou-modelo-equivalente",
  "playbackUrl": "URL_DE_DOWNLOAD_DO_INSTRUMENTAL",
  "playbackPath": "musicas/ID_DA_MUSICA/separados/instrumental.mp3",
  "vocalUrl": "URL_DE_DOWNLOAD_DA_VOZ_COMBINADA",
  "vocalPath": "musicas/ID_DA_MUSICA/separados/vocais.mp3"
}
```

O painel salva `playbackUrl` e `playbackPath` na música para carregar o instrumental. A voz isolada é registrada como `vocalUrl`/`vocalPath`, mas não deve ser automaticamente tratada como voz principal ou segunda voz: normalmente a separação entrega uma faixa vocal combinada.

## Resposta assíncrona opcional

`HTTP 202`

```json
{ "status": "processing", "jobId": "ID_DO_PROCESSAMENTO" }
```

A tela registra o job como `processando`, mas ainda não consulta automaticamente o `jobId`. Para operação assíncrona completa, implemente também `GET /api/audio/separar/:jobId` e depois amplie a tela para fazer polling e atualizar a música quando o job concluir. Para o primeiro deploy, prefira resposta síncrona se a duração e os limites do servidor permitirem.

## Pipeline recomendado

1. Validar o ID token com Firebase Admin (`verifyIdToken`).
2. Consultar `admins/{uid}` e exigir `ativo == true`.
3. Validar que `originalPath` pertence a `musicas/{musicId}/originais/`; não aceitar caminho arbitrário enviado pelo browser.
4. Verificar extensão, MIME real, tamanho, duração e integridade do arquivo.
5. Buscar o original no Firebase Storage pelo Admin SDK.
6. Executar modelo de separação de fontes em worker apropriado.
7. Exportar o instrumental em WAV de alta resolução para arquivo mestre e, se necessário, criar MP3/AAC para streaming. Não reduzir a taxa de amostragem sem necessidade.
8. Salvar instrumental e voz isolada em `musicas/{musicId}/separados/` no Storage.
9. Retornar URLs e caminhos correspondentes e registrar status, modelo, parâmetros e data do processamento.
10. Aplicar CORS somente ao(s) domínio(s) oficiais do aplicativo. Nunca registrar o token Firebase ou credenciais nos logs.

## Qualidade e aprovação

A separação por IA estima as fontes a partir de uma mixagem final. Ela pode deixar resíduos vocais no instrumental, remover parte de instrumentos, criar artefatos ou alterar transientes. Não equivale a receber a sessão multipista original nem garante qualidade de gravadora.

O administrador deve ouvir o playback, comparar com a gravação original e aprovar manualmente antes de publicar. Para referências independentes de voz principal e segunda voz, use stems separados fornecidos pela produção ou gravações isoladas das cantoras. Não divida automaticamente a faixa vocal combinada em duas pessoas e trate o resultado como correto.

## Limites de operação

- Não coloque `UPLOAD_TOKEN` ou outra chave secreta no `index.html` ou no `admin.html`.
- A API deve aceitar somente token Firebase válido e usuário com documento `admins/{uid}` ativo.
- Use limite de tamanho/duração e fila de processamento para impedir abuso e esgotamento de memória.
- O backend atual de upload/streaming em `127.0.0.1:3018` não fornece este endpoint por padrão e, por estar atrás do Tailscale, não é acessível pelo Vercel público sem um endpoint HTTPS exposto de forma segura.
