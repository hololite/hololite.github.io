import { Common } from './../../../VkCore/Common'
import { VkApp, IVkDirector, VkScene, EndScene } from './../../../VkCore/Vk'
import { BasicMaterialScene } from './Basic/BasicMaterials';
import { MaterialScene, Material2Scene } from './Tutorials/Material';
import { BasicShapeScene } from './Basic/BasicTest';
import { MotorScene } from './Tutorials/Physics';
import { UIScene } from './Tutorials/UI';
import { SPSScene, SPS2Scene } from './Tutorials/SolidParticleSystem';
import { AnimationScene } from './Basic/Animation';
import { SoundScene } from './Basic/Sound';
import { CollisionScene } from './Basic/Collision';
import { FileLoaderScene } from './Tutorials/FileLoader';
import { ActionScene } from './Basic/Action';
import { ReflectionScene, RefractionScene, Refraction2Scene } from './Basic/Reflection';
import { PolyhedraScene } from './Basic/Polyhedra';
import { VLSScene, VLS2Scene } from './Basic/VLS';
import { BlendModeScene } from './Basic/BlendMode';
import { MeshLoaderScene, IMeshLoaderOptions } from './Basic/MeshLoader';
import { CameraScene, VRCamAndController6DOFScene } from './Basic/Camera';
import { FrameScene } from './Basic/Frame';
import { TerrainScene } from './Basic/Terrain';
import { Video360Scene } from './Basic/Video';
import { CornellScene } from './Basic/Cornell';

export class PlaygroundDirector implements IVkDirector {
    private _currentScene: VkScene = null;
    private _nextScene: VkScene = null;

