/**
 * GET /api/counter
 * Returns the number of days since the last reset and the reset timestamp.
 * The reset date is stored in Cloudflare KV under the key "resetDate".
 */
export async function onRequestGet({ env }) {
  let resetDateStr = await env.COUNTER_KV.get('resetDate');

  if (!resetDateStr) {
    // First ever request — initialise with today
    resetDateStr = new Date().toISOString();
    await env.COUNTER_KV.put('resetDate', resetDateStr);
  }

  const resetDate = new Date(resetDateStr);
  const days      = Math.floor((Date.now() - resetDate.getTime()) / 86_400_000);

  return Response.json({ days, lastReset: resetDateStr });
}
