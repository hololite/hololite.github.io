import { Common } from './VkCore/Common'
import { VkApp, IVkDirector, VkScene, EndScene } from './VkCore/Vk'
import { CityExplorerScene } from './scenes/CityExplorer';

export class Director implements IVkDirector {
    private _currentScene: VkScene = null;
    private _nextScene: VkScene = null;

    private cityExplorerScene : CityExplorerScene = null;

    public renderScene(): void {
        //console.log(">> " + this.constructor.name);

        if (this._nextScene) {
            this._currentScene = this._nextScene;
            this._currentScene.start();
            this._nextScene = null;
        }

        this._currentScene.render();

        if (this._currentScene instanceof EndScene) {
            VkApp.instance.stop();
        }

        //console.log("<< " + this.constructor.name);
    }

    private setFirstScene(scene: VkScene): void {
        this._nextScene = scene;
    }

    public setNextScene(): void {
        if (this._currentScene instanceof CityExplorerScene) {
            //this._nextScene = this.material2Scene;
        }
        else {
            this._nextScene = new EndScene();
        }
    }

    public start(): void {
        this.cityExplorerScene = new CityExplorerScene(
            "assets/scenes/babylonjs/city/",
            "HugeCity.babylon",
            new BABYLON.Vector3(120, 30, 0),
            new BABYLON.Vector3(120, 31, 10),
            {
                defaultEnv: false,
                soundFile: "assets/mskyline.mp3"
            }
        );


        this.setFirstScene(this.cityExplorerScene);
    }
}
