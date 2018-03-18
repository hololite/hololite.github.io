import { Common } from './../../../VkCore/Common'
import { VkApp, VkAppOptions } from './../../../VkCore/Vk'
import { PlaygroundDirector } from './PlaygroundDirector'

export class PlaygroundApp extends VkApp {
    private constructor() {
        let options: VkAppOptions = { enableVR: true, debugLayer: true };

        super(Common.canvasName, new PlaygroundDirector(), options);
	}

    private static _initialized: boolean = false;
    public static initialize(): void {
		if (!PlaygroundApp._initialized) {
			PlaygroundApp.setInstance(new PlaygroundApp());
			PlaygroundApp._initialized = true;
		}
	}
}
