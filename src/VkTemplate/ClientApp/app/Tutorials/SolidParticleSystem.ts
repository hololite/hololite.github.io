import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene } from '../../../../VkCore/Vk'
import { VkMenu } from '../../../../VkCore/VkMenu'

export class SPSScene extends VkScene {
    //private camera: BABYLON.ArcRotateCamera;
    private light: BABYLON.PointLight;
    private fact = 30; 			// cube size
    private SPS: BABYLON.SolidParticleSystem;
    private menu: VkMenu = new VkMenu(this);
    private static readonly floorName = "My Floor";
    
    constructor() {
        super({
            //floorName: SPSScene.floorName,
            cameraInitialPosition: new BABYLON.Vector3(0, 10, -40),
            cameraInitialTarget: new BABYLON.Vector3(0, 0, 0)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    private myPositionFunction(particle: BABYLON.SolidParticle): void {
        particle.position.x = (Math.random() - 0.5) * this.fact;
        particle.position.y = (Math.random() - 0.5) * this.fact;
        particle.position.z = (Math.random() - 0.5) * this.fact;
        particle.rotation.x = Math.random() * 3.15;
        particle.rotation.y = Math.random() * 3.15;
        particle.rotation.z = Math.random() * 1.5;
        particle.color = new BABYLON.Color4(particle.position.x / this.fact + 0.5, particle.position.y / this.fact + 0.5, particle.position.z / this.fact + 0.5, 1.0);
    };

    protected createAssets(): void {
        console.log('>>>> SPSScene.onInit');
        //this.camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 0, new BABYLON.Vector3(0, 0, -0), this.scene);
        //this.camera.setPosition(new BABYLON.Vector3(0, 10, -50));
        //this.camera.attachControl(this.getCanvas(), true);
        /*
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 0, 0), this.scene);
        light.intensity = 0.85;
        light.specular = new BABYLON.Color3(0.95, 0.95, 0.81);
        */
        this.light = new BABYLON.PointLight("pl", new BABYLON.Vector3(0, 0, 0), this.scene);
        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.intensity = 1.0;

        let nb = 20000;    		// nb of triangles

        // custom position function for SPS creation

        // model : triangle
        let triangle = BABYLON.MeshBuilder.CreateDisc("t", { tessellation: 3 }, this.scene);

        // SPS creation
        this.SPS = new BABYLON.SolidParticleSystem('SPS', this.scene);
        this.SPS.addShape(triangle, nb);
        let mesh = this.SPS.buildMesh();
        // dispose the model
        triangle.dispose();

        // SPS init
        this.SPS.initParticles = () => {
            for (let p = 0; p < this.SPS.nbParticles; p++) {
                this.myPositionFunction(this.SPS.particles[p]);
            }
        }

        this.SPS.updateParticle = (particle: BABYLON.SolidParticle) => {
            particle.rotation.x += particle.position.z / 100;
            particle.rotation.z += particle.position.x / 100;
            return particle;
        }

        this.SPS.initParticles();
        this.SPS.setParticles();

        // Optimizers after first setParticles() call
        // will be used only for the next setParticles() calls
        this.SPS.computeParticleColor = false;
        this.SPS.computeParticleTexture = false;

        this.menu.createAssets();
        console.log('<<<< SPSScene.onInit');
    }

    protected onStart(): void {
        // SPS mesh animation
        let black =  BABYLON.Color3.Black();
        let black4 = new BABYLON.Color4(black.r, black.g, black.b);
        this.scene.clearColor = black4;

        this.beforeRenderCallback = () => {
            //this.light.position = this.camera.position;
            this.SPS.mesh.rotation.y += 0.01;
            this.SPS.setParticles();
        }

        this.menu.start();
    }
}

export class SPS2Scene extends VkScene {
    private SPS: BABYLON.SolidParticleSystem;
    private menu: VkMenu = new VkMenu(this);
    private pl: BABYLON.Light;
    private ground: BABYLON.Mesh;
    private readonly k = 0.0005;
    
    constructor() {
        super({
            cameraInitialPosition: new BABYLON.Vector3(0, 10, -40),
            cameraInitialTarget: new BABYLON.Vector3(0, 0, 0)
        });
    }

    protected createAssets(): void {
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 0, 0), this.scene);
        light.intensity = 0.75;
        light.specular = new BABYLON.Color3(0.95, 0.95, 0.81);

	    //light.diffuse = new BABYLON.Color3(1, 0, 0);
	    //light.specular = new BABYLON.Color3(0, 1, 0);

        //this.pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(0, 100, 0), this.scene);
        this.pl = new BABYLON.DirectionalLight("pl", new BABYLON.Vector3(-1, -2, -1), this.scene);

        this.pl.diffuse = new BABYLON.Color3(1, 1, 1);
        this.pl.specular = new BABYLON.Color3(0.1, 0.1, 0.12);
        this.pl.intensity = 0.75;

        let nbBuildings = 10000;
        let fact = 1000;   // density
        let scaleX = 0.0;
        let scaleY = 0.0;
        let scaleZ = 0.0;
        let grey = 0.0;
        let uvSize = 0.0;

        // Create terrain material
        let terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", this.scene);
        terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        terrainMaterial.specularPower = 64;
        
        // Set the mix texture (represents the RGB values)
        terrainMaterial.mixTexture = new BABYLON.Texture("assets/textures/mixMap.png", this.scene);
        
        // Diffuse assets/textures following the RGB values of the mix map
        // diffuseTexture1: Red
        // diffuseTexture2: Green
        // diffuseTexture3: Blue
        terrainMaterial.diffuseTexture1 = new BABYLON.Texture("assets/textures/floor.png", this.scene);
        terrainMaterial.diffuseTexture2 = new BABYLON.Texture("assets/textures/rock.png", this.scene);
        terrainMaterial.diffuseTexture3 = new BABYLON.Texture("assets/textures/grass.png", this.scene);
        
        // Bump assets/textures according to the previously set diffuse assets/textures
        terrainMaterial.bumpTexture1 = new BABYLON.Texture("assets/textures/floor_bump.png", this.scene);
        terrainMaterial.bumpTexture2 = new BABYLON.Texture("assets/textures/rockn.png", this.scene);
        terrainMaterial.bumpTexture3 = new BABYLON.Texture("assets/textures/grassn.png", this.scene);
       
        // Rescale assets/textures according to the terrain
        terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 50;
        terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 50;
        terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 50;

        this.ground = BABYLON.MeshBuilder.CreatePlane("g", { size: fact }, this.scene);
        this.addTeleportMesh(this.ground);
        this.ground.rotation.x = Math.PI / 2;
        this.ground.material = terrainMaterial;

        let url = "assets/glassbuilding2.jpg";
        let mat = new BABYLON.StandardMaterial("mat1", this.scene);
        let texture = new BABYLON.Texture(url, this.scene);
        mat.diffuseTexture = texture;


        // custom position function
        let myPositionFunction = function (particle, i, s) {
            scaleX = Math.random() * 6 + 2.8;
            scaleY = Math.random() * 26 + 2.8;
            scaleZ = Math.random() * 6 + 2.8;
            uvSize = Math.random() * 0.9;
            particle.scale.x = scaleX;
            particle.scale.y = scaleY;
            particle.scale.z = scaleZ;
            particle.position.x = (Math.random() - 0.5) * fact;
            particle.position.y = particle.scale.y / 2 + 0.01;
            particle.position.z = (Math.random() - 0.5) * fact;
            particle.rotation.y = Math.random() * 3.5;
            grey = 1.0 - Math.random() * 0.5;
            particle.color = new BABYLON.Color4(grey + 0.1, grey + 0.1, grey, 1);
            particle.uvs.x = Math.random() * 0.1;
            particle.uvs.y = Math.random() * 0.1;
            particle.uvs.z = particle.uvs.x + uvSize;
            particle.uvs.w = particle.uvs.y + uvSize;
        };

        // Particle system creation : Immutable
        this.SPS = new BABYLON.SolidParticleSystem('SPS', this.scene, { updatable: false });
        let model = BABYLON.MeshBuilder.CreateBox("m", {}, this.scene);
        this.SPS.addShape(model, nbBuildings, { positionFunction: myPositionFunction });
        let mesh = this.SPS.buildMesh();
        mesh.material = mat;

        let shadowGenerator = new BABYLON.ShadowGenerator(1024, <BABYLON.IShadowLight>this.pl);
        shadowGenerator.getShadowMap().renderList.push(mesh);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 64;
        this.ground.receiveShadows = true;

        // dispose the model
        model.dispose();
        this.menu.createAssets();
    }

    protected onStart(): void {
        //this.scene.clearColor = new BABYLON.Color4(.1, .1, .15);
        let black =  BABYLON.Color3.Black();
        let black4 = new BABYLON.Color4(black.r, black.g, black.b);
        this.scene.clearColor = black4;

        //this.pl.position = this.getDefaultCamera().position;
        this.menu.start();
    }
}
