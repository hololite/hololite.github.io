import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, FirstScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class ReflectionScene extends FirstScene {
    private yellowSphere: BABYLON.Mesh;
    private blueSphere: BABYLON.Mesh;
    private greenSphere: BABYLON.Mesh;
    private menu: VkMenu = new VkMenu(this);
        
    private static readonly floorName = "My Floor";

    constructor() {
        super({
            //floorName: ReflectionScene.floorName,
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 2, -10)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }
    
    protected createAssets(): void {
        /*
        let camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
        camera.setPosition(new BABYLON.Vector3(0, 5, -10));
        camera.attachControl(this.canvas, true);
        camera.upperBetaLimit = Math.PI / 2;
        camera.lowerRadiusLimit = 4;
        */
    
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
    
        let knot = BABYLON.Mesh.CreateTorusKnot("knot", 1, 0.4, 128, 64, 2, 3, this.scene);
            
        this.yellowSphere = BABYLON.Mesh.CreateSphere("yellowSphere", 16, 1.5, this.scene);
        this.yellowSphere.setPivotMatrix(BABYLON.Matrix.Translation(3, 0, 0));
        
        this.blueSphere = BABYLON.Mesh.CreateSphere("blueSphere2", 16, 1.5, this.scene);
        this.blueSphere.setPivotMatrix(BABYLON.Matrix.Translation(-1, 3, 0));
        
        this.greenSphere = BABYLON.Mesh.CreateSphere("greenSphere2", 16, 1.5, this.scene);
        this.greenSphere.setPivotMatrix(BABYLON.Matrix.Translation(0, 0, 3));
    
        let generateSatelliteMaterial = (root, color, others) => {
            let material = new BABYLON.StandardMaterial("satelliteMat", this.scene);
            material.diffuseColor = color;
            
            let probe = new BABYLON.ReflectionProbe("satelliteProbe", 512, this.scene);
            for (let index = 0; index < others.length; index++) {
                probe.renderList.push(others[index]);			
            }
            
            material.reflectionTexture = probe.cubeTexture;
            
            material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
            material.reflectionFresnelParameters.bias = 0.02;
            
            root.material = material;
            probe.attachToMesh(root);
        }
        
        // Mirror
        let mirror = BABYLON.Mesh.CreateBox("Mirror", 1.0, this.scene);
        this.addTeleportMesh(mirror);
        mirror.scaling = new BABYLON.Vector3(100.0, 0.01, 100.0);

        let sm = new BABYLON.StandardMaterial("mirror", this.scene);
        sm.diffuseTexture = new BABYLON.Texture("assets/textures/amiga.jpg", this.scene);
        (<BABYLON.Texture>sm.diffuseTexture).uScale = 10;
        (<BABYLON.Texture>sm.diffuseTexture).vScale = 10;
        sm.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, this.scene, true);
        sm.reflectionTexture.level = 0.5;
        (<BABYLON.MirrorTexture>sm.reflectionTexture).mirrorPlane = new BABYLON.Plane(0, -1.0, 0, -2.0);
        (<BABYLON.MirrorTexture>sm.reflectionTexture).renderList = [this.greenSphere, this.yellowSphere, this.blueSphere, knot];
        mirror.material = sm;
        mirror.position = new BABYLON.Vector3(0, -2, 0);	
        
        // Main material	
        let mainMaterial = new BABYLON.StandardMaterial("main", this.scene);
        knot.material = mainMaterial;
        
        let probe = new BABYLON.ReflectionProbe("main", 512, this.scene);
        probe.renderList.push(this.yellowSphere);
        probe.renderList.push(this.greenSphere);	
        probe.renderList.push(this.blueSphere);	
        probe.renderList.push(mirror);	
        mainMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0.5);	
        mainMaterial.reflectionTexture = probe.cubeTexture;
        mainMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
        mainMaterial.reflectionFresnelParameters.bias = 0.02;
            
        // Satellite
        generateSatelliteMaterial(this.yellowSphere, BABYLON.Color3.Yellow(), [this.greenSphere, this.blueSphere, knot, mirror]);
        generateSatelliteMaterial(this.greenSphere, BABYLON.Color3.Green(), [this.yellowSphere, this.blueSphere, knot, mirror]);
        generateSatelliteMaterial(this.blueSphere, BABYLON.Color3.Blue(), [this.greenSphere, this.yellowSphere, knot, mirror]);
    
        this.menu.createAssets();
    }

    protected onStart(): void {
        // Fog
        this.scene.fogEnabled = true;
        this.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        //this.scene.fogColor = this.scene.clearColor;
        this.scene.fogStart = 20.0;
        this.scene.fogEnd = 50.0;

        // Animations
        this.beforeRenderCallback = () => {
            this.yellowSphere.rotation.y += 0.01;
            this.greenSphere.rotation.y += 0.03;
            this.blueSphere.rotation.y += 0.05;
        };

        this.menu.start();
    }

    protected onStop(): void {
        this.scene.fogEnabled = false;
        this.scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
    }
}

export class RefractionScene extends FirstScene {
    private yellowSphere: BABYLON.Mesh;
    private blueSphere: BABYLON.Mesh;
    private greenSphere: BABYLON.Mesh;
    private menu: VkMenu = new VkMenu(this);
        
