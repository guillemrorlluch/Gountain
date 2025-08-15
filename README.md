Mapa interactivo de rutas y picos con filtros y recomendaciones de botas, accesible como PWA.

## Token de Mapbox

El mapa usa [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs) con estilos oficiales de Mapbox.
Para que estas capas funcionen necesitas un token válido de Mapbox y exponerlo
en una variable global `MAPBOX_TOKEN` antes de cargar `map.js`:

```html
<script>window.MAPBOX_TOKEN = 'pk.tu_token_aqui';</script>
```

Si no se define el token, la aplicación mostrará un aviso en el mapa.
