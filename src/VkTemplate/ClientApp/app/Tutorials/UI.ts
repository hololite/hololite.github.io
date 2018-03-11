import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials';
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, ControllerMode } from '../Vk'
import { CustomKeyboard } from './CustomKeyboard'

export class UIScene extends VkScene {
    /*
    * Private members
    */
    private static readonly floorName: string = "My Floor";
    private ground: BABYLON.GroundMesh = null;
    private spot: BABYLON.PointLight;
    private light: BABYLON.HemisphericLight;

    /*
    * Public members
    */
    constructor(onExitingScene?: () => void) {
        super({
            controllerMode: ControllerMode.Interaction,
            cameraInitialPosition: new BABYLON.Vector3(0, 3, -20),
            cameraInitialTarget: new BABYLON.Vector3(0, 0, 0)
        });
    }

    protected createAssets(): void {
        let hemi = new BABYLON.HemisphericLight("toto", BABYLON.Vector3.Zero(), this.scene);
    
        // UI planes
        let optionPlane = BABYLON.Mesh.CreatePlane("plane", 20, this.scene);
        optionPlane.position.y = 5;
        // 
        let colorPickerPlane = BABYLON.Mesh.CreatePlane("plane", 20, this.scene);
        colorPickerPlane.position.y = 5;
        colorPickerPlane.position.x = 25;
    
        // UI textures
        let optionTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(optionPlane);
        let colorPickerTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(colorPickerPlane);
    
        let optionPanel = new BABYLON.GUI.StackPanel();  
        optionPanel.top = "100px";
        optionTexture.addControl(optionPanel);    
    
        let button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Change Scene");
        button1.width = 1;
        button1.height = "100px";
        button1.color = "white";
        button1.fontSize = 50;
        button1.background = "gray";
        button1.onPointerDownObservable.add(() => {
            this.vrHelper.displayGaze = !this.vrHelper.displayGaze;
            /*
            if (this.scene.debugLayer.isVisible()) {
                this.scene.debugLayer.hide();
            }
            else {
                this.scene.debugLayer.show();
            }
            */
            this.stop();
        });
        optionPanel.addControl(button1);
    
        let textblock = new BABYLON.GUI.TextBlock();
        textblock.height = "150px";
        textblock.fontSize = 100;
        textblock.color = 'yellow';
        textblock.text = "Please pick an option:";
        textblock.fontSize = 90;
        textblock.fontFamily = "Tahoma";
        optionPanel.addControl(textblock);   
    
        let addRadio = (text: string, parent: BABYLON.GUI.StackPanel) => {
            let button = new BABYLON.GUI.RadioButton();
            button.width = "30px";
            button.height = "30px";
            button.color = "white";
            button.background = "gray";     
    
            button.onIsCheckedChangedObservable.add(function(state) {
                if (state) {
                    textblock.text = "You selected " + text;
                }
            }); 
    
            let header = BABYLON.GUI.Control.AddHeader(button, text, "400px", { isHorizontal: true, controlFirst: true });
            header.height = "100px";
            header.children[1].fontSize = 80;
            header.children[1].onPointerDownObservable.add(function() {
                button.isChecked = !button.isChecked;
            });
    
            parent.addControl(header);    
        }
    
    
        addRadio("option 1", optionPanel);
        addRadio("option 2", optionPanel);
        addRadio("option 3", optionPanel);
        addRadio("option 4", optionPanel);
        addRadio("option 5", optionPanel);    
    
        let picker = new BABYLON.GUI.ColorPicker();
        picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        picker.height = "450px";
        picker.width = "450px";
        picker.onValueChangedObservable.add(function(value) { // value is a color3
            sphereMat.diffuseColor = value;
        });    
        colorPickerTexture.addControl(picker);  
    
        let sphere = BABYLON.Mesh.CreateSphere("sphere", 12, 2, this.scene);
        sphere.position.x = 10;
    
        let sphereMat = new BABYLON.StandardMaterial("sphereMat", this.scene);
        sphere.material = sphereMat;
    }

