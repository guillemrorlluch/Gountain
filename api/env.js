export default function handler(req, res) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  // Public tokens are safe to expose. Never expose secret/scoped tokens here.
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store'); // always fresh
  res.status(200).send(JSON.stringify({ MAPBOX_TOKEN: token }));
}
