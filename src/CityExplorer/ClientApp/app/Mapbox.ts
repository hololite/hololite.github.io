//
//  Mapbox Settings:
//  ================
//
//  index.html:      <head> ... <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css' rel='stylesheet' />
//  package.json:    "dependencies": { ..., "mapbox-gl": "^0.44.1" }
//  tsconfig.json:   "types": [ ..., "mapbox-gl" ]
//
import * as mapboxgl from 'mapbox-gl';

export class Mapbox {
    static start(): void {
        mapboxgl.accessToken = 'pk.eyJ1IjoiaG9sb2xpdGUiLCJhIjoiY2pleG9hdDlvMTh6ODJ6bjdpYm5mOTAycCJ9.3QrtCpe4LiSXtAuqV2FM1Q';

        let map = new mapboxgl.Map({
            container: 'map', // container id
            style: 'mapbox://styles/mapbox/satellite-streets-v9', // stylesheet location
            center: [-121.96, 37.35], // starting position [lng, lat]
            zoom: 17 // starting zoom
        });
    }
}
