import 'babylonjs'
//import 'babylonjs-inspector'                // to use the bundled inspector (don't use one from babylon cdn)
//import 'babylonjs-serializers'
import 'babylonjs-loaders'
import { AssetContainerEx } from './AssetContainerEx'
import { Common } from './Common'
//import { VRHelper } from './Basic/VRHelper'

export enum ControllerMode {
    Teleportation, Interaction
}

export class VkException {
}

export enum ShadowType {
    Contact, Exponential, Close, PCF, None
};

export class VkAppOptions {
    readonly enableVR?:                 boolean = true;
    readonly debugLayer?:               boolean = false;
    readonly shadow?:                   ShadowType = ShadowType.None;
}

export enum TouchpadNav { None, Center, Top, Bottom, Left, Right };

export class VkApp {
    private static _instance: VkApp = null;
    private readonly _canvas: HTMLCanvasElement = null;
    private readonly _engine: BABYLON.Engine = null;
    private readonly _director: IVkDirector = null;
    private readonly _scene: BABYLON.Scene = null;
    private readonly _initialScene: BABYLON.Scene = null;
    private readonly _vrHelper: BABYLON.VRExperienceHelper = null;
    private readonly _options: VkAppOptions = null;
    private readonly _systemAssets: BABYLON.KeepAssets = null;
    private _vjc: BABYLON.VirtualJoysticksCamera = null;
    private _onMenuButton: (controller: BABYLON.WebVRController, pressed: boolean) => void = null; 
    private _onControllerLoaded: (controller: BABYLON.WebVRController) => void = null; 
    private _onVREntered: () => void = null; 
    private _menuButtonPressed = false;
    private _triggerButtonPressed = false;
    private _onTriggerButton: (controller: BABYLON.WebVRController, pressed: boolean) => void = null; 
    private _onTouchpadButton: (nav: TouchpadNav) => void = null;
    private debugPanel = false;
    private vrDisplay: VRDisplay = null;
    private stickValues: BABYLON.StickValues = new BABYLON.StickValues(0, 0);
    private controllerObserver: BABYLON.Observer<BABYLON.WebVRController> = null;

    private menuButtonObserver(controller: BABYLON.WebVRController, eventState: BABYLON.EventState): void {
        //console.log('>>>> VkApp.menuButtonObserver: mask=%d', eventState.mask);
        this._menuButtonPressed = !this._menuButtonPressed;
        if (this._onMenuButton) {
            this._onMenuButton(controller, this._menuButtonPressed);
        }
        //console.log('<<<< VkApp.menuButtonObserver');
    }

    private triggerButtonObserver(controller: BABYLON.WebVRController, eventState: BABYLON.EventState): void {
        //console.log('>>>> VkApp.triggerButtonObserver: mask=%d', eventState.mask);
        this._triggerButtonPressed = !this._triggerButtonPressed;
        if (this._onTriggerButton) {
            this._onTriggerButton(controller, this._triggerButtonPressed);
        }
        //console.log('<<<< VkApp.triggerButtonObserver');
    }

    private calculateTouchpadNav(): TouchpadNav {
        let nav =  TouchpadNav.None;
        let x = this.stickValues.x;
        let y = this.stickValues.y;
        //console.log(`x=${x}, y=${y}`);

        if (x <= -0.7) {
            nav = TouchpadNav.Left;
        }
        else if (x >= 0.7) {
            nav = TouchpadNav.Right;
        }
        else if (x > -0.4 && x < 0.4 && y > -0.4 && y < 0.4) {
            nav = TouchpadNav.Center;
        }
        else {
            if (y <= -0.5) {
                nav = TouchpadNav.Top;
            }
            else if (y >= 0.5) {
                nav = TouchpadNav.Bottom;
            }
        }

        return nav;
    }

