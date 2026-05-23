/**
 * Cloudflare Pages Function: OAuth-tilbakeringing for Decap CMS
 * Rute: /api/callback
 *
 * GitHub sender brukeren hit med en midlertidig kode. Vi bytter
 * koden mot et tilgangstoken og sender det tilbake til CMS-vinduet
 * via window.postMessage (standarden Decap CMS forventer).
 */
export async function onRequest(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return htmlResponse('Feil: Mangler autoriseringskode fra GitHub.', true);
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return htmlResponse('Feil: Mangler miljøvariabler (GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET).', true);
  }

  // Bytt kode mot token
  let tokenData;
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    tokenData = await tokenResponse.json();
  } catch (err) {
    return htmlResponse(`Nettverksfeil mot GitHub: ${err.message}`, true);
  }

  if (tokenData.error) {
    return htmlResponse(`GitHub-feil: ${tokenData.error_description || tokenData.error}`, true);
  }

  const token = tokenData.access_token;
  const provider = 'github';

  // Decap CMS forventer dette postMessage-formatet i popup-vinduet
  return htmlResponse(token, false, provider);
}

/**
 * Genererer en HTML-side som kommuniserer resultatet til Decap CMS
 * via window.postMessage, slik CMS-standarden krever.
 */
function htmlResponse(tokenOrError, isError, provider = 'github') {
  const message = isError
    ? `authorization:${provider}:error:${JSON.stringify({ message: tokenOrError })}`
    : `authorization:${provider}:success:${JSON.stringify({ token: tokenOrError, provider })}`;

  const html = `<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <title>${isError ? 'Innlogging feilet' : 'Innlogging vellykket'}</title>
</head>
<body>
  <p style="font-family:sans-serif;text-align:center;margin-top:3rem;">
    ${isError ? '❌ ' + tokenOrError : '✓ Logger inn...'}
  </p>
  <script>
    (function () {
      const msg = ${JSON.stringify(message)};
      function onMessage(e) {
        window.opener.postMessage(msg, e.origin);
      }
      window.addEventListener('message', onMessage, false);
      // Varsle CMS-vinduet om at autentisering pågår
      window.opener.postMessage('authorizing:${provider}', '*');
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: isError ? 400 : 200,
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  });
}
