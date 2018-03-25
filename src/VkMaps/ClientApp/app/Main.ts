import { Mapbox } from './Mapbox';
import { BingMaps } from './BingMaps';

export class VkMap {
    static start(): void {
        BingMaps.start();
    }
}