    private padButtonObserver(gamepadButton: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState): void {
        //console.log('>>>> VkApp.padButtonObserver');
        //console.log(`gamepadButton: touched=${gamepadButton.touched}, pressed=${gamepadButton.pressed}, value=${gamepadButton.value}`);

        if (gamepadButton.pressed) {
            if (this._onTouchpadButton) {
                let nav = this.calculateTouchpadNav();
                //console.log(`nav=${nav}`);
                this._onTouchpadButton(nav);
            }
        }

        //console.log('<<<< VkApp.padButtonObserver');
    }

    private padStateObserver(gamepadButton: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState): void {
        //console.log('>>>> VkApp.padStateObserver');
        //console.log(`gamepadButton: touched=${gamepadButton.touched}, pressed=${gamepadButton.pressed}, value=${gamepadButton.value}`);
        //console.log('<<<< VkApp.padStateObserver');
    }

    private padValueObserver(stickValues: BABYLON.StickValues, eventState: BABYLON.EventState): void {
        //console.log('>>>> VkApp.padValueObserver');
        //console.log(`stickValues: x=${stickValues.x}, y=${stickValues.y}`);
        this.stickValues.x = stickValues.x;
        this.stickValues.y = stickValues.y;
        //console.log('<<<< VkApp.padValueObserver');
    }

    protected static setInstance(value: VkApp): void {
        VkApp._instance = value;
    }

    /*
    private copySceneProperties(source: BABYLON.Scene, target: BABYLON.Scene): void {
        target.fogColor = new BABYLON.Color3(source.fogColor.r, source.fogColor.g, source.fogColor.b);
        target.fogDensity = source.fogDensity;
        target.fogEnabled = source.fogEnabled;
        target.fogEnd = source.fogEnd;
        target.fogStart = source.fogStart;
        target.fogMode = source.fogMode;

        let cc = source.clearColor;
        target.clearColor = new BABYLON.Color4(cc.r, cc.g, cc.b, cc.a);

        let ac = source.ambientColor;
        target.ambientColor = new BABYLON.Color3(ac.r, ac.g, ac.b);
    }

    private saveInitialSceneProperties(): void {
        this.copySceneProperties(this._scene, this._initialScene);
    }

    public restoreInitialSceneProperties(): void {
        this.copySceneProperties(this._initialScene, this._scene);
    }
    */

