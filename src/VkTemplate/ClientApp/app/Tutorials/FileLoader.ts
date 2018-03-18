import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene } from '../../../../VkCore/Vk'
import { VkMenu } from '../../../../VkCore/VkMenu'

export class FileLoaderScene extends VkScene {
    private _path: string;
    private file: string;
    private ground: BABYLON.GroundMesh = null;
    private spot: BABYLON.PointLight;
    private menu: VkMenu = new VkMenu(this);

    constructor(path: string, file: string, position: BABYLON.Vector3, target: BABYLON.Vector3) {
        super({
            cameraInitialPosition: position,
            cameraInitialTarget: target
        });

        this._path = path;
        this.file = file;
    }

    public get path(): string { return this._path; }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    protected createAssets(): void {
        this.menu.createAssets();
    }

    private loadFiles(): void {
       // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 1.0;

        //this.scene.useRightHandedSystem = true;
        //BABYLON.GLTFFileLoader.HomogeneousCoordinates = true;

        BABYLON.SceneLoader.Append(
            this._path,
            this.file,
            this.scene,
            (scene: BABYLON.Scene) => {
                console.log("load completed!");
                // Create basic scene
                /*
                let helper = this.scene.createDefaultEnvironment({
                    enableGroundMirror: true,
                    groundShadowLevel: 0.6
                });       
                helper.setMainColor(BABYLON.Color3.Teal());
                */
            },
            (event: ProgressEvent) => {
            },
            (scene: BABYLON.Scene, message: string, exception?: any) => {
                alert(message);
            }
        );
    }

    protected onStart(): void {
        this.loadFiles();
        this.menu.start();
    }
}
