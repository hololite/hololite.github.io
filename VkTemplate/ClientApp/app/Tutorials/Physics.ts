import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
//import 'babylonjs.materials';
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, VkApp, IVkDirector, FirstScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class MotorScene extends FirstScene {
    private static readonly floorName: string = "My Floor";
    private readonly cannon: boolean = true;

    private ground: BABYLON.GroundMesh = null;
    private spot: BABYLON.PointLight;
    private light: BABYLON.PointLight;
    private fact = 30; 			// cube size
    private SPS: BABYLON.SolidParticleSystem;

    private box1: BABYLON.Mesh;
    private box2: BABYLON.Mesh;
    private box3: BABYLON.Mesh;
    private box4: BABYLON.Mesh;
    private wheel: BABYLON.Mesh;
    private holder: BABYLON.Mesh;
    private ground1: BABYLON.Mesh;
    private ground2: BABYLON.Mesh;
    private ground3: BABYLON.Mesh;
    private ground4: BABYLON.Mesh;
    private balls: BABYLON.Mesh[];

    private enableButton: boolean = false;
    private menu: VkMenu = new VkMenu(this);       // don't set to null, this is created during ctor/createAssets

    /*
    * Public members
    */
    constructor(onExitingScene?: () => void) {
        super({
            cameraInitialPosition: new BABYLON.Vector3(0, 15, -50),
            cameraInitialTarget: new BABYLON.Vector3(0, 0, 0)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        console.log('>>>> PhysicsScene.onMenuButton: pressed=%s', pressed.toString());
        this.menu.handleMenuButton(controller, pressed);
        console.log('<<<< PhysicsScene.onMenuButton');
    }

    createAssets(): void {

        let light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), this.scene);
        this.holder = BABYLON.MeshBuilder.CreateSphere("this.holder", { diameter: 2, segments: 4 }, this.scene);
        this.wheel = BABYLON.MeshBuilder.CreateSphere("base", { diameterY: 10, diameterZ: 1, diameterX: 10 }, this.scene);
        this.box1 = BABYLON.MeshBuilder.CreateBox("tooth1", { width: 4, height: 1, depth: 3 }, this.scene);
        this.box1.parent = this.wheel;
        this.box1.position.x = 5;

        this.box2 = this.box1.clone("tooth2");
        this.box2.position.x = -5;

        this.box3 = this.box1.clone("tooth3");
        this.box3.position.x = 0;
        this.box3.position.y = 5;
        this.box3.rotation.z = Math.PI / 2;

        this.box4 = this.box3.clone("tooth4");
        this.box4.position.y = -5;

        // grounds
        this.ground1 = BABYLON.MeshBuilder.CreateGround(MotorScene.floorName, { width: 50, height: 50 }, this.scene);
        this.teleportMeshes.push(this.ground1);
        this.ground1.position.y = -3.1;
        this.ground1.position.x = 25;
        this.ground1.position.z = 25;
        this.ground1.rotation.z = 0.1;
        this.ground1.rotation.x = -0.1;

        this.ground2 = BABYLON.MeshBuilder.CreateGround(MotorScene.floorName, { width: 50, height: 50 }, this.scene);
        this.teleportMeshes.push(this.ground2);
        this.ground2.position.y = -3.1;
        this.ground2.position.x = -25;
        this.ground2.position.z = 25;
        this.ground2.rotation.z = -0.1;
        this.ground2.rotation.x = -0.1;

        this.ground3 = BABYLON.MeshBuilder.CreateGround(MotorScene.floorName, { width: 50, height: 50 }, this.scene);
        this.teleportMeshes.push(this.ground3);
        this.ground3.position.y = -3.1;
        this.ground3.position.x = 25;
        this.ground3.position.z = -25;
        this.ground3.rotation.z = 0.1;
        this.ground3.rotation.x = 0.1;

        this.ground4 = BABYLON.MeshBuilder.CreateGround(MotorScene.floorName, { width: 50, height: 50 }, this.scene);
        this.teleportMeshes.push(this.ground4);
        this.ground4.position.y = -3.1;
        this.ground4.position.x = -25;
        this.ground4.position.z = -25;
        this.ground4.rotation.z = -0.1;
        this.ground4.rotation.x = 0.1;

        let rand = () => {
            let sign = Math.random() < 0.5;
            return Math.random() * (sign ? 1 : -1);
        }

        let ballPosition = (ball: BABYLON.Mesh) => {
            ball.position.y = -2;
            ball.position.x = rand() * 50;
            ball.position.z = rand() * 50;
        }

        let ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 2, segments: 16 }, this.scene);
        ballPosition(ball);
        this.balls = [ball];

        for (let i = 0; i < 99; ++i) {
            let b = ball.clone("ball" + i);
            ballPosition(b)
            this.balls.push(b);
        }

        this.menu.createAssets();
    }

    private addPhysics(): void {
        this.scene.enablePhysics(undefined, (!this.cannon ? new BABYLON.OimoJSPlugin(100) : new BABYLON.CannonJSPlugin(true, 100)));

        [this.box1, this.box2, this.box3, this.box4].forEach((mesh) => {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 });
        });

        this.wheel.physicsImpostor = new BABYLON.PhysicsImpostor(this.wheel, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 10 });

        this.holder.physicsImpostor = new BABYLON.PhysicsImpostor(this.holder, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0 });

        let joint1 = new BABYLON.HingeJoint({
            mainPivot: new BABYLON.Vector3(0, 0, 0),
            connectedPivot: new BABYLON.Vector3(0, 0, 0),
            mainAxis: new BABYLON.Vector3(0, 0, -1),
            connectedAxis: new BABYLON.Vector3(0, 0, -1),
            nativeParams: {
            }
        });
        this.holder.physicsImpostor.addJoint(this.wheel.physicsImpostor, joint1);

        let forceFactor = this.cannon ? 1 : 1500;
        joint1.setMotor(3 * forceFactor, 20 * forceFactor);

        [this.ground1, this.ground2, this.ground3, this.ground4].forEach(ground => {
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 });
        })
        this.balls.forEach(ball => {
            ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1 });
        });
    }

    private removePhysics(): void {
        // TBD
        this.scene.disablePhysicsEngine();
    }

    protected onStart(): void {
        this.addPhysics();
        this.menu.start();
    }

    protected onStop(): void {
        this.removePhysics();
    }
}