    protected constructor(canvasName: string, director: IVkDirector, options?: VkAppOptions) {
        if (options === undefined) {
            this._options = new VkAppOptions();
        }
        else {
            this._options = options;
        }

        this._canvas = <HTMLCanvasElement>document.getElementById(canvasName);
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._scene = new BABYLON.Scene(this.engine);
        this._initialScene = new BABYLON.Scene(null);    // save a copy for keeping the initial props
        //this.saveInitialSceneProperties();

        if (this._options.debugLayer) {
            this.debugPanel = true;
            this._scene.debugLayer.show();
        }
        
        //this.traceSceneAssets('after scene object creation');

        if (this.isVREnabled()) {
            this._vrHelper = this.scene.createDefaultVRExperience(); // this will create several (5) cameras
            //this._vrHelper.enableInteractions();
            //this._vrHelper.enableTeleportation();
            this._vrHelper.displayGaze = false;
            this._vrHelper.displayLaserPointer = false;
            this._vrHelper.webVROptions.defaultHeight = 10;
            this._vrHelper.webVROptions.rayLength = 200;

            this._vrHelper.onAfterCameraTeleport.add((eventData: BABYLON.Vector3, eventState: BABYLON.EventState) => {
                this.hideLaserPointer();
            });

            this._vrHelper.onEnteringVR.add((vrHelper: BABYLON.VRExperienceHelper, eventState: BABYLON.EventState) => {

                console.log("getting active vr displays");
                //let displays = navigator.activeVRDisplays;
                navigator.getVRDisplays().then((displays) => {
                    this.vrDisplay = displays[0];
                    for (let display of displays) {
                        console.log(`**** vrDisplay: id=${display.displayId}, name=${display.displayName}`);
                    }
                });

                if (this._onVREntered) {
                    this._onVREntered();
                }

                /*
                let defaultPipeline = new BABYLON.DefaultRenderingPipeline("default", true, this.scene, [vrHelper.vrDeviceOrientationCamera, vrHelper.webVRCamera, vrHelper.vrDeviceOrientationCamera]);
                defaultPipeline.fxaaEnabled = true;
                defaultPipeline.imageProcessing.contrast = 2.5;
                //defaultPipeline.imageProcessing.vignetteBlendMode = 2;
                defaultPipeline.bloomEnabled = true;
                console.log(`**** bloomWeight=${defaultPipeline.bloomWeight}, bloomScale=${defaultPipeline.bloomScale}`);
                defaultPipeline.bloomWeight = 0.05;
                defaultPipeline.bloomScale = 0.3;
                console.log(`**** new bloomWeight=${defaultPipeline.bloomWeight}`);
                */
            });

            let controllerObserver = this._vrHelper.onControllerMeshLoadedObservable.add((c: BABYLON.WebVRController, eventState: BABYLON.EventState) => {
                console.log(`>>>> onControllerMeshLoadedObservable: controllerType=${c.controllerType}, eventState=${eventState.mask}`);

                if (this._onControllerLoaded) {
                    this._onControllerLoaded(c);
                }

                if (this.controllerObserver) {
                    let removed = this._vrHelper.onControllerMeshLoadedObservable.remove(this.controllerObserver);
                    console.log(`controller observer removal status: ${removed}`);
                }
                this.controllerObserver = controllerObserver;

                this.hideLaserPointer();

                if (c instanceof BABYLON.WindowsMotionController) {
                    let controller = <BABYLON.WindowsMotionController>c;

                    controller.onMenuButtonStateChangedObservable.add((eventData: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState) => {
                        this.menuButtonObserver(controller, eventState);
                    });

                    controller.onTouchpadValuesChangedObservable.add((stickValue: BABYLON.StickValues, eventState: BABYLON.EventState) => {
                        this.padValueObserver(stickValue, eventState);
                    });

                    controller.onTouchpadButtonStateChangedObservable.add((gamepadButton: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState) => {
                        this.padButtonObserver(gamepadButton, eventState);
                    });

                    /*
                    controller.onTrackpadValuesChangedObservable.add((stickValue: BABYLON.StickValues, eventState: BABYLON.EventState) => {
                        this.padValueObserver(stickValue, eventState);
                    });

                    controller.onTriggerButtonStateChangedObservable.add((eventData: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState) => {
                        this.triggerButtonObserver(controller, eventState);
                    });
                    */

                }
                else if (c instanceof BABYLON.ViveController) {
                    let controller = <BABYLON.ViveController>c;

                    controller.onMenuButtonStateChangedObservable.add((eventData: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState) => {
                        this.menuButtonObserver(controller, eventState);
                    });

                    controller.onPadValuesChangedObservable.add((stickValue: BABYLON.StickValues, eventState: BABYLON.EventState) => {
                        this.padValueObserver(stickValue, eventState);
                    });

                    controller.onPadStateChangedObservable.add((gamepadButton: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState) => {
                        this.padButtonObserver(gamepadButton, eventState);
                    });
                }
                else {
                    let controller = c;

                    controller.onPadValuesChangedObservable.add((stickValue: BABYLON.StickValues, eventState: BABYLON.EventState) => {
                        this.padValueObserver(stickValue, eventState);
                    });

                    controller.onPadStateChangedObservable.add((gamepadButton: BABYLON.ExtendedGamepadButton, eventState: BABYLON.EventState) => {
                        this.padButtonObserver(gamepadButton, eventState);
                    });
                }

                console.log('<<<< onControllerMeshLoadedObservable');
            });

            window.addEventListener('vrdisplayactivate', () => {
                console.log('>>>> onvrdisplayactivate');
                this._vrHelper.enterVR();
            });

            // key-based navigation
            // this should work in both pre-vr mode and vr mode
            document.onkeydown = (e)=> {
                if (e.key === "d") {
                    this.debugPanel = !this.debugPanel;
                    if (this.debugPanel)
                        this._scene.debugLayer.show();
                    else
                        this._scene.debugLayer.hide();
                }
                if (e.key === "Up") { // forward
                    this.vrHelper.currentVRCamera.position.z += 0.6; 
                }
                else if (e.key === "Down") { // backward
                    this.vrHelper.currentVRCamera.position.z -= 0.6; 
                }
                else if (e.key === "PageUp") { // up
                    this.vrHelper.currentVRCamera.position.y += 0.5;
                }
                else if (e.key === "PageDown") { // down
                    this.vrHelper.currentVRCamera.position.y -= 0.5;
                }
            }
        }
        else {
            this._vjc = new BABYLON.VirtualJoysticksCamera("VJC", BABYLON.Vector3.Zero(), this.scene);
            this._vjc.attachControl(this._canvas);
            //this._vjc.checkCollisions = true;
        }

        // first-step to save the initial system assets related to vr
        this._systemAssets = new BABYLON.KeepAssets();
        //this.saveToSystemAssets();
        //this.traceSceneAssets('after creating free camera');
        // set the director
        this._director = director;

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    showLaserPointer(): void {
        if (this.isVREnabled()) {
            this._vrHelper.displayLaserPointer = true;
        }
    }
    
    hideLaserPointer(): void {
        if (this.isVREnabled()) {
            this._vrHelper.displayLaserPointer = false;
        }
    }

    /*
    public saveToSystemAssets(): void {
        Array.prototype.push.apply(this._systemAssets.cameras, this.scene.cameras);
        Array.prototype.push.apply(this._systemAssets.meshes, this.scene.meshes);
        Array.prototype.push.apply(this._systemAssets.geometries, this.scene.getGeometries());
        Array.prototype.push.apply(this._systemAssets.materials, this.scene.materials);
        Array.prototype.push.apply(this._systemAssets.lights, this.scene.lights);
    }
    */

    public static get instance(): VkApp { return VkApp._instance; }
    public get options(): VkAppOptions { return this._options; }
    public get canvas(): HTMLCanvasElement { return this._canvas; }
    public get engine(): BABYLON.Engine { return this._engine; }
    public get scene(): BABYLON.Scene { return this._scene; }
    public get vrHelper(): BABYLON.VRExperienceHelper { return this._vrHelper; }
    public get vrDevice(): VRDisplay { return this.vrDevice; }
    public get director(): IVkDirector { return this._director; }
    public get systemAssets(): BABYLON.KeepAssets { return this._systemAssets; }
    public get camera(): BABYLON.FreeCamera {
        return this.isVREnabled() ? this._vrHelper.webVRCamera : this._vjc;
    }

    public traceSceneAssets(tag: string): void {
        console.log('>>>> traceSceneAssets: %s', tag);
        for (let asset of this.scene.lights) {
            console.log('light: %s', asset.name);
        }

        for (let asset of this.scene.cameras) {
            console.log('camera: %s', asset.name);
        }

        for (let asset of this.scene.skeletons) {
            console.log('skeleton: %s', asset.name);
        }

        for (let asset of this.scene.meshes) {
            console.log('mesh: %s', asset.name);
        }

        for (let asset of this.scene.getGeometries()) {
            console.log('geo: %s', asset.toString());
        }

        for (let asset of this.scene.animations) {
            console.log('animation: %s', asset.name);
        }

        for (let asset of this.scene.particleSystems) {
            console.log('ps: %s', asset.name);
        }

        for (let asset of this.scene._actionManagers) {
            console.log('actionManager: %s', asset.toString());
        }

        for (let asset of this.scene.lensFlareSystems) {
            console.log('lsf: %s', asset.toString());
        }

        for (let asset of this.scene.materials) {
            console.log('material: %s', asset.toString());
        }

        for (let asset of this.scene.morphTargetManagers) {
            console.log('mtm: %s', asset.toString());
        }

        for (let asset of this.scene.multiMaterials) {
            console.log('multiMaterial: %s', asset.name);
        }

        for (let asset of this.scene.transformNodes) {
            console.log('tn: %s', asset.name);
        }

        for (let asset of this.scene.mainSoundTrack.soundCollection) {
            console.log('sound: %s', asset.name);
        }

        console.log('<<<< traceSceneAssets: %s', tag);
    }

    public isVREnabled(): boolean {
        return (this.options && this.options.enableVR);
    }

    public start(): void {
        console.log(">> VkApp.start");

        this._director.start();

        this._engine.runRenderLoop(() => {
            this._director.renderScene();
        });

        console.log("<< VkApp.start");
    }

    public stop(): void {
        this._engine.stopRenderLoop();
    }

    public set onControllerLoaded(value: (controller: BABYLON.WebVRController) => void) {
        this._onControllerLoaded = value;
    }

    public set onMenuButton(value: (controller: BABYLON.WebVRController, pressed: boolean) => void) {
        this._onMenuButton = value;
    }

    public set onTriggerButton(value: (controller: BABYLON.WebVRController, pressed: boolean) => void) {
        this._onTriggerButton = value;
    }

    public set onTouchpadButton(value: (nav: TouchpadNav) => void) {
        this._onTouchpadButton = value;
    }

    public set onVREntered(value: () => void) {
        this._onVREntered = value;
    }
}

export class VkSceneOptions {
    readonly controllerMode?:            ControllerMode;
    readonly cameraInitialPosition?:     BABYLON.Vector3;
    readonly cameraInitialTarget?:       BABYLON.Vector3;
    readonly floorName?:                 string;
    readonly attachCamera?:              boolean;
}

export abstract class VkScene {
    private readonly _options: VkSceneOptions;
    private readonly _assets: AssetContainerEx;
    private _preRender: () => void = null;
    private _assetsLoaded: boolean = false;
    private _controllerAssetsLoaded: boolean = false;
    private _initialized: boolean = false;
    private readonly _teleportMeshes: BABYLON.Mesh[] = [];
    private _beforeRenderObserver: BABYLON.Observer<BABYLON.Scene> = null;
    private _beforeRenderCallback: () => void = null;

