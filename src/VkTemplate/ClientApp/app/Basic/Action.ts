//import * as babylon from 'babylon';
import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene } from '../../../../VkCore/Vk'

export class ActionScene extends VkScene {
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.PointLight;
    private _plane: BABYLON.Mesh;
    private _box: BABYLON.Mesh;
    private static readonly floorName = "My Floor";

    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(20, 20, -10)
        });
    }
    
    /**
    * Creates actions on the box
    * Includes conditions
    */
    public createActions(): void {
        //
        // Set the box
        //
        this._box.actionManager = new BABYLON.ActionManager(this.scene);
        
        // Modify the box position on left-click
        this._box.actionManager.registerAction(new BABYLON.SetValueAction(
            BABYLON.ActionManager.OnLeftPickTrigger, this._box,
            "position", new BABYLON.Vector3(0, 6, 0),
            null // No conditions
        ))
        // On second left-click, reset the original box position
        // Using an interpolate value action
        .then(new BABYLON.InterpolateValueAction(
            BABYLON.ActionManager.OnLeftPickTrigger, this._box,
            "position", new BABYLON.Vector3(0, 2.5, 0),
            1000,
            null, // No conditions
            false
        ));
        // When finished, the first action will be re-executed
        
        //
        // Set the plane
        //
        this._plane.actionManager = new BABYLON.ActionManager(this.scene);
        
        // Modify the plane's rotation only if the box position on y is 6
        var condition = new BABYLON.ValueCondition(
            this._plane.actionManager, this._box,
            "position.y", 6,
            BABYLON.ValueCondition.IsLesser
        );
        
        this._box.actionManager.registerAction(new BABYLON.SetValueAction(
            BABYLON.ActionManager.OnLeftPickTrigger, this._box,
            "rotation", new BABYLON.Vector3(0, Math.PI / 3, 0),
            condition
        ));
    }
    
    /**
    * Creates a scene with a plane and 6 spheres
    */
    protected createAssets(): void {
        this.createScene();
        this.createActions();
    }

    private createScene(): void {
        // Camera
        this._camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(29, 13, 23), this.scene);
        this._camera.setTarget(new BABYLON.Vector3(0, 0, 0));
        this._camera.attachControl(this.canvas);
        
        // Light
        this._light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(-60, 60, 80), this.scene);
        this._light.intensity = 1;
        // Textures
        var diffuseTexture = new BABYLON.Texture("assets/floor_diffuse.png", this.scene);
        diffuseTexture.vScale = diffuseTexture.uScale = 5.0;
        
        var bumpTexture = new BABYLON.Texture("assets/floor_bump.png", this.scene);
        bumpTexture.vScale = bumpTexture.uScale = 5.0;
        
        var boxTexture = new BABYLON.Texture("assets/wood.jpg", this.scene);
        
        // Materials
        var planeMaterial = new BABYLON.StandardMaterial("plane_material", this.scene);
        planeMaterial.diffuseTexture = diffuseTexture;
        planeMaterial.bumpTexture = bumpTexture;
        
        var boxMaterial = new BABYLON.StandardMaterial("box_material", this.scene);
        boxMaterial.diffuseTexture = boxTexture;
        
        // Meshes
        this._plane = BABYLON.Mesh.CreateGround(ActionScene.floorName, 100, 100, 2, this.scene);
        this._plane.material = planeMaterial;
        
        this._box = BABYLON.Mesh.CreateBox("box", 5, this.scene);
        this._box.refreshBoundingInfo();
        this._box.position.y = 2.5;
        this._box.position.x = 20;
        this._box.position.z = 20;
        this._box.material = boxMaterial;
    }
}
