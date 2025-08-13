// map.js - tokenless MapLibre sources and layers

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);
const PMTILES_URL = 'https://r2-public.protomaps.com/protomaps-basemap.pmtiles';
protocol.add(new pmtiles.PMTiles(PMTILES_URL));

const style = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    dem: {
      type: 'raster-dem',
      tiles: [
        'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 15,
      encoding: 'terrarium'
    },
    topo: {
      type: 'raster',
      tiles: [
        'https://{a,b,c}.tile.opentopomap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 17,
      attribution:
        'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    },
    satellite: {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        'Imagery © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    },
    hillshade: {
      type: 'raster',
      tiles: [
        'https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19
    },
    protomaps: {
      type: 'vector',
      url: 'pmtiles://' + PMTILES_URL
    },
    contours: {
      type: 'raster',
      tiles: [
        'https://tiles.opentopomap.org/contours/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      maxzoom: 15
    }
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite',
      layout: { visibility: 'none' }
    },
    {
      id: 'topo-layer',
      type: 'raster',
      source: 'topo',
      layout: { visibility: 'none' }
    },
    {
      id: 'hillshade-layer',
      type: 'raster',
      source: 'hillshade',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.25 }
    },
    {
      id: 'pm-admin',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'admin',
      layout: { visibility: 'none' },
      paint: { 'line-color': '#555', 'line-width': 1 }
    },
    {
      id: 'pm-labels',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'place',
      layout: {
        visibility: 'none',
        'text-field': ['get', 'name'],
        'text-size': 12,
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular']
      },
      paint: {
        'text-color': '#222',
        'text-halo-color': '#fff',
        'text-halo-width': 1
      }
    },
    {
      id: 'contours-layer',
      type: 'raster',
      source: 'contours',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.3 }
    }
  ]
};

const map = new maplibregl.Map({
  container: 'map',
  style,
  center: [0, 0],
  zoom: 2,
  pitch: 0,
  bearing: 0,
  antialias: true
});

window.map = map;
