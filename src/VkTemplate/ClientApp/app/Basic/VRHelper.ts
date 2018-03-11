import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'cannon';
import 'oimo';
import { Common } from '../Common'

export class VRHelper {
    readonly magic                  = 888;
    scene:                          BABYLON.Scene = null;
    canvas:                         HTMLElement = null;
    floorName:                      string = "";
    camera:                         BABYLON.WebVRFreeCamera = null;

    helper:                         BABYLON.RayHelper = null;
    haloCenter:                     BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    target:                         BABYLON.Mesh = null;

    teleportationAllowed:           boolean = false;
    teleportationRequestInitiated:  boolean = false;
    teleportationCircle:            BABYLON.Mesh = null;
    vrControllersReady:             boolean = false;

    constructor(scene: BABYLON.Scene, canvas: HTMLElement, floorName: string) {
        this.scene = scene;
        this.canvas = canvas;
        this.floorName = floorName;
    }

    createVRCamera(): BABYLON.WebVRFreeCamera {
        if (navigator.getVRDisplays) {
            this.camera = new BABYLON.WebVRFreeCamera("WebVRCamera", new BABYLON.Vector3(-0.8980848729619885, 1.1, 0.4818257550471734), this.scene);
            // Handling cases of non VR controllers (Xbox gamepads, etc.)
            this.scene.gamepadManager.onGamepadConnectedObservable.add((pad) => this.onNewGamepadConnected(pad));
            this.camera.onControllersAttachedObservable.add(() => this.onControllersAttached());
        }
        else {
            let camera: BABYLON.FreeCamera = new BABYLON.VRDeviceOrientationFreeCamera("VRDO", new BABYLON.Vector3(-0.8980848729619885, 2, 0.4818257550471734), this.scene, false);
            this.camera = <BABYLON.WebVRFreeCamera>camera;
        }

        this.createTeleportationCircles();
        this.scene.activeCamera = this.camera;

        // Touch or click the rendering canvas to enter VR Mode
        this.scene.onPointerDown = () => {
            this.scene.onPointerDown = undefined
            //console.log("calling camera.attachControl()");
            this.camera.attachControl(this.canvas, true);

            this.scene.registerBeforeRender(() => {
                // We're testing if we can teleport using ray on each frame
                this.castRayAndCheckIfWeCanTeleport();
            });
        }

        return this.camera;
    };

    onNewGamepadConnected(gamepad: BABYLON.Gamepad): void {
        console.log("New gamepad connected: " + gamepad.id);
        let xboxpad: BABYLON.Xbox360Pad = <BABYLON.Xbox360Pad>gamepad;
        if (xboxpad.onbuttondown) {
            if (!this.vrControllersReady) {
                this.createTargetMesh();
            }
            xboxpad.onbuttondown((buttonValue) => {
                if (buttonValue == BABYLON.Xbox360Button.Y) {
                    this.teleportationRequestInitiated = true;
                }
            });
        }
        if (xboxpad.onbuttonup) {
            xboxpad.onbuttonup((buttonValue) => {
                if (buttonValue == BABYLON.Xbox360Button.Y) {
                    if (this.teleportationAllowed) {
                        // Teleportation is just about moving the camera position
                        this.camera.position.x = this.haloCenter.x;
                        this.camera.position.z = this.haloCenter.z;
                    }
                    this.teleportationRequestInitiated = false;
                }
            });
        }
    }

    onControllersAttached(): void {
        console.log("Both VR controllers detected.");
        this.vrControllersReady = true;

        if (this.camera.rightController) {
            // Removing the gaze circle when using VR controllers
            if (this.target) {
                this.target.isVisible = false;
            }

            // A button on Oculus Touch, Grip button on Vive
            this.camera.rightController.onTriggerStateChangedObservable.add((stateObject) => {
                // on pressed
                if (stateObject.pressed) {
                    this.teleportationRequestInitiated = true;
                }
                // on released
                else {
                    if (this.teleportationRequestInitiated) {
                        if (this.teleportationAllowed) {
                            this.camera.position.x = this.haloCenter.x;
                            this.camera.position.z = this.haloCenter.z;
                        }
                        this.teleportationRequestInitiated = false;
                    }
                }
            });
        }
    }

