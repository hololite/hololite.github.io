//
//  bingmaps Settings:
//  ==================
//
//  index.html:      TODO
//  package.json:    npm install --save bingmaps
//  tsconfig.json:   "types": [ ..., "bingmaps" ]
//

/// <reference path="types/MicrosoftMaps/CustomMapStyles.d.ts" />
/// <reference path="types/MicrosoftMaps/Microsoft.Maps.d.ts" />

export class BingMaps {
    static start(): void {
        let map = new Microsoft.Maps.Map(document.getElementById('map'), { 
        /* No need to set credentials if already passed in URL */
        });
        Microsoft.Maps.loadModule('Microsoft.Maps.SpatialMath', () => {
            let center = map.getCenter();
            let dms = Microsoft.Maps.SpatialMath.toDegMinSec(center);
            //document.getElementById('printoutPanel').innerHTML = '<b>Map center</b> <br>' + dms;
        });
    }
}
