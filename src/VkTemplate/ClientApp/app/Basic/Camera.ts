import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene, FirstScene } from '../../../../VkCore/Vk'
import { VkMenu } from '../../../../VkCore/VkMenu'

export class CameraScene extends VkScene {
    private menu: VkMenu = new VkMenu(this);
    private light: BABYLON.DirectionalLight;
    private meshes: BABYLON.AbstractMesh[] = null;
    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 5, -50)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        //console.log('**** CameraScene.onMenuButton');
        //this.menu.handleMenuButton(controller, pressed);
    }
    
    protected createAssets(): void {
        // Create VR camera assuming user height is 2 meters
        let camera = new BABYLON.WebVRFreeCamera("camera", new BABYLON.Vector3(0, 2, 0), this.scene);
        
        // Enable VR onClick
        this.scene.onPointerDown = () => {
            this.scene.onPointerDown = undefined;
            camera.attachControl(this.canvas, true);
        }    

        //this.menu.createAssets();
    }

    protected onStart(): void {
        //
        //this.menu.start();

        BABYLON.SceneLoader.ImportMesh("", "https://www.babylonjs.com/Assets/DamagedHelmet/glTF/", "DamagedHelmet.gltf", this.scene, (meshes) => {
            this.meshes = meshes;
            this.meshes[0].scaling.scaleInPlace(0.5)
            this.meshes[0].position.set(0,1.5,1)

            // Create light
            this.light = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(-2, -3, 1), this.scene);
            this.light.position = new BABYLON.Vector3(6, 9, 3);
            this.light.intensity = 0.5;  

            // Add shadows
            let generator = new BABYLON.ShadowGenerator(512, this.light);
            generator.useBlurExponentialShadowMap = true;
            generator.blurKernel = 32;
            for (let i = 0; i < this.scene.meshes.length; i++) {
                generator.addShadowCaster(this.meshes[i]);    
            }

            // Create basic scene
            let helper = this.scene.createDefaultEnvironment({
                enableGroundMirror: true,
                groundShadowLevel: 0.6
            });       
            helper.setMainColor(BABYLON.Color3.Teal());

            this.scene.onBeforeRenderObservable.add(()=>{
                this.meshes[0].rotation.y+=0.005
            })
        });
    }

    protected onStop(): void {
    }
}


export class VRCamAndController6DOFScene extends VkScene {
    private menu: VkMenu = new VkMenu(this);
    private light: BABYLON.DirectionalLight;
    private meshes: BABYLON.AbstractMesh[] = null;
    private leftHand: BABYLON.Mesh;         // its position follows the 6DOF of left controller
    private rightHand: BABYLON.Mesh;        // its position follows the 6DOF of right controller
    private head: BABYLON.Mesh;             // its position box follows the movement of the vrcam, the z coord is incremented by boxZDistanceFromCamera
    private readonly headZDistanceFromVRCam = 5;
        
    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 2, -5)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }
    
    protected createAssets(): void {
        let camera = new BABYLON.FreeCamera("",new BABYLON.Vector3(0,0,-1),this.scene)
        let light = new BABYLON.DirectionalLight("", new BABYLON.Vector3(0,-1,1), this.scene)
        light.position.y = 10;

        let sphere = BABYLON.Mesh.CreateSphere("", 10, 1, this.scene);
        sphere.position.set(0, 1.2, 0);
        let ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, this.scene);

        this.leftHand = BABYLON.Mesh.CreateBox("", 0.1, this.scene);
        this.leftHand.scaling.z = 2;
        this.rightHand = this.leftHand.clone("");
        this.head = BABYLON.Mesh.CreateBox("", 0.2, this.scene);

        this.menu.createAssets();
    }

    protected onStart(): void {
        // Logic to be run every frame
        this.scene.onBeforeRenderObservable.add(()=>{
            // Left and right hand position/rotation
            if (this.vrHelper.webVRCamera.leftController) {
                this.leftHand.position = this.vrHelper.webVRCamera.leftController.devicePosition.clone()
                this.leftHand.rotationQuaternion = this.vrHelper.webVRCamera.leftController.deviceRotationQuaternion.clone()
            }

            if (this.vrHelper.webVRCamera.rightController) {
                this.rightHand.position = this.vrHelper.webVRCamera.rightController.devicePosition.clone()
                this.rightHand.rotationQuaternion = this.vrHelper.webVRCamera.rightController.deviceRotationQuaternion.clone()
            }

            // Head position/rotation
            this.head.position = this.vrHelper.webVRCamera.devicePosition.clone()
            this.head.rotationQuaternion = this.vrHelper.webVRCamera.deviceRotationQuaternion.clone()
            this.head.position.z += this.headZDistanceFromVRCam;
        })

        this.menu.start();
    }

    protected onStop(): void {
    }
}