    protected get engine(): BABYLON.Engine { return VkApp.instance.engine; }
    protected get canvas(): HTMLCanvasElement { return VkApp.instance.canvas; }
    protected get scene(): BABYLON.Scene { return VkApp.instance.scene; }
    protected get vrHelper(): BABYLON.VRExperienceHelper { return VkApp.instance.vrHelper; }
    protected get preRender(): ()=>void { return this._preRender; }
    protected set preRender(value: ()=>void) { this._preRender = value; }
    protected get camera(): BABYLON.FreeCamera { return VkApp.instance.camera; }

    protected set beforeRenderCallback(value: () => void) {
        this._beforeRenderCallback = value;
        if (this._beforeRenderCallback) {
            console.log('_beforeRenderCallback is set');
            this._beforeRenderObserver = this.scene.onBeforeRenderObservable.add(this._beforeRenderCallback);
        }
    }

    protected addTeleportMesh(mesh: BABYLON.Mesh): void {
        this.vrHelper.addFloorMesh(mesh);
        this._teleportMeshes.push(mesh);
    }

    protected isVREnabled(): boolean { return VkApp.instance.isVREnabled(); }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean): void {
    }

    protected onTriggerButton(controller: BABYLON.WebVRController, pressed: boolean): void {
    }

    protected onVREntered(): void {
    }

