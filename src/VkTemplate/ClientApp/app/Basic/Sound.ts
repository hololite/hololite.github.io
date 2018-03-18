import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene } from '../../../../VkCore/Vk'

export class SoundScene extends VkScene {
    /*
    * Private members
    */
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.PointLight;
    private _plane: BABYLON.Mesh;
    private _box: BABYLON.Mesh;
    private _sound2D: BABYLON.Sound;
    private _sound3D: BABYLON.Sound;
    private static readonly floorName = "My Floor";

    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(20, 20, -10)
        });
    }

    /*
    * Creates the sounds (2D & 3D)
    */
    private createSounds(): void {
        // Create a 2D Sound and handle the readyToPlay callback
        /*
        this._sound2D = new BABYLON.Sound("Sound2D", "assets/sound2d.mp3", this.scene, () => {
            this._sound2D.play();
        }, { loop: true, autoplay: false, volume: 1, playbackRate: 1 });
        */
        
        // Create a 3D Sound
        //this._sound3D = new BABYLON.Sound("Sound3D", "assets/violons11.wav", this.scene, () => {
        this._sound3D = new BABYLON.Sound("Sound3D", "assets/dreamer.mp3", this.scene, () => {
            
        }, { loop: true, autoplay: true, volume: 0.3, spatialSound: true, distanceModel: "linear" });
        
        // Set 3D sound's position
        this._sound3D.setPosition(new BABYLON.Vector3(3, 1, 3));
        
        // Set 3D sound's max distance (linear model)
        this._sound3D.maxDistance = 5;
    }
    
    /**
    * Configures collisions in scene with gravity and ellipsoid
    */
    private createCollisions() : void {
        // Enable collisions in scene
        this.scene.collisionsEnabled = true;
        
        // Enable gravity on camera
        this._camera.applyGravity = true;
        
        // Configure camera to check collisions
        this._camera.checkCollisions = true;
        
        // Configure camera's ellipsoid
        this._camera.ellipsoid = new BABYLON.Vector3(1, 1.8, 1);
        
        // Configure gravity in scene
        this.scene.gravity = new BABYLON.Vector3(0, -0.03, 0);
        
        // Enable collisions on plane and box
        this._plane.checkCollisions = true;
        this._box.checkCollisions = true;
    }
    
    /**
    * Creates a scene with a plane and 6 spheres
    */
    public createScene(): void {
        this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(29, 13, 23), this.scene);
        this._camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        this._camera.attachControl(this.canvas);
        
        // Light
        this._light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-60, 60, 80), this.scene);
        this._light.intensity = 1;

        // Textures
        let diffuseTexture = new BABYLON.Texture("assets/floor_diffuse.png", this.scene);
        diffuseTexture.vScale = diffuseTexture.uScale = 5.0;
        
        let bumpTexture = new BABYLON.Texture("assets/floor_bump.png", this.scene);
        bumpTexture.vScale = bumpTexture.uScale = 5.0;
        
        let boxTexture = new BABYLON.Texture("assets/wood.jpg", this.scene);
        
        // Materials
        let planeMaterial = new BABYLON.StandardMaterial("plane_material", this.scene);
        planeMaterial.diffuseTexture = diffuseTexture;
        planeMaterial.bumpTexture = bumpTexture;
        
        let boxMaterial = new BABYLON.StandardMaterial("box_material", this.scene);
        boxMaterial.diffuseTexture = boxTexture;
        
        // Meshes
        this._plane = BABYLON.Mesh.CreateGround(SoundScene.floorName, 100, 100, 2, this.scene);
        this._plane.material = planeMaterial;
        
        this._box = BABYLON.Mesh.CreateBox("box", 5, this.scene);
        this._box.refreshBoundingInfo();
        this._box.position.x = 20;
        this._box.position.y = 2.5;
        this._box.material = boxMaterial;
    }

    protected createAssets(): void {
        this.createScene();
        this.createSounds();
    }
}