    // simple button
    createScene2(): void {
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        let sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.scene);

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        let ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, this.scene);

        // GUI
        let plane = BABYLON.Mesh.CreatePlane("plane", 4, this.scene);
        plane.parent = sphere;
        plane.position.y = 4;
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
        // CreateFullscreenUI is not supported for webvr !!
        //let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        advancedTexture.isForeground = false;

        // container
        //let rect1 = new BABYLON.GUI.Rectangle();
        let rect1 = new BABYLON.GUI.Ellipse();
        rect1.width = 4;
        rect1.height = 4;
        //rect1.cornerRadius = 20;
        rect1.color = "Orange";
        rect1.thickness = 4;
        rect1.background = "brown";

        let button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
        button1.width = 1;
        button1.height = 0.4;
        button1.color = "white";
        button1.fontSize = 200;
        button1.background = "purple";
        button1.onPointerUpObservable.add(function() {
            console.log("onPointerUpObservable");
        });
        button1.onPointerDownObservable.add(function() {
            console.log("**** onPointerDownObservable");
        });
        button1.onPointerEnterObservable.add(() => {
            console.log("**** onPointerEnterObservable");
        })
        button1.onPointerOutObservable.add(() => {
            console.log("**** onPointerOutObservable");
        })
        button1.onPointerMoveObservable.add(() => {
            console.log("**** onPointerMoveObservable");
        })

        let button2 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Click Me");
        button1.width = 1;
        button1.height = 0.4;
        button1.color = "yellow";
        button1.fontSize = 200;
        button1.background = "green";

        //rect1.addControl(button1);
        //rect1.addControl(button2);
        advancedTexture.addControl(rect1);
    }

    // keyboard 
    createScene3(): void {
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        let sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.scene);
        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;
        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        let ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, this.scene);

        let plane = BABYLON.MeshBuilder.CreatePlane('plane', { width: 16, height: 6 } , this.scene);
        plane.position = new BABYLON.Vector3(0, 3, -4);
        // GUI
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

        // seeing double-vision with this api - not supported on WebVr
        //let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this.scene);
    
        let input = new BABYLON.GUI.InputText();
        input.width = 0.2;
        input.maxWidth = 0.2;
        input.height = "40px";
        input.text = "Click here to start typing!";
        input.color = "white";
        input.background = "green";
		advancedTexture.addControl(input);    

        input.onTextChangedObservable.add((eventData: BABYLON.GUI.InputText, eventState: BABYLON.EventState) => {
            console.log("current text=" + eventData.text);
        });
				
		//let keyboard = BABYLON.GUI.VirtualKeyboard.CreateDefaultLayout();
        let keyboard = new BABYLON.GUI.VirtualKeyboard();
        keyboard.defaultButtonBackground = "grey";
        keyboard.addKeysRow(["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+"]);
        keyboard.addKeysRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0","\u2190"]);
        keyboard.addKeysRow(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"]);
        keyboard.addKeysRow(["a", "s", "d", "f", "g", "h", "j", "k", "l",";","'","\u21B5"]);
        keyboard.addKeysRow(["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]);
        keyboard.addKeysRow([" "], [{ width: "300px"}]);


		keyboard.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
		advancedTexture.addControl(keyboard);

		keyboard.connect(input);
    }

    // custom keyboard 
    createScene4(): void {
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        let sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.scene);
        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;
        // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
        let ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, this.scene);

        let plane = BABYLON.MeshBuilder.CreatePlane('plane', { width: 16, height: 6 } , this.scene);
        plane.position = new BABYLON.Vector3(0, 3, -4);
        // GUI
        let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

        // seeing double-vision with this api
        //let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui", true, this.scene);
    
        let input = new BABYLON.GUI.InputText();
        input.width = 0.2;
        input.maxWidth = 0.2;
        input.height = "40px";
        input.text = "Click here to start typing!";
        input.color = "white";
        input.background = "green";
		advancedTexture.addControl(input);    

        let customKeyboard = new CustomKeyboard(advancedTexture, input, (text: string) => {
            console.log("Entered text=" + text);
        });
    }
}
