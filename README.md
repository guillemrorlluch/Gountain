Mapa interactivo de rutas y picos con filtros y recomendaciones de botas, accesible como PWA.

## Token de Mapbox

El mapa usa [MapLibre GL](https://maplibre.org/) con teselas satélite y un DEM de Mapbox.
Para que estas capas funcionen necesitas un token válido de Mapbox y exponerlo
en una variable global `MAPBOX_TOKEN` antes de cargar `app.js`:

```html
<script>window.MAPBOX_TOKEN = 'pk.tu_token_aqui';</script>
```

Si no se define el token, la aplicación mostrará únicamente la capa alternativa
de [NASA BlueMarble](https://visibleearth.nasa.gov/collection/1484/blue-marble).
También puedes sustituir las URLs de las fuentes por otro proveedor equivalente.

El mapa usa [MapLibre GL](https://maplibre.org/) con fuentes abiertas como Esri, OpenTopoMap y Protomaps,
por lo que no se requiere ningún token.
