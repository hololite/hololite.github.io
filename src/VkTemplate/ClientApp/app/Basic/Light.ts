import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene, FirstScene } from '../../../../VkCore/Vk'
import { VkMenu } from '../../../../VkCore/VkMenu'

export class LightScene extends VkScene {
    private menu: VkMenu = new VkMenu(this);
    private light: BABYLON.Light;

    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 3, -3)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    private createPointLight(): BABYLON.Light {
        let light = new BABYLON.PointLight(
            "light",
            new BABYLON.Vector3(0, 5, -2),   // position of point light
            this.scene);
        light.direction = new BABYLON.Vector3(-3, -6, 3);  // direction of shadow
        light.diffuse = BABYLON.Color3.FromInts(102, 255, 255);
        light.specular = BABYLON.Color3.FromInts(255, 102, 255);

        return light;
    }

    private createDirectionalLight(): BABYLON.Light {
        //Light direction is directly down
        let light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(-2, -4, -2), this.scene);
        //light.diffuse = new BABYLON.Color3(1, 0, 0);
        //light.specular = new BABYLON.Color3(0, 1, 0);
        light.diffuse = BABYLON.Color3.FromInts(102, 255, 255);
        light.specular = BABYLON.Color3.FromInts(255, 102, 255);

        return light;
    }

    private createSpotLight(): BABYLON.Light {
        //Light direction is directly down from a position one unit up, slow decay
        let light = new BABYLON.SpotLight(
            "spotLight",
            //new BABYLON.Vector3(-1, 3, -1),     // position of light
            new BABYLON.Vector3(0, 3, 0),     // position of light
            new BABYLON.Vector3(0, -1, 0),      // direction of light - straight down
            Math.PI / 2,                        // angle of cone in radians
            10,                                 // exponent of decay
            this.scene
        );
        //light.diffuse = new BABYLON.Color3(1, 0, 0);
        //light.specular = new BABYLON.Color3(0, 1, 0);
        light.diffuse = BABYLON.Color3.FromInts(102, 255, 255);
        light.specular = BABYLON.Color3.FromInts(255, 102, 255);

        console.log(`shadowEnabled=${light.shadowEnabled}`);

        return light;
    }

    private createHemisphericLight(): BABYLON.Light {
        //Light direction is up and left
        let light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), this.scene);
        light.diffuse = BABYLON.Color3.FromInts(102, 255, 255);
        light.specular = BABYLON.Color3.FromInts(255, 102, 255);
        light.groundColor = BABYLON.Color3.FromInts(255, 255, 102);

        return light;
    }
    
    protected createAssets(): void {
        //this.light = this.createDirectionalLight();
        this.light = this.createSpotLight();
        //this.light = this.createPointLight();
        //this.light = this.createHemisphericLight();

        let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {}, this.scene);
        sphere.position.y = 1;

        let cube = BABYLON.MeshBuilder.CreateBox("box", { width: 1, height: 0.25, depth: 1}, this.scene);
        cube.position.x = -1;
        cube.position.y = 0.125;
        cube.rotation.y += Math.PI/4;
        cube.receiveShadows = true;     // render shadow on this mesh

        let cube2 = BABYLON.MeshBuilder.CreateBox("box", { width: 1, height: 0.25, depth: 1}, this.scene);
        cube2.position.x = 0.5;
        cube2.position.y = 0.125;
        cube2.position.z = -1;
        cube2.rotation.y += Math.PI/6;
        cube2.receiveShadows = true;     // render shadow on this mesh

        let ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 4, height: 4}, this.scene);		
        this.addTeleportMesh(ground);
        ground.receiveShadows = true;   // render shadow on this mesh
        console.log(`ground.receiveShadows=${ground.receiveShadows}`);

        // define which meshes can cause shadow (by blocking light)
        if (this.light instanceof BABYLON.ShadowLight) {
            console.log('shadow light');
            let shadowLight = <BABYLON.IShadowLight>this.light;
            let shadowGenerator = new BABYLON.ShadowGenerator(2014, shadowLight);
            shadowGenerator.getShadowMap().renderList.push(sphere);
            //shadowGenerator.getShadowMap().renderList.push(cube);
            shadowGenerator.useBlurExponentialShadowMap = true;
        }
        else {
            console.log('non shadow light');
        }

        this.menu.createAssets();
    }

    protected onStart(): void {
        this.menu.start();
    }

    protected onStop(): void {
    }
}

export class ShadowScene extends VkScene {
    private menu: VkMenu = new VkMenu(this);
    private light: BABYLON.Light;

    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 30, -20)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    protected createAssets(): void {
        // light1
        let light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), this.scene);
        light.position = new BABYLON.Vector3(20, 40, 20);

        let lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 2, this.scene);
        lightSphere.position = light.position;
        let material = new BABYLON.StandardMaterial("light", this.scene);
        material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        lightSphere.material = material;

        // Ground
        let ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/textures/heightMap.png", 100, 100, 100, 0, 10, this.scene, false);
        this.addTeleportMesh(ground);
        let groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
        let texture = new BABYLON.Texture("assets/textures/ground.jpg", this.scene);
        texture.uScale = 6;
        texture.vScale = 6;
        groundMaterial.diffuseTexture = texture;
        groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        ground.position.y = -2.05;
        ground.material = groundMaterial;

        // Torus
        let torus = BABYLON.Mesh.CreateTorus("torus", 4, 2, 30, this.scene, false);
        torus.position = new BABYLON.Vector3(30, 30,0);

        // Shadows
        let shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
        shadowGenerator.getShadowMap().renderList.push(torus);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 64;

        ground.receiveShadows = true;

        this.menu.createAssets();
    }

    protected onStart(): void {

        this.menu.start();
    }

    protected onStop(): void {
    }
}
