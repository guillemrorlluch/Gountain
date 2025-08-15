export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(JSON.stringify({ MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '' }));
}
