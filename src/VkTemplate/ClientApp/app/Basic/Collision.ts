import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene } from '../../../../VkCore/Vk'
import { VkMenu } from '../../../../VkCore/VkMenu'

export class CollisionScene extends VkScene {
    private _camera:    BABYLON.FreeCamera = this.getDefaultCamera();
    private _light:     BABYLON.PointLight;
    private _plane:     BABYLON.Mesh;
    private _box:       BABYLON.Mesh;
    private _box2:      BABYLON.Mesh;
    private _sphere:    BABYLON.Mesh;
    private menu: VkMenu = new VkMenu(this);
    private static readonly floorName = "ground";
    
    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 10, -40)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }
    
    /**
    * Configures collisions in scene with gravity and ellipsoid
    */
    public addCollision() : void {
        // Camera
        //this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(29, 13, 23), this.scene);
        
        // Light

        // Enable collisions in scene
        this.scene.collisionsEnabled = true;
        
        // Enable gravity on camera
        this._camera.applyGravity = true;
        
        /*
        // Configure camera to check collisions
        this._camera.checkCollisions = true;
        
        // Configure camera's ellipsoid
        this._camera.ellipsoid = new BABYLON.Vector3(1, 1.8, 1);
        
        // Configure gravity in scene
        this.scene.gravity = new BABYLON.Vector3(0, -0.03, 0);
        */
        
        // Enable collisions on plane and box
        this._plane.checkCollisions = true;
        this._box.checkCollisions = true;
        this._box2.checkCollisions = true;
        this._sphere.checkCollisions = true;
    }
    
    /**
    * Creates physics in scene with the Oimo.js plugin
    * Uses different impostors for sphere and boxes
    */
    private addPhysics(): void {
        this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.OimoJSPlugin());

        //this._plane.setPhysicsState(BABYLON.PhysicsEngine.PlaneImpostor, { mass: 0, friction: 0.5, restitution: 0.5 });
        this._plane.physicsImpostor = new BABYLON.PhysicsImpostor(this._plane, BABYLON.PhysicsImpostor.PlaneImpostor, { mass: 0, friction: 0.5, restitution: 0.5 }, this.scene);

        //this._box.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 });
        this._box.physicsImpostor = new BABYLON.PhysicsImpostor(this._box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 }, this.scene);

        //this._box2.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 });
        this._box2.physicsImpostor = new BABYLON.PhysicsImpostor(this._box2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 }, this.scene);

        //this._sphere.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 10, friction: 0.5, restitution: 0 });
        this._sphere.physicsImpostor = new BABYLON.PhysicsImpostor(this._sphere, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 10, friction: 0.5, restitution: 0.5 }, this.scene);
        
        this._box2.applyImpulse(new BABYLON.Vector3(-18, 0, 0), new BABYLON.Vector3(this._box2.position.x, 0, 0));
        this._sphere.applyImpulse(new BABYLON.Vector3(0, -10, 0), this._sphere.position);
    }
    
    private createScene(): void {
        this._light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-60, 60, 80), this.scene);
        this._light.intensity = 1;

        // Textures
        let diffuseTexture = new BABYLON.Texture("assets/floor_diffuse.png", this.scene);
        diffuseTexture.vScale = diffuseTexture.uScale = 5.0;
        
        let bumpTexture = new BABYLON.Texture("assets/floor_bump.png", this.scene);
        bumpTexture.vScale = bumpTexture.uScale = 5.0;
        
        let specularTexture = new BABYLON.Texture("assets/floor_specular.png", this.scene);
        specularTexture.vScale = specularTexture.uScale = 5.0;
        
        let ambientTexture = new BABYLON.Texture("assets/floor_ao.png", this.scene);
        ambientTexture.vScale = ambientTexture.uScale = 5.0;
        
        let boxTexture = new BABYLON.Texture("assets/wood.jpg", this.scene);
        
        let sphereTexture = new BABYLON.Texture("assets/sphere.jpg", this.scene);
        
        // Materials
        let planeMaterial = new BABYLON.StandardMaterial("plane_material", this.scene);
        planeMaterial.diffuseTexture = diffuseTexture;
        planeMaterial.bumpTexture = bumpTexture;
        planeMaterial.specularTexture = specularTexture;
        planeMaterial.ambientTexture = ambientTexture;
        
        let boxMaterial = new BABYLON.StandardMaterial("box_material", this.scene);
        boxMaterial.diffuseTexture = boxTexture;
        
        let sphereMaterial = new BABYLON.StandardMaterial("sphere_material", this.scene);
        sphereMaterial.diffuseTexture = sphereTexture;
        
        // Meshes
        this._plane = BABYLON.Mesh.CreateGround(CollisionScene.floorName, 100, 100, 2, this.scene);// BABYLON.Mesh.CreatePlane("plane", 100, this.scene);
        //this._plane.rotation.x = Math.PI / 2;
        this._plane.material = planeMaterial;
        
        this._box = BABYLON.Mesh.CreateBox("box", 5, this.scene);
        this._box.refreshBoundingInfo();
        this._box.position.y = 2.5;
        this._box.material = boxMaterial;
        
        this._box2 = this._box.clone("box2");
        this._box2.position.x = 20;
        
        this._sphere = BABYLON.Mesh.CreateSphere("sphere", 6, 3, this.scene);
        this._sphere.position.x = 3;
        this._sphere.position.y = 18;
        this._sphere.material = sphereMaterial;
        
        // Show bounding boxes of meshes (default is false)
        //this._plane.showBoundingBox = true;
        //this._box.showBoundingBox = true;
        //this._sphere.showBoundingBox = true;
    }

    private removePhysics(): void {
        this.scene.disablePhysicsEngine();
    }

    private removeCollision(): void {
        this.scene.collisionsEnabled = false;
        this._camera.applyGravity = false;
    }

    protected createAssets(): void {
        this.createScene();
        this.menu.createAssets();
    }

    protected onStart(): void {
        this.addCollision();
        this.addPhysics();
        this.menu.start();
    }

    protected onStop(): void {
        this.removePhysics();
        this.removeCollision();
    }
}
