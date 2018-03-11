import 'babylonjs'
//import 'babylonjs-inspector'                // to use the bundled inspector (don't use one from babylon cdn)
import { Common } from './Common'
import { VRHelper } from './Basic/VRHelper'

enum ControllerMode {
    Teleportation, Interaction
}

interface VkSceneOptions {
    readonly enableVR?:                  boolean;
    readonly controllerMode?:            ControllerMode;
    readonly cameraInitialPosition?:     BABYLON.Vector3;
    readonly cameraInitialTarget?:       BABYLON.Vector3;
    readonly floorName?:                 string;
    readonly attachCamera?:              boolean;
    readonly debugLayer?:               boolean;
}

class VkApp {
    private static _instance: VkApp = null;
    private static _canvasName: string = null;

    private _engine: BABYLON.Engine = null;
    private _activeScene: VkScene;
    private _scene: BABYLON.Scene = null;
    private _renderLoop: boolean = false;
    
    private constructor() {
        let canvas = <HTMLCanvasElement>document.getElementById(VkApp._canvasName);
        this._engine = new BABYLON.Engine(canvas, true);
        this._scene = new BABYLON.Scene(this._engine);

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    static get canvasName(): string {
        return VkApp._canvasName;
    }

    static set canvasName(canvasName: string) {
        VkApp._canvasName = canvasName;
    }

    static get instance(): VkApp {
        if (VkApp._instance === null) {
            VkApp._instance = new VkApp();
        }
        return VkApp._instance;
    }

    public get engine(): BABYLON.Engine {
        return this._engine;
    }

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    private disableScene(scene: VkScene) : void {
    }
    private enableScene(scene: VkScene) : void {
    }

    public activate(scene: VkScene): void {
        if (this._activeScene) {
            this.disableScene(this._activeScene);
        }

        this._activeScene = scene;
        this.enableScene(this._activeScene);

        this.startRender();
    }

    private startRender(): void {
        if (!this._renderLoop) {
            // run the render loop
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            this._renderLoop = true;
        }
    }
}

export abstract class VkScene {
    protected readonly canvas: HTMLCanvasElement;
    protected static engine: BABYLON.Engine = null;
    protected vrHelper: BABYLON.VRExperienceHelper = null;

    private vrOptions: VkSceneOptions;
    private _vrCamera: BABYLON.WebVRFreeCamera = null;
    private freeCamera: BABYLON.FreeCamera;

    private _scenePrepared: boolean = false;
    private _startMesh: number = 0;
    private _endMesh: number = 0;

    protected getCanvas(): HTMLCanvasElement { return this.canvas; }

    protected get engine(): BABYLON.Engine {
        return VkApp.instance.engine;
    }

    protected get scene(): BABYLON.Scene {
        return VkApp.instance.scene;
    }

    public get nextMeshIndex(): number {
        return this.scene.meshes.length;
    }

    protected isVREnabled(): boolean {
        return (this.vrOptions !== undefined && this.vrOptions.enableVR !== false);
    }

    protected getVRCamera(): BABYLON.WebVRFreeCamera {
        return this.isVREnabled() ?  this.vrHelper.webVRCamera : null;
    }

    protected getDefaultCamera(): BABYLON.FreeCamera {
        return this.isVREnabled() ? this.vrHelper.deviceOrientationCamera : this.freeCamera;
    }

    public constructor(canvasElement: string, options?: VkSceneOptions) {
        // Create canvas and engine

        this.vrOptions = options;

        // not necessary
        //BABYLON.DebugLayer.InspectorURL = '/vendor.bundle.js';

        if (this.isVREnabled()) {
            if (this.vrHelper === null) {
                this.vrHelper = this.scene.createDefaultVRExperience();
            }

            if (this.vrOptions.controllerMode === ControllerMode.Interaction) {
                this.vrHelper.enableInteractions();
            }
            else {
                if (this.vrOptions.floorName !== undefined) {
                    this.vrHelper.enableTeleportation({ floorMeshName: this.vrOptions.floorName });
                }
            }

            this.vrHelper.onEnteringVR.add(() => {
                console.log("**** onEnteringVR");
                if (this.vrOptions.cameraInitialPosition !== undefined) {
                    this.vrHelper.webVRCamera.position = this.vrOptions.cameraInitialPosition;
                }

                if (this.vrOptions.cameraInitialTarget !== undefined) {
                    this.vrHelper.webVRCamera.setTarget(this.vrOptions.cameraInitialTarget);
                }
            });
            this.vrHelper.onExitingVR.add(() => {
                console.log("**** onExitingVR");
            });

            if (this.vrOptions.cameraInitialPosition !== undefined) {
                this.vrHelper.deviceOrientationCamera.position = this.vrOptions.cameraInitialPosition;
            }

            if (this.vrOptions.cameraInitialTarget !== undefined) {
                this.vrHelper.deviceOrientationCamera.setTarget(this.vrOptions.cameraInitialTarget);
            }

            if (this.vrOptions.attachCamera === false) {
                this.vrHelper.deviceOrientationCamera.detachControl(this.canvas);
            }
            else {
                // the default is to attach
                this.vrHelper.deviceOrientationCamera.attachControl(this.canvas, false);
            }

            if (this.vrOptions.debugLayer === true) {
                this.scene.debugLayer.show();
            }
        }
        else {
            this.freeCamera = new BABYLON.FreeCamera("freeCamera", new BABYLON.Vector3(0, 2, -20), this.scene);
            this.freeCamera.setTarget(new BABYLON.Vector3(0, 0, 0));
            this.freeCamera.attachControl(this.getCanvas());
        }
    }

    private preCreateScene(): void {
        //this._startMesh = this.nextMesh;

    }

    private postCreateScene(): void {

    }

    private prepareScene(): void {
        if (!this._scenePrepared) {
            return;
        }

        this.preCreateScene();

        this.createScene();

        this.postCreateScene();

        this._scenePrepared = true;
    }

    public activate(): void {
        this.prepareScene();
        VkApp.instance.activate(this);
    }

    public enter(): void {
        this.scene.render();
    }

    protected abstract createScene(): void; 
}
