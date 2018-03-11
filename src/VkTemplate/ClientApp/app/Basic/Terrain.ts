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

export class TerrainScene extends FirstScene {
    private menu: VkMenu = new VkMenu(this, new BABYLON.Vector3(10, 10, 15));

    /*
    * Public members
    */
    constructor(position: BABYLON.Vector3, target: BABYLON.Vector3) {
        super({
            cameraInitialPosition: position,
            cameraInitialTarget: target
        });

    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }


    protected createAssets(): void {
            // Light
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene);
        
        // Create terrain material
        let terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", this.scene);
        terrainMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        terrainMaterial.specularPower = 64;
        
        // Set the mix texture (represents the RGB values)
        terrainMaterial.mixTexture = new BABYLON.Texture("assets/textures/mixMap.png", this.scene);
        
        // Diffuse assets/textures following the RGB values of the mix map
        // diffuseTexture1: Red
        // diffuseTexture2: Green
        // diffuseTexture3: Blue
        terrainMaterial.diffuseTexture1 = new BABYLON.Texture("assets/textures/floor.png", this.scene);
        terrainMaterial.diffuseTexture2 = new BABYLON.Texture("assets/textures/rock.png", this.scene);
        terrainMaterial.diffuseTexture3 = new BABYLON.Texture("assets/textures/grass.png", this.scene);
        
        // Bump assets/textures according to the previously set diffuse assets/textures
        terrainMaterial.bumpTexture1 = new BABYLON.Texture("assets/textures/floor_bump.png", this.scene);
        terrainMaterial.bumpTexture2 = new BABYLON.Texture("assets/textures/rockn.png", this.scene);
        terrainMaterial.bumpTexture3 = new BABYLON.Texture("assets/textures/grassn.png", this.scene);
       
        // Rescale assets/textures according to the terrain
        terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 10;
        terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 10;
        terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 10;
        
        // Ground
        let ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/textures/heightMap.png", 100, 100, 100, 0, 10, this.scene, false);
        ground.position.y = -2.05;
        ground.material = terrainMaterial;

        this.teleportMeshes.push(ground);

        this.menu.createAssets();
    }

    protected onStart(): void {
        this.menu.start();
    }
}
