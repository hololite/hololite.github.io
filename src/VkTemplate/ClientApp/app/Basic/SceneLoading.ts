import 'babylonjs'
//import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../Common'
//import { Game } from 'Game'

class SceneLoadingScene {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera:    BABYLON.FreeCamera;
    private _light:     BABYLON.PointLight;
    
    constructor(canvas: HTMLCanvasElement) {
        // Engine
        this._engine = new BABYLON.Engine(canvas);
		this._canvas = <HTMLCanvasElement>document.getElementById(Common.canvasName);
        
    }
    
    /**
    * Runs the engine render loop
    */
    public runRenderLoop(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

	public loadScene(): void {
        /**
        * Load an exported scene
        * This static method contains 6 parameters
        * 1: the directory of the scene file
        * 2: the scene file name
        * 3: the Babylon.js engine
        * 4: a success callback, providing the new scene created by the loader
        * 5: progress callback, empty as default (can be null)
        * 6: error callback, providing the new scene created by the loader 
        */
        BABYLON.SceneLoader.Load("assets/scenes/", "skull.babylon", this._engine,
			(scene: BABYLON.Scene) => { // Success calblack
				this._scene = scene;

				this.appendScene();

			},
            () => { // Progress callback
                console.log('progress...');
            },
            (scene: BABYLON.Scene) => { // Error callback
                console.log('error');
				alert('error');
            }
        );
	}
    
    /**
    * This method appends new scene with the already existing scene
    * Here, we are appending the same scene at its original position
    */
    public appendScene(): void {
		BABYLON.SceneLoader.Append("assets/scenes/", "Rabbit.babylon", this._scene, (scene: BABYLON.Scene) => {
			this._scene.activeCamera.attachControl(this._canvas);
			this.runRenderLoop();
        }, () => {
			console.log('progress...');
        }, (scene: BABYLON.Scene) => {
			console.log('error');
			alert('error');
        });
    }
    
    /**
    * Import the skull mesh (available in the Babylon.js examples)
    * This methods imports meshes and only meshes.
    */
    public importMesh(): void {
		BABYLON.SceneLoader.ImportMesh("", "assets/meshes/", "cat.babylon", this._scene,
        (meshes, particles, skeletons) => { // Success callback
            // Here, meshes contains only one mesh: the skull (meshes[0])
            // Particles array is empty
            // skeletons array is empty
            
        }, () => { // Progress callback
			console.log('progress...');
            
        }, (scene: BABYLON.Scene, e: any) => {
			console.log('error');
            console.log(e.message);
			alert('error');
        });
    }
}

export function run(): void {
    let canvas = <HTMLCanvasElement>document.getElementById(Common.canvasName);
    let scene = new SceneLoadingScene(canvas);
	scene.loadScene();
	//scene.importMesh();
}