    protected onControllerLoaded(controller: BABYLON.WebVRController): void {
    }

    //
    // touchpad-based navigation
    //
    protected onTouchpadButton(nav: TouchpadNav): void {
        switch (nav) {
            case TouchpadNav.Top:
                this.vrHelper.currentVRCamera.position.z += 2; 
                break;
            case TouchpadNav.Bottom:
                this.vrHelper.currentVRCamera.position.z -= 2; 
                break;
            case TouchpadNav.Right:
                this.vrHelper.currentVRCamera.position.y += 2;
                break;
            case TouchpadNav.Left:
                this.vrHelper.currentVRCamera.position.y -= 2;
                break;
        }
    }

    public initialize(): void {
        if (!this._initialized) {
            this.createAssets();
            //this.saveAssetsToContainer();
            this._initialized = true;
        }
    }

    public traceContainerAssets(): void {
        console.log('>>>> traceContainerAssets: scene=%s', this.name);
        for (let asset of this._assets.lights) {
            console.log('light: %s', asset.name);
        }

        for (let asset of this._assets.cameras) {
            console.log('camera: %s', asset.name);
        }

        for (let asset of this._assets.skeletons) {
            console.log('skeleton: %s', asset.name);
        }

        for (let asset of this._assets.meshes) {
            console.log('mesh: %s', asset.name);
        }

        for (let asset of this._assets.geometries) {
            console.log('geo: %s', asset.toString());
        }

        for (let asset of this._assets.animations) {
            console.log('animation: %s', asset.name);
        }

        for (let asset of this._assets.particleSystems) {
            console.log('ps: %s', asset.name);
        }

        for (let asset of this._assets.actionManagers) {
            console.log('actionManager: %s', asset.toString());
        }

        for (let asset of this._assets.lensFlareSystems) {
            console.log('lsf: %s', asset.toString());
        }

        for (let asset of this._assets.materials) {
            console.log('material: %s', asset.toString());
        }

        for (let asset of this._assets.morphTargetManagers) {
            console.log('mtm: %s', asset.toString());
        }

        for (let asset of this._assets.multiMaterials) {
            console.log('multiMaterial: %s', asset.name);
        }

        for (let asset of this._assets.transformNodes) {
            console.log('tn: %s', asset.name);
        }

        for (let asset of this._assets.sounds) {
            console.log('sound: %s', asset.name);
        }

        console.log('<<<< traceContainerAssets: scene=%s', this.name);
    }

