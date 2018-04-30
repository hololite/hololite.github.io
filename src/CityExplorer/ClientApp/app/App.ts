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
    let type: ShadowType = ShadowType.Close;

    if (shadow === 'contact') {
        type = ShadowType.Contact;
    }
    else if (shadow === 'expo') {
        type = ShadowType.Exponential;
    }
    else if (shadow === 'close') {
        type = ShadowType.Close;
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
        let shadow: ShadowType = getShadowType(getUrlParam("shadow"));
        console.log(`**** touch=[${touch}], debug=[${debug}], shadow=[${shadow}]`);

        let options: VkAppOptions = { enableVR: !touch, debugLayer: debug, shadow: shadow };
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
