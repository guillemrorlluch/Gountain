Mapa interactivo de rutas y picos con filtros y recomendaciones de botas, accesible como PWA.

## Token de Mapbox

El mapa usa [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs) con estilos oficiales de Mapbox.
El token público se expone mediante `/api/env` y se lee desde `NEXT_PUBLIC_MAPBOX_TOKEN`.
Configura esta variable en Vercel o en tu entorno local.

Para pruebas rápidas también puedes inyectar el token manualmente antes de cargar `map.js`:

```html
<script>window.__MAPBOX_TOKEN__ = 'pk.tu_token_aqui';</script>
```

Si no se define el token, la aplicación mostrará un aviso en el mapa.
