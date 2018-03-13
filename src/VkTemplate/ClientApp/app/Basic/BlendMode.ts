import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, FirstScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class BlendModeScene extends VkScene {
    private menu: VkMenu = new VkMenu(this);
        
    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 5, -50)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        console.log('**** BlendModeScene.onMenuButton');
        this.menu.handleMenuButton(controller, pressed);
    }
    
    protected createAssets(): void {
        //Create a light
        let light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-60, 60, 80), this.scene);
    
        //Create an Arc Rotate Camera - aimed negative z this time
        //let camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, 1.0, 110, BABYLON.Vector3.Zero(), this.scene);
        //camera.attachControl(this.canvas, true);
    
        //Creation of a plane
        let plane = BABYLON.Mesh.CreatePlane("plane", 250, this.scene);
        // the teleportMeshes call actually broke the menu popup
        //this.teleportMeshes.push(plane);
        plane.position.y = -8;
        plane.rotation.x = Math.PI / 2;
    
        //Creation of a repeated textured material
        let materialPlane = new BABYLON.StandardMaterial("texturePlane", this.scene);
        let texture = new BABYLON.Texture("assets/textures/grass.jpg", this.scene);
        materialPlane.diffuseTexture = texture;
        texture.uScale = 5.0;//Repeat 5 times on the Vertical Axes
        texture.vScale = 5.0;//Repeat 5 times on the Horizontal Axes
        materialPlane.backFaceCulling = false;//Allways show the front and the back of an element
    
        plane.material = materialPlane;
    
        // materials
        let material_base = new BABYLON.StandardMaterial("mat", this.scene);
        material_base.diffuseTexture = new BABYLON.Texture("assets/textures/misc.jpg", this.scene);
        material_base.alpha = 0.9999;		// artificially set the material as alpha blended
        material_base.ambientColor = BABYLON.Color3.White();
        
        let alphamodes = [
            BABYLON.Engine.ALPHA_COMBINE,
            BABYLON.Engine.ALPHA_ADD,
            BABYLON.Engine.ALPHA_SUBTRACT,
            BABYLON.Engine.ALPHA_MULTIPLY,
            BABYLON.Engine.ALPHA_MAXIMIZED
        ];
        
        // cubes
        let count = 5;
        let mesh;
        let mat;
        let angle;
        for (let i = 0; i < count; i++) {
            //angle = Math.PI * 2 * i / count;
            //mesh = BABYLON.Mesh.CreateBox("cube" + i, 12, this.scene);
            mesh = BABYLON.Mesh.CreateCylinder("aaa", 12, 8, 8, 12, 1, this.scene);
            mesh.position.x = -17 * (i +0.5 - count/2);
            //mesh.rotation.y = Math.PI * 2 - angle;
            mesh.rotation.y = 8;
            mat = material_base.clone(null);
            mat.alphaMode = alphamodes[i];
            mesh.material = mat;
        }
        
        this.menu.createAssets();
    }

    protected onStart(): void {
        this.scene.ambientColor = new BABYLON.Color3(0.05, 0.2, 0.05);
        this.menu.start();
    }

    protected onStop(): void {
    }
}
