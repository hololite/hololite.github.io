import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'babylonjs-post-process'
import 'babylonjs-procedural-textures'
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, FirstScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class Video360Scene extends FirstScene {
    private menu: VkMenu = new VkMenu(this, "End Scene");
    private dome: BABYLON.VideoDome = null;

    /*
    * Public members
    */
    constructor(
        position: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, -10),
        target: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0)
    ){
        super({
            cameraInitialPosition: position,
            cameraInitialTarget: target
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    protected createAssets(): void {
        this.menu.createAssets();
    }

    protected onStart(): void {
        this.dome = new BABYLON.VideoDome(
            "Fish",
            //["https://yoda.blob.core.windows.net/videos/uptale360.mp4"],
            ["assets/360/boxfish.mp4"],
            {
                resolution: 32
            },
            this.scene
        );

        let tickCount = 0;
        let zoomLevel = 1;

        this.beforeRenderCallback = () => {
            tickCount++;
            if (zoomLevel == 1) {
                if (tickCount >= 0) {
                    //dome.fovMultiplier = (Math.sin(tickCount / 100) * 0.5) + 1.0;
                }
            } else {
                //dome.fovMultiplier = zoomLevel;
            }
        };

        /*
        this.scene.onPointerObservable.add(function(e) {
            if(dome === undefined) { return; }
            zoomLevel += e.event.wheelDelta * -0.0005;
            if(zoomLevel < 0){ zoomLevel = 0; }
            if(zoomLevel > 2){ zoomLevel = 2; }
            if(zoomLevel == 1) {
                tickCount = -60;
            }
        }, BABYLON.PointerEventTypes.POINTERWHEEL);
        */
        this.menu.start();
    }

    protected onStop(): void {
        if (this.dome) {
            this.dome.dispose();
        }
    }
}
