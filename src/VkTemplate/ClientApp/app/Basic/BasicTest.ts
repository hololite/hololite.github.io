import 'babylonjs'
import { Common } from '../Common'
import { VkScene } from '../Vk'

export class BasicShapeScene extends VkScene {
    protected camera: BABYLON.FreeCamera;
    protected light: BABYLON.Light;

    constructor() {
        super({
            attachCamera: true,
            cameraInitialPosition: new BABYLON.Vector3(0, 1, -10),
            cameraInitialTarget: new BABYLON.Vector3(0, 0, 0)
        });
    }

    protected createAssets(): void {
        // create a basic BJS Scene object

        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), this.scene);

        // target the camera to this.scene origin
        this.camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        this.camera.attachControl(this.canvas, false);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this.scene);

        // create a built-in "sphere" shape; with 16 segments and diameter of 2
        let sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {segments: 16, diameter: 2}, this.scene);

        // move the sphere upward 1/2 of its height
        sphere.position.y = 1;

        // create a built-in "ground" shape
        let ground = BABYLON.MeshBuilder.CreateGround('ground1', {width: 6, height: 6, subdivisions: 2}, this.scene);
    }
}
