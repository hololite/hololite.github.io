import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class FileLoaderScene extends VkScene {
    /*
    * Private members
    */
    private _path: string;
    private file: string;
    private ground: BABYLON.GroundMesh = null;
    private spot: BABYLON.PointLight;
    private menu: VkMenu = new VkMenu(this);

    /*
    * Public members
    */
    constructor(path: string, file: string, position: BABYLON.Vector3, target: BABYLON.Vector3) {
        super({
            //cameraInitialPosition: new BABYLON.Vector3(0, 1, 0),
            //cameraInitialTarget: new BABYLON.Vector3(0, 1, 3)
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

        /*
        BABYLON.SceneLoader.Load(
            "assets/gltf/arch1/",
            "arch1.glb",
            this.engine,
            (scene: BABYLON.Scene) => {
                console.log("load completed!");
            },
            (event: ProgressEvent) => {
            },
            (scene: BABYLON.Scene, message: string, exception?: any) => {
                alert(message);
            }
        );
        */

        //this.scene.useRightHandedSystem = true;
        //BABYLON.GLTFFileLoader.HomogeneousCoordinates = true;

        BABYLON.SceneLoader.Append(
            //"assets/gltf/mega_scene/",
            //"scene.gltf",
            this._path,
            this.file,
            this.scene,
            (scene: BABYLON.Scene) => {
                console.log("load completed!");
                /*
                BABYLON.SceneLoader.Append(
                    "assets/gltf/car1/",
                    "car1.glb",
                    this.scene,
                    (scene: BABYLON.Scene) => {
                        console.log("load completed!");
                        this.repositionCamera();
                    },
                    (event: ProgressEvent) => {
                    },
                    (scene: BABYLON.Scene, message: string, exception?: any) => {
                        alert(message);
                    }
                );
                */
                // Create basic scene
                let helper = this.scene.createDefaultEnvironment({
                    enableGroundMirror: true,
                    groundShadowLevel: 0.6
                });       
                helper.setMainColor(BABYLON.Color3.Teal());
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
