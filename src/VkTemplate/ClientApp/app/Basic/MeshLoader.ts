import 'babylonjs'
import 'babylonjs-inspector'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'babylonjs-post-process'
import 'babylonjs-procedural-textures'
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, FirstScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export interface IMeshLoaderOptions {
    rotate?:        boolean;
    defaultEnv?:    boolean;
    soundFile?:     string;
    envDdsFile?:    string;
    scale?:         number;
}

class MeshLoaderOptions implements IMeshLoaderOptions {
    constructor(args?: IMeshLoaderOptions) {
        if (args !== undefined) {
            if (args.rotate !== undefined)
                this.rotate = args.rotate;
            if (args.defaultEnv !== undefined)
                this.defaultEnv = args.defaultEnv;
            if (args.soundFile !== undefined)
                this.soundFile = args.soundFile;
            if (args.envDdsFile !== undefined)
                this.envDdsFile = args.envDdsFile;
            if (args.scale !== undefined)
                this.scale = args.scale;
        }
    }

    rotate:         boolean = false;
    defaultEnv:     boolean = true;
    soundFile:      string = "";
    envDdsFile:     string = "";
    scale:          number = 1;
}

export class MeshLoaderScene extends FirstScene implements EventListenerObject {
    private menu: VkMenu = new VkMenu(this);
    private decals: BABYLON.Mesh[] = [];
    private decalMaterial: BABYLON.StandardMaterial;
    private meshes: BABYLON.AbstractMesh[] = null;
    private path: string;
    private file: string;
    private skyBox: BABYLON.Mesh = null;
    private sound3D: BABYLON.Sound = null;

    private loaderOptions: MeshLoaderOptions = null;

    /*
    * Public members
    */
    constructor(path: string, file: string, position: BABYLON.Vector3, target: BABYLON.Vector3, options?: IMeshLoaderOptions) {
        super({
            cameraInitialPosition: position,
            cameraInitialTarget: target
        });

        this.path = path;
        this.file = file;
        this.loaderOptions = new MeshLoaderOptions(options);
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    private createSound(): void {
        console.log(`**** soundFile=${this.loaderOptions.soundFile}`);
        if (this.loaderOptions.soundFile !== "") {
            this.sound3D = new BABYLON.Sound(
                "Sound3D",
                this.loaderOptions.soundFile,
                this.scene,
                () => {},
                {
                    loop: true, autoplay: true, volume: 0.3, spatialSound: true, distanceModel: "linear"
                }
            );

            // Set 3D sound's position
            this.sound3D.setPosition(new BABYLON.Vector3(0, 5, 0));

            // Set 3D sound's max distance (linear model)
            this.sound3D.maxDistance = 20;
        }
    }

    private deleteSound(): void {
        if (this.sound3D) {
            this.sound3D.stop();
            this.sound3D.dispose();
            this.sound3D = null;
            console.log('sound deleted');
        }
        else {
            console.log('no sound');
        }
    }

    private addDecal(pickInfo: BABYLON.PickingInfo, pickedMesh: BABYLON.AbstractMesh): void {
        let decalSize = new BABYLON.Vector3(1, 1, 1);
        let decal = BABYLON.MeshBuilder.CreateDecal("decal", pickedMesh, { position: pickInfo.pickedPoint, normal: pickInfo.getNormal(true), size: decalSize });
        decal.material = this.decalMaterial;
        this.decals.push(decal);
    }

    protected onTriggerButton(controller: BABYLON.WebVRController, pressed: boolean): void {
        if (pressed && this.meshes) { // this.meshes can be null while it is still being constructed
            console.log('>>>> DecalScene.onTriggerButton');

            let ray = controller.getForwardRay();
            let pickedMesh: BABYLON.AbstractMesh = null;
            let pickInfo: BABYLON.PickingInfo;

            for (let mesh of this.meshes) {
                pickInfo = ray.intersectsMesh(mesh);
                if (pickInfo.hit) {
                    pickedMesh = mesh;
                    break;
                }
            }

            if (pickedMesh) {
                this.addDecal(pickInfo, pickedMesh);
            }

            console.log('<<<< DecalScene.onTriggerButton');
        }
    }
    
    protected createAssets(): void {
        let light = new BABYLON.HemisphericLight("Hemi", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 2;

        this.decalMaterial = new BABYLON.StandardMaterial("decalMat", this.scene);
        this.decalMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/impact.png", this.scene);
        this.decalMaterial.diffuseTexture.hasAlpha = true;
        this.decalMaterial.zOffset = -2;

        this.menu.createAssets();
    }

    // EventListenerObject interface method
    public handleEvent(evt: Event): void {
        console.log('>>>> onPointerDown');

        // check if we are under a mesh
        //let pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => { return mesh === this.cat; });
        //this.addDecal(pickInfo);

        console.log('<<<< onPointerDown');
    }

    protected onStart(): void {
        /*
        let black =  BABYLON.Color3.Black();
        let black4 = new BABYLON.Color4(black.r, black.g, black.b);
        this.scene.clearColor = black4;
        */

        if (this.loaderOptions.envDdsFile !== "") {
            let hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("assets/textures/environment.dds", this.scene);
            this.skyBox = this.scene.createDefaultSkybox(hdrTexture, true);
        }
        else if (this.loaderOptions.defaultEnv) {
            // basic scene
            let helper = this.scene.createDefaultEnvironment({
                enableGroundMirror: true,
                groundShadowLevel: 0.6
            });       
            helper.setMainColor(BABYLON.Color3.Teal());
        }

        if (this.loaderOptions.rotate) {
            this.beforeRenderCallback = () => {
                if (this.meshes) {
                    this.meshes[0].rotation.y += 0.005;
                }
            }
        }

        // The first parameter can be used to specify which mesh to import. Here we import all meshes
        BABYLON.SceneLoader.ImportMesh("", this.path, this.file, this.scene, (newMeshes) => {
            this.meshes = newMeshes;

            for (let m of this.meshes) {
                m.isPickable = true;
                if (!m.name.startsWith("Facade")) {
                    // add to teleport mesh
                    BABYLON.Tools.Log(`teleport mesh: name=${m.name}`);
                    this.vrHelper.addFloorMesh(<BABYLON.Mesh>m);
                }
                else {
                    BABYLON.Tools.Log(`mesh: name=${m.name}`);
                }
            }

            if (this.loaderOptions.scale !== 1) {
                this.meshes[0].scaling.scaleInPlace(this.loaderOptions.scale);
            }
        });

        this.createSound();
        this.menu.start();

        // for browser interaction using mouse click
        this.canvas.addEventListener("pointerdown", this, false);
    }

    protected onStop(): void {
        this.deleteSound();

        this.canvas.removeEventListener("pointerdown", this);

        if (this.meshes) {
            for (let mesh of this.meshes) {
                mesh.dispose();
            }
            this.meshes = null;
        }

        for (let decal of this.decals) {
            decal.dispose();
        }
        this.decals.length = 0;

        if (this.skyBox) {
            this.skyBox.dispose();
            this.skyBox = null;
        }
    }
}
