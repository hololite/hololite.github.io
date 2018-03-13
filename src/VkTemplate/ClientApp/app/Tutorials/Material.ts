import 'babylonjs'
//import 'babylonjs-gui'
//import 'babylonjs-loaders'
import 'babylonjs-materials'
//import 'cannon';
//import 'oimo';
import { Common } from '../Common'
import { VkScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class MaterialScene extends VkScene {
    private menu: VkMenu = new VkMenu(this);

    constructor() {
        super({
            cameraInitialPosition: new BABYLON.Vector3(0, 50, -30),
            cameraInitialTarget: new BABYLON.Vector3(0, 30, 40)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    protected createAssets(): void {
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        let skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, this.scene);
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);

        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/TropicalSunnyDay", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
            
        // Water
        let waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 2048, 2048, 16, this.scene, false);
        let water = new BABYLON.WaterMaterial("water", this.scene, new BABYLON.Vector2(512, 512));

        water.backFaceCulling = true;
        water.bumpTexture = new BABYLON.Texture("assets/textures/waterbump.png", this.scene);
        water.windForce = -10;
        water.waveHeight = 1.7;
        water.bumpHeight = 0.1;
        water.windDirection = new BABYLON.Vector2(1, 1);
        water.waterColor = new BABYLON.Color3(0, 0, 221 / 255);
        water.colorBlendFactor = 0.0;
        water.addToRenderList(skybox);
        waterMesh.material = water;

        this.menu.createAssets();
    }

    protected onStart(): void {
        this.menu.start();
    }
}

export class Material2Scene extends VkScene {
    private menu: VkMenu = new VkMenu(this);
    private spotLight: BABYLON.SpotLight;
    private alpha = 0;

    constructor() {
        super({
            cameraInitialPosition: new BABYLON.Vector3(0, 20, -30),
            cameraInitialTarget: new BABYLON.Vector3(0, 0, 0)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    protected createAssets(): void {
        let light = new BABYLON.HemisphericLight("dir01", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.1;
        
        // spot
        this.spotLight = new BABYLON.SpotLight("spot02", new BABYLON.Vector3(30, 40, 30),
            new BABYLON.Vector3(-1, -2, -1), 1.1, 16, this.scene);
        this.spotLight.projectionTexture = new BABYLON.Texture("assets/textures/co.png", this.scene);
        this.spotLight.setDirectionToTarget(BABYLON.Vector3.Zero());
        this.spotLight.intensity = 1.5;
    
        // Ground
        let ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/textures/heightMap.png", 100, 100, 100, 0, 10, this.scene, false);
        this.teleportMeshes.push(ground);
        let groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
        let texture = new BABYLON.Texture("assets/textures/ground.jpg", this.scene);
        texture.uScale = 6;
        texture.vScale = 6;
        groundMaterial.diffuseTexture = texture;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.position.y = -2.05;
        ground.material = groundMaterial;

        this.menu.createAssets();
    }

    protected onStart(): void {
        // Animations
        this.beforeRenderCallback = () => {
            this.spotLight.position = new BABYLON.Vector3(Math.cos(this.alpha) * 60, 40, Math.sin(this.alpha) * 60);
            this.spotLight.setDirectionToTarget(BABYLON.Vector3.Zero());
            this.alpha += 0.01;
        };

        this.menu.start();
    }
}
