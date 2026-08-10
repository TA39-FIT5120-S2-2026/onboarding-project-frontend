import { TileLayer } from 'react-leaflet';

// CARTO Positron: a near-white, low-detail basemap with almost no baked-in
// POI icons - the calm base our band-coloured route lines and refuge
// markers need to stay legible against, for a sensory-sensitive audience
// where standard OSM's yellow/orange roads and dense icon set are too busy.
// Attribution to both OpenStreetMap and CARTO is a licence condition of
// using CARTO's tiles, not optional.
export default function BaseTileLayer() {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      subdomains="abcd"
      maxZoom={19}
    />
  );
}
