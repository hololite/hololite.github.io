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
        TextureType.Street,
        //21
        TextureType.Glasses,
        //22
        TextureType.Street,
        //23
        TextureType.Facade,
        //24
        TextureType.RoofTop,
        //25
        TextureType.Yard,
        //26
        TextureType.Facade,
        //27
        TextureType.RoofTop,
        //28
        TextureType.Yard,
        //29
        TextureType.Facade,

        //30
        TextureType.RoofTop,
        //31
        TextureType.Yard,
        //32
        TextureType.Yard,
        //33
        TextureType.Yard,
        //34
        TextureType.Facade,
        //35
        TextureType.RoofTop,
        //36
        TextureType.Facade,
        //37
        TextureType.RoofTop,
        //38
        TextureType.Yard,
        //39
        TextureType.Facade,
        //40
        TextureType.RoofTop,
        //41
        TextureType.Yard,
        //42
        TextureType.RoofTop,
        //43
        TextureType.RoofTop,
        //44
        TextureType.Street,
        //45
        TextureType.Glasses,
        //46
        TextureType.Parking,
        //47
        TextureType.Glasses,
        //48
        TextureType.RoofTop,
        //49
        TextureType.Facade,

        //50
        TextureType.RoofTop,
        //51
        TextureType.Street,
        //52
        TextureType.Facade,
        //53
        TextureType.Street,
        //54
        TextureType.Parking,
        //55
        TextureType.RoofTop,
        //56
        TextureType.Parking,
        //57
        TextureType.Facade,
        //58
        TextureType.Parking,
        //59
        TextureType.Facade,

        //60
        TextureType.RoofTop,
        //61
        TextureType.Facade,
        //62
        TextureType.RoofTop,
        //63
        TextureType.Yard,
        //64
        TextureType.Yard,
        //65
        TextureType.Yard,
        //66
        TextureType.Glasses,
        //67
        TextureType.Yard,
        //68
        TextureType.Facade,
        //69
        TextureType.RoofTop,

        //70
        TextureType.RoofTop,
        //71
        TextureType.Yard,
        //72
        TextureType.Parking,
        //73
        TextureType.Yard,
        //74
        TextureType.Yard,
        //75
        TextureType.RoofTop,
        //76
        TextureType.Yard,
        //77
        TextureType.RoofTop,
        //78
        TextureType.Yard,
        //79
        TextureType.Facade,

        //80
        TextureType.RoofTop,

        //157
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

    private getRoughness(textureType: TextureType): number {
        let val = 0.5;  //default

        switch (textureType) {
            case TextureType.RoofTop:
            case TextureType.FlatTop:
            case TextureType.Street:
            case TextureType.Parking:
            case TextureType.Pavement:
            case TextureType.Yard:
                val = 1.0;
                break;

            case TextureType.Glasses:
                val = 0.0;
                break;

            case TextureType.Unknown:
                val = 0.5;
                break;

            default:
                val = 0.5;
        }

        return val;
    }

    private getMetallic(textureType: TextureType): number {
        let val = 0.5;  //default

        switch (textureType) {
            case TextureType.RoofTop:
            case TextureType.FlatTop:
            case TextureType.Street:
            case TextureType.Parking:
            case TextureType.Pavement:
                val = 0.2;
                break;

            case TextureType.Yard:
                val = 0.0;
                break;

            case TextureType.Glasses:
                val = 1.0;
                break;

            case TextureType.Unknown:
                val = 0.5;
                break;

            default:
                val = 0.5;
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
        let matNo = 0;
        for (let material of materials) {
            console.log(`**** MaterialType: ${material.getClassName()}`);
            if (material instanceof BABYLON.PBRMaterial) {
                let txt = material.albedoTexture ? material.albedoTexture.name : "none";
                console.log(`**** PBRMaterial: no=${matNo++}, name=${material.name}, baseTexture=${txt}, baseColor=${material.albedoColor.toString()}, metallic=${material.metallic}, roughness=${material.roughness}`);
                material.metallic = 0.9;
                material.roughness = 0.5;
            }
            else {
                console.warn('**** non-PBR material');
            }
        }
    }
}