    private initializeOptions() {
        console.log('>>>> VkApp.initializeOptions: scene=%s', this.name);
        // not necessary
        //BABYLON.DebugLayer.InspectorURL = '/vendor.bundle.js';

        if (this.isVREnabled()) {
            this.vrHelper.displayGaze = false;
            //this.vrHelper.changeLaserColor(BABYLON.Color3.Yellow());
            this.vrHelper.displayLaserPointer = false;
            //this.vrHelper.webVROptions.defaultHeight = 2;

            console.log('initializing webvr camera dir');
            if (this._options.cameraInitialPosition !== undefined) {
                this.vrHelper.deviceOrientationCamera.position = this._options.cameraInitialPosition;
                this.vrHelper.webVRCamera.position = this._options.cameraInitialPosition;
            }
            if (this._options.cameraInitialTarget !== undefined) {
                this.vrHelper.deviceOrientationCamera.setTarget(this._options.cameraInitialTarget);
            }
            this.vrHelper.deviceOrientationCamera.attachControl(this.canvas, false);
        }
        else {
            console.log('initializing vjc camera dir');
            if (this._options.cameraInitialPosition !== undefined) {
                this.camera.position = this._options.cameraInitialPosition;
            }
            if (this._options.cameraInitialTarget !== undefined) {
                this.camera.setTarget(this._options.cameraInitialTarget);
            }
        }

        console.log('<<<< VkApp.initializeOptions: scene=%s', this.name);
    }

    /*
    private saveAssetsToContainer(): void {
        this._assets.moveAllFromScene(VkApp.instance.systemAssets);
    }

    private loadAssetsFromContainer(): void {
        if (!this._assetsLoaded) {
            this._assets.addAllToScene();
            if (this.preRender) {
            }
            this._assetsLoaded = true;
        }
    }

    private unloadAssetsFromScene(): void {
        if (this._assetsLoaded) {
            this._assets.removeAllFromScene();
            this._assetsLoaded = false;
        }
    }
    */

