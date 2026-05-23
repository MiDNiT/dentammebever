/**
 * Cloudflare Pages Function: OAuth-initiering for Decap CMS
 * Rute: /api/auth
 *
 * Åpner GitHub-innloggingssiden med riktige parametere.
 * Klienthemmeligheter leses fra miljøvariabler satt i Cloudflare Pages.
 */
export async function onRequest(context) {
  const { env, request } = context;

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response('Mangler GITHUB_CLIENT_ID i miljøvariabler.', { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/callback`;

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'repo,user');

  return Response.redirect(githubAuthUrl.toString(), 302);
}
