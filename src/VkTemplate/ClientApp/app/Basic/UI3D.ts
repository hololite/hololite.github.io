import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials';
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene, ControllerMode } from '../../../../VkCore/Vk'
//import { CustomKeyboard } from './CustomKeyboard'

export class UI3D extends VkScene {
    protected light: BABYLON.Light;
    private manager: BABYLON.GUI.GUI3DManager = null;
    private panel: BABYLON.GUI.SpherePanel= null;

    constructor() {
        super({
            attachCamera: true,
            cameraInitialPosition: new BABYLON.Vector3(0, 0, -5),
            cameraInitialTarget: new BABYLON.Vector3(10, 0, 0)
        });
    }

    protected createAssets(): void {
        console.log('>>>> UI3D.createAssets');

        let anchor = new BABYLON.TransformNode("");
        // Create the 3D UI manager
        var manager = new BABYLON.GUI.GUI3DManager(this.scene);

        this.panel = new BABYLON.GUI.SpherePanel();
        this.panel.margin = 0.2;
     
        manager.addControl(this.panel);
        this.panel.linkToTransformNode(anchor);
        this.panel.position.z = -1.5;

        // Let's add some buttons!

        this.panel.blockLayout = true;
        for (var index = 0; index < 60; index++) {
            this.addButton();    
        }
        this.panel.blockLayout = false;


        console.log('<<<< UI3D.createAssets');
    }

    private addButton(): void {
        let button = new BABYLON.GUI.HolographicButton("orientation");
        this.panel.addControl(button);

        button.text = "Button #" + this.panel.children.length;
    }

    protected onStart(): void {
        this.addButton();
        this.addButton();
        this.addButton();
    }
}

export class UI3DVer2 extends VkScene {
    protected light: BABYLON.Light;
    private manager: BABYLON.GUI.GUI3DManager = null;
    private panel: BABYLON.GUI.StackPanel3D = null;

    constructor() {
        super({
            attachCamera: true,
            cameraInitialPosition: new BABYLON.Vector3(0, 0, -5),
            cameraInitialTarget: new BABYLON.Vector3(10, 0, 0)
        });
    }

    protected createAssets(): void {
        console.log('>>>> UI3D.createAssets');

        this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, -1, 0), this.scene);
        this.light.intensity = 1.0;

        let donut = BABYLON.Mesh.CreateTorusKnot("donut", 2, 0.5, 48, 32, 3, 2, this.scene);

        // Create the 3D UI manager
        this.manager = new BABYLON.GUI.GUI3DManager(this.scene);

        // Create a horizontal stack panel
        this.panel = new BABYLON.GUI.StackPanel3D();
        this.panel.margin = 0.02;

        this.manager.addControl(this.panel);
        this.panel.position.z = -1.5;

        console.log('<<<< UI3D.createAssets');
    }

     private addButton(): void {
        var button = new BABYLON.GUI.Button3D("orientation");
        this.panel.addControl(button);
        button.onPointerUpObservable.add(function(){
            this.panel.isVertical = !this.panel.isVertical;
        });   
        
        var text1 = new BABYLON.GUI.TextBlock();
        text1.text = "change orientation";
        text1.color = "white";
        text1.fontSize = 24;
        button.content = text1;  
    }

    protected onStart(): void {
        this.addButton();
        this.addButton();
        this.addButton();
    }
}
