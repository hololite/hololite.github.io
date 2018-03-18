import 'babylonjs'
import { Common } from '../../../../VkCore/Common'
import { VkScene } from '../../../../VkCore/Vk'

class BasicShape2 extends VkScene {
    protected camera: BABYLON.Camera;
    protected light: BABYLON.Light;

    constructor() {
        super({
            attachCamera: true,
            cameraInitialPosition: new BABYLON.Vector3(0, 15, -30),
            cameraInitialTarget: new BABYLON.Vector3(10, 0, 0)
        });
    }

    private createCameraAndLight(): void {
        // Camera
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 30, BABYLON.Vector3.Zero(), this.scene);
        this.camera.attachControl(this.canvas, true); 
        
        // Light
        this.light = new BABYLON.PointLight("light", new BABYLON.Vector3(20, 20, 20), this.scene);
        this.light.diffuse = new BABYLON.Color3(0, 1, 0);
        this.light.specular = new BABYLON.Color3(1, 0, 1);
        this.light.intensity = 1.0;
    }

    protected createAssets(): void {
        this.createCameraAndLight();

        BABYLON.Mesh.CreateBox("cube", 5, this.scene);
    }
}
