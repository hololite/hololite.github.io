import { Common } from './VkCore/Common'
import { VkApp, ShadowType, VkAppOptions } from './VkCore/Vk'
import { Director } from './Director'

function getUrlParam(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
    if (!results) return '';
    else if (!results[2]) return '';
    else return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getShadowType(shadow: string): ShadowType {
    let type: ShadowType = ShadowType.PCF;

    if (shadow === 'pcss') {
        type = ShadowType.PCSS;
    }
    else if (shadow === 'besm') {
        type = ShadowType.BESM;
    }
    else if (shadow === 'cesm') {
        type = ShadowType.CESM;
    }
    else if (shadow === 'pcf') {
        type = ShadowType.PCF;
    }
    else if (shadow === 'none') {
        type = ShadowType.None;
    }

    return type;
}

export class App extends VkApp {
    private constructor() {

        //let query = window.location.search.substring(1);
        let touch: boolean = (getUrlParam("touch") === "true");
        let debug: boolean = (getUrlParam("debug") === "true");
        let sceneOpt: boolean = (getUrlParam("opt") === "true");
        let oct: boolean = (getUrlParam("oct") === "true");
        let shadow: ShadowType = getShadowType(getUrlParam("shadow"));
        let speed: number = parseInt(getUrlParam("speed"));
        if (isNaN(speed) || speed < 0 || speed > 50) {
            speed = 10;
        }

        console.log(`**** touch=[${touch}], debug=[${debug}], shadow=[${shadow}], sceneOpt=[${sceneOpt}], octTree=[${oct}]speed=[${speed}]`);

        let options: VkAppOptions = { enableVR: !touch, debugLayer: debug, shadow: shadow, sceneOpt: sceneOpt, octTree: oct, initialSpeed: speed };
        super(Common.canvasName, new Director(), options);
	}

    private static _initialized: boolean = false;
    public static initialize(): void {
		if (!App._initialized) {
			App.setInstance(new App());
			App._initialized = true;
		}
	}
}
