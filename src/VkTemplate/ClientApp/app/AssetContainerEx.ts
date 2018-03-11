import { AssetContainer } from 'babylonjs'

/*
export class KeepAssets {
    cameras: BABYLON.Camera[] = [];
    meshes: BABYLON.Mesh[] = [];
    geometries: BABYLON.Geometry[] = [];
    materials: BABYLON.Material[] = [];
    lights: BABYLON.Light[] = [];
}
*/

export class AssetContainerEx extends BABYLON.AssetContainer {
    /*
    private moveAssets<T>(sourceAssets: T[], targetAssets: T[], keepAssets: T[]): void {
        for (let asset of sourceAssets) {
            let move = true;
            for (let keepAsset of keepAssets) {
                if (asset === keepAsset) {
                    move = false;
                    break;
                }
            }

            if (move) {
                targetAssets.push(asset);
            }
        }
    }
    */

    constructor(scene: BABYLON.Scene) {
        super(scene);
    }

    /*
    moveAllFromScene(keepAssets?: KeepAssets): void {

        if (keepAssets === undefined) {
            keepAssets = new KeepAssets();
        }

        this.moveAssets(this.scene.cameras, this.cameras, keepAssets.cameras);
        this.moveAssets(this.scene.meshes, this.meshes, keepAssets.meshes);
        this.moveAssets(this.scene.getGeometries(), this.geometries, keepAssets.geometries);
        this.moveAssets(this.scene.materials, this.materials, keepAssets.materials);
        this.moveAssets(this.scene.lights, this.lights, keepAssets.lights);

        Array.prototype.push.apply(this.actionManagers, this.scene._actionManagers);
        Array.prototype.push.apply(this.animations, this.scene.animations);
        Array.prototype.push.apply(this.lensFlareSystems, this.scene.lensFlareSystems);
        Array.prototype.push.apply(this.morphTargetManagers, this.scene.morphTargetManagers);
        Array.prototype.push.apply(this.multiMaterials, this.scene.multiMaterials);
        Array.prototype.push.apply(this.skeletons, this.scene.skeletons);
        Array.prototype.push.apply(this.particleSystems, this.scene.particleSystems);
        Array.prototype.push.apply(this.sounds, this.scene.mainSoundTrack.soundCollection);
        Array.prototype.push.apply(this.transformNodes, this.scene.transformNodes);

        this.removeAllFromScene();
    }
    */
}
