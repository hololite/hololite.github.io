import 'babylonjs'
import { Common } from './VkCore/Common'

enum TextureType {
    Unknown,
    RoofTop, FlatTop,
    Street, Pavement, Yard, Parking,
    Glasses, Facade, Wall
};

export class CityMaterials {

    private static _instance: CityMaterials = null;
    private map : Array<TextureType> = new Array(
        //0
        TextureType.Glasses,
        //1
        TextureType.FlatTop,
        //2
        TextureType.FlatTop,
        //3
        TextureType.FlatTop,
        //4
        TextureType.FlatTop,
        //5
        TextureType.FlatTop,
        //6
        TextureType.Street,
        //7
        TextureType.Glasses,
        //8
        TextureType.FlatTop,
        //9
        TextureType.FlatTop,

        //10
        TextureType.FlatTop,
        //11
        TextureType.FlatTop,
        //12
        TextureType.Street,
        //13
        TextureType.Glasses,
        //14
        TextureType.RoofTop,
        //15
        TextureType.Parking,
        //16
        TextureType.Street,
        //17
        TextureType.Parking,
        //18
        TextureType.Glasses,
        //19
        TextureType.FlatTop,

        //20
        TextureType.Street
    );

    private constructor() {
        this.buildMap();
	}

    private buildMap(): void {
        console.log(`map: length=${this.map.length}`);
        console.log(`map: val=${this.map[0]}`);
        console.log(`map: val=${this.map[10]}`);
    }

    private genShadow(textureType: TextureType): boolean {
        let val: boolean;

        switch (textureType) {
            case TextureType.Unknown:
            case TextureType.Street:
            case TextureType.Pavement:
            case TextureType.Parking:
            case TextureType.Yard:
                val = false;
                break;

            default:
                val = true;
        }

        return val;
    }

    public static get instance(): CityMaterials {
        if (!CityMaterials._instance) {
			CityMaterials._instance = new CityMaterials();
        }
        return CityMaterials._instance;
    }

    public fixPBRMaterials(materials: BABYLON.Material[]): void {
        let matNo = 1;
        for (let material of materials) {
            console.log(`**** MaterialType: ${material.getClassName()}`);
            if (material instanceof BABYLON.PBRMaterial) {
                let txt = material.albedoTexture ? material.albedoTexture.name : "none";
                console.log(`**** PBRMaterial: no=${matNo++}, baseTexture=${txt}, baseColor=${material.albedoColor.toString()}, metallic=${material.metallic}, roughness=${material.roughness}`);
                material.metallic = 0.9;
                material.roughness = 0.5;
            }
        }
    }
}