    private uiScene: UIScene = null;
    private motorScene: MotorScene = null;
    private animationScene: AnimationScene = null;
    private bmScene: BasicMaterialScene = null;
    private materialScene: MaterialScene = null;
    private material2Scene: Material2Scene = null;
    private reflectionScene: ReflectionScene = null;
    private refractionScene: RefractionScene = null;
    private refraction2Scene: Refraction2Scene = null;
    private spsScene: SPSScene = null;
    private sps2Scene: SPS2Scene = null;
    private polyhedraScene : PolyhedraScene = null;
    private vlsScene: VLSScene = null;
    private vls2Scene: VLS2Scene = null;
    private meshLoaderScene: MeshLoaderScene = null;
    private blendModeScene: BlendModeScene = null;
    private fileLoaderScene: FileLoaderScene = null;
    private fileLoaderScene2: FileLoaderScene = null;
    private cameraScene: CameraScene = null;
    private frameScene: FrameScene = null;
    private vr6DOFScene: VRCamAndController6DOFScene = null;
    private terrainScene: TerrainScene = null;
    private video360Scene: Video360Scene = null;
    private cornellScene: CornellScene = null;

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
        if (this._currentScene instanceof MotorScene) {
            this._nextScene = this.material2Scene;
        }
        else if (this._currentScene instanceof Material2Scene) {
            this._nextScene = this.meshLoaderScene;
        }
        else if (this._currentScene instanceof MeshLoaderScene) {
            this._nextScene = this.vls2Scene;
        }
        else if (this._currentScene instanceof VLS2Scene) {
            this._nextScene = this.spsScene;
        }
        else if (this._currentScene instanceof SPSScene) {
            this._nextScene = this.materialScene;
        }
        else if (this._currentScene instanceof MaterialScene) {
            this._nextScene = this.video360Scene;
        }
        else if (this._currentScene instanceof Video360Scene) {
            this._nextScene = new EndScene();
        }
        //
        //
        //
        else if (this._currentScene instanceof CornellScene) {
            this._nextScene = this.meshLoaderScene;
        }
        else if (this._currentScene instanceof FrameScene) {
            this._nextScene = this.meshLoaderScene;
        }
        else if (this._currentScene instanceof FileLoaderScene) {
            this._nextScene = this.blendModeScene;
        }
        else if (this._currentScene instanceof BlendModeScene) {
            this._nextScene = this.vlsScene;
        }
        else if (this._currentScene instanceof VLSScene) {
            this._nextScene = this.vls2Scene;
        }
        else if (this._currentScene instanceof RefractionScene) {
            this._nextScene = this.refraction2Scene;
        }
        else if (this._currentScene instanceof Refraction2Scene) {
            this._nextScene = this.polyhedraScene;
        }
        else if (this._currentScene instanceof PolyhedraScene) {
            this._nextScene = this.spsScene;
        }
        else if (this._currentScene instanceof ReflectionScene) {
            this._nextScene = this.spsScene;
        }
        else if (this._currentScene instanceof BasicMaterialScene) {
            this._nextScene = this.animationScene;
        }
        else if (this._currentScene instanceof AnimationScene) {
            this._nextScene = this.uiScene;
        }
        else if (this._currentScene instanceof UIScene) {
            this._nextScene = this.motorScene;
        }
        else {
            this._nextScene = new EndScene();
        }
    }

    public start(): void {
        this.motorScene = new MotorScene();
        this.materialScene = new MaterialScene();
        this.material2Scene = new Material2Scene();
        this.video360Scene = new Video360Scene();
        this.spsScene = new SPSScene();
        this.spsScene.initialize();
        this.vls2Scene = new VLS2Scene();
        this.meshLoaderScene = new MeshLoaderScene(
            "assets/gltf/bellydance/",
            "scene.gltf",
            new BABYLON.Vector3(0, 10, -20),
            new BABYLON.Vector3(0, 5, 0),
            {
                envDdsFile: "assets/textures/environment.dds",
                soundFile: "assets/AmericanScience.mp3"
            }
        );

        //this.cornellScene = new CornellScene();
        //this.motorScene.initialize();
        //this.uiScene = new UIScene();
        //this.uiScene.initialize();
        //this.animationScene = new AnimationScene();
        //this.animationScene.initialize();
        //this.materialScene = new MaterialScene();
        //this.materialScene.initialize();
        //this.material2Scene.initialize();
        //this.bmScene = new BasicMaterialScene();
        //this.bmScene.initialize();
        //this.reflectionScene = new ReflectionScene();
        //this.reflectionScene.initialize();
        //this.sps2Scene = new SPS2Scene();
        //this.sps2Scene.initialize();
        //this.polyhedraScene = new PolyhedraScene();
        //this.polyhedraScene.initialize();
        //this.refractionScene = new RefractionScene();
        //this.refractionScene.initialize();
        //this.refraction2Scene = new Refraction2Scene();
        //this.refraction2Scene.initialize();
        //this.vlsScene.initialize();
        //this.vls2Scene = new VLS2Scene();
        //this.vls2Scene.initialize();

        /*
        this.meshLoaderScene = new MeshLoaderScene(
            "assets/gltf/car1/",
            "car1.glb",
            new BABYLON.Vector3(0, 1, -3),
            new BABYLON.Vector3(0, 1, 0),
            {
                rotate: true,
                scale: 3
            }
        );
        */
        /*
        this.meshLoaderScene = new MeshLoaderScene(
            "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/",
            "DamagedHelmet.gltf",
            new BABYLON.Vector3(0, 0, -3),
            new BABYLON.Vector3(0, 0, 0),
            {
                rotate: true
            }
        );
        */

        //this.meshLoaderScene.initialize();
        //this.blendModeScene = new BlendModeScene();
        //this.blendModeScene.initialize();
        /*
        this.fileLoaderScene = new FileLoaderScene(
            "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/",
            "DamagedHelmet.gltf",
            new BABYLON.Vector3(0, 0, -2),
            new BABYLON.Vector3(0, 0, 0));
            "assets/gltf/bellydance/",
            "scene.gltf",
            new BABYLON.Vector3(0, 10, -20),
            new BABYLON.Vector3(0, 5, 0));
        */
        //this.fileLoaderScene.initialize();
        /*
        this.fileLoaderScene2 = new FileLoaderScene(
            "assets/scenes/babylonjs/city/",
            "HugeCity.babylon",
            new BABYLON.Vector3(0, 200, -50),
            new BABYLON.Vector3(0, 5, 0));
            */
        //this.fileLoaderScene2.initialize();
        //this.vr6DOFScene = new VRCamAndController6DOFScene();
        //this.vr6DOFScene.initialize();
        //this.frameScene = new FrameScene();
        //this.frameScene.initialize();
        //this.terrainScene = new TerrainScene(new BABYLON.Vector3(0, 10, -20), BABYLON.Vector3.Zero());
        //this.terrainScene.initialize();

        this.setFirstScene(this.motorScene);
    }
}
