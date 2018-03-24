import * as mapboxgl from 'mapbox-gl';

export class VkMap {
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