    // Little white circle attached to the camera
    // That will act as the target to look on the floor where to teleport
    createTargetMesh(): void {
        this.target = BABYLON.Mesh.CreatePlane("targetViewVR", 1, this.scene);
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.target, 2048, 2048);
        let circle = new BABYLON.GUI.Ellipse();
        circle.width = "50px";
        circle.color = "white";
        circle.thickness = 15;
        circle.height = "50px";
        advancedTexture.addControl(circle);
        this.target.parent = this.camera;
        this.target.position.z = 1;
    }

    // Animated double circles to give visual indications on the future teleportation area
    createTeleportationCircles(): void {
        this.teleportationCircle = BABYLON.Mesh.CreateGround("teleportationCircle", 2, 2, 2, this.scene);
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this.teleportationCircle, 1024, 512);

        let circle = new BABYLON.GUI.Ellipse();
        circle.width = "500px";
        circle.color = "white";
        circle.thickness = 20;
        circle.height = "250px";
        advancedTexture.addControl(circle);

        let innerTeleportationCircle = BABYLON.Mesh.CreateGround("innerTeleportationCircle", 2, 2, 2, this.scene);
        innerTeleportationCircle.parent = this.teleportationCircle;
        let advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(innerTeleportationCircle, 1024, 512);

        let circle2 = new BABYLON.GUI.Ellipse();
        circle2.width = "400px";
        //circle2.color = "grey";
        circle2.color = "cyan";
        //circle2.color3 = BABYLON.Color3.FromInts(0, 255, 255);
        circle2.thickness = 25;
        circle2.height = "200px";
        advancedTexture2.addControl(circle2);

        let animationInnerCircle = new BABYLON.Animation("animationInnerCircle", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        let keys = [];
        keys.push({
            frame: 0,
            value: 0.01
        });
        keys.push({
            frame: 30,
            value: 0.2
        });
        keys.push({
            frame: 60,
            value: 0.01
        });

        animationInnerCircle.setKeys(keys);

        let easingFunction = new BABYLON.SineEase();
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
        animationInnerCircle.setEasingFunction(easingFunction);

        innerTeleportationCircle.animations = [];
        innerTeleportationCircle.animations.push(animationInnerCircle);

        this.scene.beginAnimation(innerTeleportationCircle, 0, 60, true);
        this.hideTeleportationCircle();
    };

    displayTeleportationCircle(): void {
        this.teleportationCircle.isVisible = true;
        let mesh: BABYLON.Mesh = <BABYLON.Mesh>this.teleportationCircle.getChildren()[0];
        mesh.isVisible = true;
    }

    hideTeleportationCircle(): void  {
        this.teleportationCircle.isVisible = false;
        let mesh: BABYLON.Mesh = <BABYLON.Mesh>this.teleportationCircle.getChildren()[0];
        mesh.isVisible = false;
    }

    moveTeleportationSelectorTo(coordinates: BABYLON.Vector3): void {
        this.teleportationAllowed = true;
        if (this.teleportationRequestInitiated) {
            this.displayTeleportationCircle();
        }
        else {
            this.hideTeleportationCircle();
        }
        this.haloCenter.copyFrom(coordinates);
        this.teleportationCircle.position = coordinates;
        // positioning the teleportation circles just above the floor
        // to avoid z-fighting
        this.teleportationCircle.position.y += 0.001;
    }

    // condition testing for allowed teleportation area
    predicate(mesh: BABYLON.AbstractMesh): boolean {
        // The floor is named "Sponza Floor" in this scene
        // Update the condition based on your own logic / scene
        if (mesh.name.indexOf("My Floor") !== -1) {
            return true;
        }
        return false;
    }

    castRayAndCheckIfWeCanTeleport(): void {
        //console.log(">> castRayAndCheckIfWeCanTeleport");
        let ray;

        // Let's attach to the left controller
        if (!this.camera.rightController) {
            // sending a ray right in front of the camera
            // aligned with the centered small circle target
            ray = this.camera.getForwardRay();
        } else {
            ray = this.camera.rightController.getForwardRay();
        }

        if (this.helper) {
            this.helper.dispose();
        }

        // We're displayed a yellow ray to help the user pointing using the controller
        if (this.camera.rightController && this.teleportationRequestInitiated) {
            //helper = BABYLON.RayHelper.CreateAndShow(ray, scene, new BABYLON.Color3(0, 1, 1));
            this.helper = BABYLON.RayHelper.CreateAndShow(ray, this.scene, BABYLON.Color3.FromInts(135, 206, 250));
        }

        //console.log("calling scene.pickWithRay...");
        let hit = this.scene.pickWithRay(ray, this.predicate);
        //console.log("hit.pickedMesh=" + hit.pickedMesh);

        // the condition was fullfiled
        if (hit.pickedMesh) {
            this.moveTeleportationSelectorTo(hit.pickedPoint)
        }
        else {
            this.teleportationAllowed = false;
            this.hideTeleportationCircle();
        }
    }
}
