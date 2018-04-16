import { Common } from './VkCore/Common'
import { VkApp, VkAppOptions } from './VkCore/Vk'
import { Director } from './Director'

export class App extends VkApp {
    private constructor() {
        let options: VkAppOptions = { enableVR: true, debugLayer: false };

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
