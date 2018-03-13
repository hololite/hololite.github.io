import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, FirstScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class PolyhedraScene extends FirstScene {
    private frame_count = 0;
    private light0: BABYLON.PointLight;
    private light1: BABYLON.PointLight;
    private detail_count = 0;
    private sphere0: BABYLON.Mesh;
    private sphere1: BABYLON.Mesh;
    private sphere2: BABYLON.Mesh;
    private sphere3: BABYLON.Mesh;
    private sphere4: BABYLON.Mesh;
    private sphere0f: BABYLON.Mesh;
    private sphere1f: BABYLON.Mesh;
    private sphere2f: BABYLON.Mesh;
    private sphere3f: BABYLON.Mesh;
    private sphere4f: BABYLON.Mesh;
    private menu: VkMenu = new VkMenu(this);
        
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
        // detail range 1 to 5 : show detail in range 0 to this.detail_count-1
        this.detail_count = 5;

        // texture selection
        let texture = 'assets/textures/d20-grid-ref-texture-opt.png';

        // --------------------------
        // End of options
        // --------------------------


        /*
        // This creates and positions a free camera
        //let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
        let camera = new BABYLON.ArcRotateCamera(
            "ArcRotateCamera", 0, 0, 0,
            new BABYLON.Vector3(0.0, 1.0, 0.0),
            this.scene);
        camera.setPosition(new BABYLON.Vector3(10, 1, 0));
        camera.inertia = 0;
        camera.angularSensibilityX = 250;
        camera.angularSensibilityY = 250;
        */

        // This targets the camera to this.scene origin
        //camera.setTarget(BABYLON.Vector3.Zero());

        // --------------------------
        // Set up 2 light source rotating around enlight the icosphere 
        // --------------------------

        this.light0 = new BABYLON.PointLight("light0_point", new BABYLON.Vector3(1, 5, 1), this.scene);
        this.light0.diffuse = BABYLON.Color3.Green();
        this.light0.specular = BABYLON.Color3.Black();
        this.light0.intensity = 0.9;
        // Creating light sphere to show light source position as emissive sphere
        let lightSphere0 = BABYLON.Mesh.CreateSphere("Sphere0", 16, 0.2, this.scene);
        let stdMat = new BABYLON.StandardMaterial("mat-this.light0", this.scene);
        stdMat.diffuseColor = BABYLON.Color3.Black();
        stdMat.specularColor = BABYLON.Color3.Black();
        stdMat.emissiveColor = this.light0.diffuse;
        lightSphere0.material = stdMat;
        lightSphere0.position = this.light0.position;

        this.light1 = new BABYLON.PointLight("light1_point", new BABYLON.Vector3(5, 1, 1), this.scene);
        this.light1.diffuse = BABYLON.Color3.Red(); // Red
        this.light1.specular = BABYLON.Color3.Black();
        this.light1.intensity = 0.9;
        // Creating light sphere to show light source position as emissive sphere
        let lightSphere1 = BABYLON.Mesh.CreateSphere("Sphere01", 16, 0.2, this.scene);
        stdMat = new BABYLON.StandardMaterial("mat-this.light1", this.scene);
        stdMat.diffuseColor = BABYLON.Color3.Black();
        stdMat.specularColor = BABYLON.Color3.Black();
        stdMat.emissiveColor = this.light1.diffuse;
        lightSphere1.material = stdMat;
        lightSphere1.position = this.light1.position;

        // This creates a light, aiming 0,1,0 - to the sky.
        let hemi_light1 = new BABYLON.HemisphericLight("light1_hemi", new BABYLON.Vector3(0, 15, 0), this.scene);
        // Tune intensity
        hemi_light1.intensity = 0.8;
        hemi_light1.specular = BABYLON.Color3.Black();
        hemi_light1.diffuse = BABYLON.Color3.White();
        hemi_light1.groundColor = BABYLON.Color3.Black();

        // ----------------------------------------------
        // Purpose of the playground : show the icosphere
        // ----------------------------------------------

        // Create 'Ico sphere' shape. Params: name, radius, flat, subdivide, this.scene
        this.sphere0 = BABYLON.Mesh.CreateIcoSphere("icosphere", { radius: 2, flat: true, subdivisions: 1 }, this.scene);
        let sm = new BABYLON.StandardMaterial("sphericMat", this.scene);
        sm.diffuseTexture = new BABYLON.Texture(texture, this.scene);
        this.sphere0.material = sm;
        //this.sphere0.material.diffuseColor = BABYLON.Color3.White(); // base color for diffuse before reflect
        // this.sphere0.material.bumpTexture = new BABYLON.Texture("normalMap.jpg", this.scene);
        // this.sphere0.material.bumpTexture.level = 0.8;
        //this.sphere0.material.wireframe = true;

        this.sphere1 = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: true, subdivisions: 2 }, this.scene);
        this.sphere1.material = this.sphere0.material;
        this.sphere2 = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: true, subdivisions: 4 }, this.scene);
        this.sphere2.material = this.sphere0.material;
        this.sphere3 = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: true, subdivisions: 8 }, this.scene);
        this.sphere3.material = this.sphere0.material;
        this.sphere4 = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: true, subdivisions: 16 }, this.scene);
        this.sphere4.material = this.sphere0.material;

        this.sphere0f = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: false, subdivisions: 1 }, this.scene);
        this.sphere0f.material = this.sphere0.material;
        this.sphere1f = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: false, subdivisions: 2 }, this.scene);
        this.sphere1f.material = this.sphere0.material;
        this.sphere2f = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: false, subdivisions: 4 }, this.scene);
        this.sphere2f.material = this.sphere0.material;
        this.sphere3f = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: false, subdivisions: 8 }, this.scene);
        this.sphere3f.material = this.sphere0.material;
        this.sphere4f = BABYLON.MeshBuilder.CreateIcoSphere("icosphere", { radius: 2, flat: false, subdivisions: 16 }, this.scene);
        this.sphere4f.material = this.sphere0.material;

        // Move the sphere upward 1/2 its height
        this.sphere0.position.y = 2;
        this.sphere1.position.y = this.sphere0.position.y;
        this.sphere2.position.y = this.sphere0.position.y;
        this.sphere3.position.y = this.sphere0.position.y;
        this.sphere4.position.y = this.sphere0.position.y;
        this.sphere0f.position.y = this.sphere0.position.y;
        this.sphere1f.position.y = this.sphere0.position.y;
        this.sphere2f.position.y = this.sphere0.position.y;
        this.sphere3f.position.y = this.sphere0.position.y;
        this.sphere4f.position.y = this.sphere0.position.y;

        // Let's try our built-in 'ground' shape.  Params: name, width, depth, subdivisions, this.scene
        let ground = BABYLON.Mesh.CreateGround("ground1", 10, 10, 2, this.scene);
        ground.material = this.sphere0.material
        ground.position.y = -2;

        this.menu.createAssets();
    }

    protected onStart(): void {
        // Set scene properties:
        // - change the this.scene background color to dark gray.
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1);

        // Set scene pre-render method:
        // - animations
        this.scene.beforeRender = () => {
            this.light0.position.copyFromFloats(5.0 * Math.sin(this.frame_count / 100),
                2.0,
                5.0 * Math.cos(this.frame_count / 100));
            this.light1.position.copyFromFloats(5.0 * Math.cos(2 * this.frame_count / 100),
                2.0 + 5.0 * Math.sin(2 * this.frame_count / 100),
                2.0);

            // Make sphere visible with increasing details every 100 frame
            // detail in 0, 1, 2, 3, 4
            // flat in 0, 1
            let showdetail = Math.floor((this.frame_count / 64)) % (this.detail_count * 2);
            let showflat = (showdetail >= this.detail_count);
            let detail = showdetail % this.detail_count;
            // detail = 0; showflat = 1; // Uncomment to work only with single sphere
            this.sphere0.isVisible = (detail == 0 && showflat);
            this.sphere1.isVisible = (detail == 1 && showflat);
            this.sphere2.isVisible = (detail == 2 && showflat);
            this.sphere3.isVisible = (detail == 3 && showflat);
            this.sphere4.isVisible = (detail == 4 && showflat);
            this.sphere0f.isVisible = (detail == 0 && !showflat);
            this.sphere1f.isVisible = (detail == 1 && !showflat);
            this.sphere2f.isVisible = (detail == 2 && !showflat);
            this.sphere3f.isVisible = (detail == 3 && !showflat);
            this.sphere4f.isVisible = (detail == 4 && !showflat);

            this.frame_count++;
        };

        this.menu.start();
    }

    protected onStop(): void {
    }
}