    private clearAssetsInScene(): void {
        this.scene.cameras.length = 0;
        Array.prototype.push.apply(this.scene.cameras, VkApp.instance.systemAssets.cameras);

        this.scene.meshes.length = 0;
        Array.prototype.push.apply(this.scene.meshes, VkApp.instance.systemAssets.meshes);

        this.scene.getGeometries().length = 0;
        Array.prototype.push.apply(this.scene.getGeometries(), VkApp.instance.systemAssets.geometries);

        this.scene.materials.length = 0;
        Array.prototype.push.apply(this.scene.materials, VkApp.instance.systemAssets.materials);

        this.scene.lights.length = 0;
        Array.prototype.push.apply(this.scene.lights, VkApp.instance.systemAssets.lights);

        this.scene.skeletons.length = 0;
        this.scene.animations.length = 0;
        this.scene.particleSystems.length = 0;
        this.scene._actionManagers.length = 0;
        this.scene.lensFlareSystems.length = 0;
        this.scene.morphTargetManagers.length = 0;
        this.scene.multiMaterials.length = 0;
        this.scene.transformNodes.length = 0;
        this.scene.mainSoundTrack.soundCollection.length = 0;
    }

    protected abstract createAssets(): void; 

    protected onStart(): void {
    }

    protected onStop(): void {
    }

    public constructor(options?: VkSceneOptions) {
        if (options === undefined) {
            this._options = new VkSceneOptions();
        }
        else {
            this._options = options;
        }

        this._assets = new AssetContainerEx(this.scene);
    }

    public get name(): string {
        return this.constructor.name;
    }

    public render(): void {
        //console.log(">>>> " + this.constructor.name);
        this.scene.render();
        //console.log("<<<< " + this.constructor.name);
    }

    public start(): void {
        this.initialize();  // one-time initialization

        //VkApp.instance.traceSceneAssets('before clearing assets');
        //this.clearAssetsInScene(); // clear assets in scene except the system assets
        //VkApp.instance.restoreInitialSceneProperties();

        //VkApp.instance.traceSceneAssets('before loading assets');
        //this.loadAssetsFromContainer();  // load assets from container to scene
        this.initializeOptions();
        VkApp.instance.onMenuButton = (controller: BABYLON.WebVRController, pressed: boolean) => { this.onMenuButton(controller, pressed); };
        VkApp.instance.onTriggerButton = (controller: BABYLON.WebVRController, pressed: boolean) => { this.onTriggerButton(controller, pressed); };
        VkApp.instance.onTouchpadButton = (nav: TouchpadNav) => { this.onTouchpadButton(nav); };
        VkApp.instance.onVREntered = () => { this.onVREntered(); };
        VkApp.instance.onControllerLoaded = (controller: BABYLON.WebVRController) => { this.onControllerLoaded(controller); };

        this._beforeRenderCallback = null;
        this._beforeRenderObserver = null;

        this.onStart();
    }

    public stop(): void {
        this.onStop();

        if (this._beforeRenderObserver) {
            let status = this.scene.onBeforeRenderObservable.remove(this._beforeRenderObserver);
            console.log(`_beforeRenderObserver removal status=${status}`);
            this._beforeRenderObserver = null;
        }
        this._beforeRenderCallback = null;

        if (this._teleportMeshes.length) {
            for (let mesh of this._teleportMeshes) {
                this.vrHelper.removeFloorMesh(mesh);
            }
            this._teleportMeshes.length = 0;
        }

        //this.unloadAssetsFromScene();

        /*
        // the second step to add scene assets to the system assets
        // left-over assets of the first scene are related to VR controller assets
        // that need to be saved
        if (this instanceof FirstScene && !this._controllerAssetsLoaded) {
            VkApp.instance.saveToSystemAssets();
            this._controllerAssetsLoaded = true;
            //VkApp.instance.traceSceneAssets('after FirstScene');
        }
        */

        VkApp.instance.director.setNextScene();
    }
}

// The first scene must enable the laser
export abstract class FirstScene extends VkScene {
}

export class EndScene extends VkScene {
    createAssets(): void {
    }

    onStart(): void {
        VkApp.instance.vrHelper.exitVR();
    }
}

export interface IVkDirector {
    start(): void;
    renderScene(): void;
    setNextScene(): void;
}
