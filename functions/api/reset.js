/**
 * POST /api/reset
 * Resets the days counter back to zero by writing today's date to KV.
 *
 * Request body (JSON): { "password": "<admin password>" }
 *
 * The admin password must be set as a Cloudflare Pages secret:
 *   npx wrangler pages secret put ADMIN_PASSWORD
 *
 * Returns 401 if the password is missing or incorrect.
 * Returns 400 if the request body is not valid JSON.
 */
export async function onRequestPost({ env, request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { password } = body ?? {};

  // Constant-time comparison is overkill for a hobby project but we at least
  // avoid leaking whether ADMIN_PASSWORD is configured via different error paths.
  if (!password || !env.ADMIN_PASSWORD || password !== env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();
  await env.COUNTER_KV.put('resetDate', now);

  return Response.json({ success: true, resetDate: now });
}
