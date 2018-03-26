import 'babylonjs'
import 'babylonjs-gui'
import { VkScene, VkApp } from './Vk'

export class VkMenu {
	private readonly    _vkScene:           VkScene;
    private             _menuOptionPlane:   BABYLON.Mesh = null;
    private             _enableMenu:        boolean = false;
    private             _text:              string = "Next Scene";

    private get scene(): BABYLON.Scene {
        return VkApp.instance.scene;
    }

	public constructor(scene: VkScene, text?: string) {
        this._vkScene = scene;
        if (text !== undefined) {
            this._text = text;
        }
    }

    public createAssets(): void {
        // UI planes
        this._menuOptionPlane = BABYLON.Mesh.CreatePlane("plane", 20, this.scene);
        let optionTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(this._menuOptionPlane);
        let optionPanel = new BABYLON.GUI.StackPanel();
        optionPanel.top = "100px";
        optionTexture.addControl(optionPanel);

        let button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", this._text);
        //button1.width = 1;
        button1.height = "40px";
        button1.width = "160px";
        button1.color = "white";
        button1.fontSize = 12;
        button1.background = "gray";
        button1.onPointerDownObservable.add(() => {
            //this.vrHelper.displayGaze = !this.vrHelper.displayGaze;
            /*
            if (this.scene.debugLayer.isVisible()) {
                this.scene.debugLayer.hide();
            }
            else {
                this.scene.debugLayer.show();
            }
            */
            this._vkScene.stop();
        });
        optionPanel.addControl(button1);
    }

    private enableMenu(enable: boolean) {
        this._menuOptionPlane.isVisible = enable;
        this._enableMenu = enable;

        if (enable) {
            this._menuOptionPlane.position = VkApp.instance.vrHelper.webVRCamera.devicePosition.clone();
            this._menuOptionPlane.position.y += 3;
            this._menuOptionPlane.rotationQuaternion = VkApp.instance.vrHelper.webVRCamera.deviceRotationQuaternion.clone();
            this._menuOptionPlane.translate(BABYLON.Axis.Z, 10, BABYLON.Space.LOCAL);
            VkApp.instance.showLaserPointer();
        }
    }

    public handleMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        if (pressed) {
            this.enableMenu(!this._enableMenu);
        }
    }

    public start(): void {
        this.enableMenu(false);

        this.scene.onBeforeRenderObservable.add(()=>{
            // Head position/rotation
            if (this.enableMenu) {
                this._menuOptionPlane.rotationQuaternion = VkApp.instance.vrHelper.webVRCamera.deviceRotationQuaternion.clone();
            }
        })
    }
}
