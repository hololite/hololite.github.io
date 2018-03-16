//import * as babylon from 'babylon';
import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene } from '../Vk'
import { VkMenu } from '../VkMenu'

class PowerEase extends BABYLON.EasingFunction implements BABYLON.IEasingFunction {
    constructor(public power: number = 2) {
        // Call constructor of BABYLON.EasingFunction
        super();
    }
    
    /**
    * Called to animate each frame. 
    * must return a number
    */
    public easeInCore(gradient: number): number {
        var y = Math.max(0.0, this.power);
        return Math.pow(gradient, y);
    }
}

export class AnimationScene extends VkScene {
    /*
    * Private members
    */
    private _light: BABYLON.PointLight;
    private _plane: BABYLON.Mesh;
    private _box: BABYLON.Mesh;
    private _skybox: BABYLON.Mesh;
    private menu: VkMenu = new VkMenu(this);
    private static readonly floorName = "My Floor";
    private _skeletons: BABYLON.Skeleton[] = null;
    private _meshes: BABYLON.AbstractMesh[] = null;
    private _particleSystems: BABYLON.ParticleSystem[] = null;
    private animation: BABYLON.Animatable = null;
    
    constructor() {
        super({
            cameraInitialTarget: new BABYLON.Vector3(0, 0, 0),
            cameraInitialPosition: new BABYLON.Vector3(0, 10, -20)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    
    /**
    * Animates the cube thanks to a custom algorithm.
    * This is an example of animation that you can create
    * only using the tools provided by Babylon.js instead of
    * writing this algorithm yourself.
    */
    public animateThroughCode(): void {
        var angle = 0;
        var radius = 10;

        this.beforeRenderCallback = () => {
            this._box.position.x = radius * Math.cos(angle);
            this._box.position.y = 2.5;
            this._box.position.z = radius * Math.sin(angle);
            angle += 0.01;
        }
    }
    
    /**
    * Creates an animation applied on the box
    * It follows a specific path
    */
    public createBoxAnimation(): void {
        // Create the animation manager
        var simpleAnimation = new BABYLON.Animation("boxAnimationSimple", "rotation", 1, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        var complexAnimation = new BABYLON.Animation("boxAnimationComplex", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        
        // Create keys
        var simpleKeys = [
            {
                frame: 0,
                value: new BABYLON.Vector3(0, 0, 0)
            },
            {
                frame: 20,
                value: new BABYLON.Vector3(0, Math.PI, 0)
            }
        ];
        
        var complexKeys = [];
        for (var i=0; i < 360; i++) {
            var angle = BABYLON.Tools.ToRadians(i);
            complexKeys.push({
                frame: i,
                value: new BABYLON.Vector3(10 * Math.cos(angle), 2.5, 10 * Math.sin(angle))
            });
        }
        
        // Finish: add the animation to the node and play
        simpleAnimation.setKeys(simpleKeys);
        complexAnimation.setKeys(complexKeys);

        
        //this._box.animations.push(simpleAnimation);
        this._box.animations.push(complexAnimation);
        
        // Finally, start the animation(s) of the box
        this.animation = this.scene.beginAnimation(this._box, 0, 360, false, 1.0, () => {
            console.log("Animation Finished");
        });
    }
    
    /**
    * 
    */

    public createAnimationWithEasingFunction(customEaseFunction: boolean = true): void {
        // Create the animation manager
        var easingAnimation = new BABYLON.Animation("easingAnimation", "rotation", 10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        // Create keys
        var simpleKeys = [
            {
                frame: 0,
                value: new BABYLON.Vector3(0, 0, 0)
            },
            {
                frame: 20,
                value: new BABYLON.Vector3(0, Math.PI, 0)
            },
            {
                frame: 40,
                value: new BABYLON.Vector3(Math.PI, 0, 0)
            }
        ];
        
        // Set keys
        easingAnimation.setKeys(simpleKeys);
        
        // Push animation
        this._box.animations.push(easingAnimation);
        
        // Set easing function
        if (customEaseFunction) {
            var customEase = new PowerEase(3);
            customEase.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            easingAnimation.setEasingFunction(customEase);
        }
        else {
            var ease = new BABYLON.CircleEase();
            ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
            easingAnimation.setEasingFunction(ease);
        }
        
        // Finally, start the animation(s) of the box
        this.animation = this.scene.beginAnimation(this._box, 0, 40, true, 1.0, () => {
            console.log("Animation Finished");
        });
    }

    protected onStart(): void {
        this.animateCharacter();
        this.menu.start();
    }

    protected onStop(): void {
        //this.scene.stopAnimation(this._skeletons[0]);
        if (this.animation) {
            this.animation.stop();
        }

        if (this._meshes) {
            for (let mesh of this._meshes) {
                mesh.dispose();
            }
            this._meshes = null;
        }

        if (this._skeletons) {
            for (let skeleton of this._skeletons) {
                skeleton.dispose();
            }
            this._skeletons = null;
        }

        if (this._particleSystems) {
            for (let ps of this._particleSystems) {
                ps.dispose();
            }
            this._particleSystems = null;

        }
    }
    
    /**
    * Loads and plays the animation of a character
    * Characters are 3D models with bones, animated using the
    * "_matrix" property
    */
    public animateCharacter(): void {
        // Remove box
        this._box.dispose();

        
        // Load character
        BABYLON.SceneLoader.ImportMesh("", "assets/scenes/Dude/", "dude.babylon", this.scene, (meshes, particleSystems, skeletons) => {
            this._meshes = meshes;
            this._particleSystems = particleSystems;
            this._skeletons = skeletons;

            this._meshes.forEach((mesh) => {
                mesh.scaling = mesh.scaling.multiply(new BABYLON.Vector3(0.2, 0.2, 0.2));
                mesh.position = new BABYLON.Vector3(1, 0, 5);
            });
            
            // Both must write "true" in the console
            console.log(this._skeletons.length === 1);
            console.log(this.scene.getSkeletonByName("Skeleton0") === this._skeletons[0]);
            
            // Simply begin the animations of the skeleton
            // To remember, a skeleton has multiple bones, where each bone
            // as a list of animations of type BABYLON.Animation
            this.animation = this.scene.beginAnimation(this._skeletons[0], 0, 150, true, 1.0);
        });
        
        // Or use the .Append function
        
        /*
        BABYLON.SceneLoader.Append("./", "dude.babylon", this.scene, (scene) => {
            let skeleton = this.scene.getSkeletonByName("Skeleton0");
            this.animation = this.scene.beginAnimation(skeleton, 0, 150, true, 1.0);
        });
        */
    }
    
    /**
    * Creates a scene with a plane and a cube
    */

    protected createAssets(): void {
        this.createScene();
        this.menu.createAssets();
    }

    private createScene(): void {
        // Camera
        //this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(29, 13, 23), this.scene);
        //this.getDefaultCamera().attachControl(this.getCanvas());
        
        // Light
        this._light = new BABYLON.PointLight("Point", new BABYLON.Vector3(-60, 60, 80), this.scene);
        this._light.intensity = 1;

        // Textures
        var diffuseTexture = new BABYLON.Texture("assets/floor_diffuse.png", this.scene);
        diffuseTexture.vScale = diffuseTexture.uScale = 5.0;
        
        var boxTexture = new BABYLON.Texture("assets/wood.jpg", this.scene);
        
        // Materials
        var planeMaterial = new BABYLON.StandardMaterial("plane_material", this.scene);
        planeMaterial.diffuseTexture = diffuseTexture;
        
        var boxMaterial = new BABYLON.StandardMaterial("box_material", this.scene);
        boxMaterial.diffuseTexture = boxTexture;
        
        // Meshes
        this._plane = BABYLON.Mesh.CreateGround(AnimationScene.floorName, 100, 100, 2, this.scene);
        this.addTeleportMesh(this._plane);
        this._plane.material = planeMaterial;
        
        this._box = BABYLON.Mesh.CreateBox("box", 5, this.scene);
        this._box.refreshBoundingInfo();
        this._box.position.y = 2.5;
        this._box.material = boxMaterial;
    }
}