    private static readonly floorName = "My Floor";

    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 2, -10)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }
    
    protected createAssets(): void {
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
            
        let disc = BABYLON.Mesh.CreateDisc("disc", 3, 60, this.scene);
        disc.position.y += 2;

        this.yellowSphere = BABYLON.Mesh.CreateSphere("yellowSphere", 16, 1.5, this.scene);
        this.yellowSphere.setPivotMatrix(BABYLON.Matrix.Translation(3, 0, 0));
        let yellowMaterial = new BABYLON.StandardMaterial("yellowMaterial", this.scene);
        yellowMaterial.diffuseColor = BABYLON.Color3.Yellow();
        this.yellowSphere.material = yellowMaterial;
        
        this.blueSphere = BABYLON.Mesh.CreateSphere("blueSphere2", 16, 1.5, this.scene);
        this.blueSphere.setPivotMatrix(BABYLON.Matrix.Translation(-1, 3, 0));
        let blueMaterial = new BABYLON.StandardMaterial("blueMaterial", this.scene);
        blueMaterial.diffuseColor = BABYLON.Color3.Blue();
        this.blueSphere.material = blueMaterial;
        
        this.greenSphere = BABYLON.Mesh.CreateSphere("greenSphere2", 16, 1.5, this.scene);
        this.greenSphere.setPivotMatrix(BABYLON.Matrix.Translation(0, 0, 3));
        let greenMaterial = new BABYLON.StandardMaterial("greenMaterial", this.scene);
        greenMaterial.diffuseColor = BABYLON.Color3.Green();
        this.greenSphere.material = greenMaterial;
        
        // Ground 
        let ground = BABYLON.Mesh.CreateBox("Mirror", 1.0, this.scene);
        ground.scaling = new BABYLON.Vector3(100.0, 0.01, 100.0);
        let sm = new BABYLON.StandardMaterial("mirror", this.scene);
        ground.material = sm;
        sm.diffuseTexture = new BABYLON.Texture("assets/textures/amiga.jpg", this.scene);
        (<BABYLON.Texture>sm.diffuseTexture).uScale = 10;
        (<BABYLON.Texture>sm.diffuseTexture).vScale = 10;
        ground.position = new BABYLON.Vector3(0, -2, 0);	
        
        // Main material	
        let mainMaterial = new BABYLON.StandardMaterial("main", this.scene);
        disc.material = mainMaterial;
        
        let refractionTexture = new BABYLON.RefractionTexture("main", 1024, this.scene);
        refractionTexture.renderList.push(this.yellowSphere);
        refractionTexture.renderList.push(this.greenSphere);	
        refractionTexture.renderList.push(this.blueSphere);	
        refractionTexture.renderList.push(ground);	
        refractionTexture.refractionPlane = new BABYLON.Plane(0, 0, -1, 0);
        refractionTexture.depth = 2;

        mainMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);	
        mainMaterial.reflectionTexture = refractionTexture;
        mainMaterial.indexOfRefraction = 0.6;
    
        this.menu.createAssets();
    }

    protected onStart(): void {
        // Animations
        this.beforeRenderCallback = () => {
            this.yellowSphere.rotation.y += 0.01;
            this.greenSphere.rotation.y += 0.03;
            this.blueSphere.rotation.y += 0.05;
        };

        this.menu.start();
    }

    protected onStop(): void {
    }
}

export class Refraction2Scene extends FirstScene {
    private IoR = 0.1;
    private theta = 0;
    private waterMaterial: BABYLON.StandardMaterial;
    private menu: VkMenu = new VkMenu(this);
        
    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(10, 2, -20)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }
    
    protected createAssets(): void {
        let light = new BABYLON.PointLight("hemi", new BABYLON.Vector3(25, 25, -10), this.scene);
	
        //Objects to reflect
        let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {}, this.scene);
        sphere.position.z = 6;
        
        let redMaterial = new BABYLON.StandardMaterial("red", this.scene);
        redMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        
        sphere.material = redMaterial;
        
        //Creation of a water plane
        let water = BABYLON.MeshBuilder.CreatePlane("water", {width: 15, height: 15}, this.scene);

        //Create the water material
        this.waterMaterial = new BABYLON.StandardMaterial("water", this.scene);
        this.waterMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        let refractionTexture = new BABYLON.RefractionTexture("water", 1024, this.scene, true);
        this.waterMaterial.refractionTexture = refractionTexture;
        refractionTexture.refractionPlane = new BABYLON.Plane(0, 0, -1, 1);
        refractionTexture.renderList = [sphere];
        refractionTexture.depth = 50;

        this.waterMaterial.indexOfRefraction = 0.1;
        water.material = this.waterMaterial;
        this.waterMaterial.alpha = 0.5;        
    
        this.menu.createAssets();
    }

    protected onStart(): void {
        // Animations
        this.beforeRenderCallback = () => {
            this.waterMaterial.indexOfRefraction = this.IoR + Math.abs(Math.cos(this.theta) * 1.5);
            //console.log(waterMaterial.indexOfRefraction);
            this.theta += 0.015;
        };

        this.menu.start();
    }
}
