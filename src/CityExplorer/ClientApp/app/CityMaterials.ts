import 'babylonjs'
import { Common } from './VkCore/Common'

enum TextureType {
    Unknown,
    RoofTop, FlatTop,
    Street, Pavement, Yard, Parking,
    Glasses, Facade 
};

export class MetallicRoughnessFactors {
    constructor(x: number, y: number) {
        this.m = x;
        this.r = y;
    }

    m: number;
    r: number;
}

export class CityMaterials {
    private static _instance: CityMaterials = null;


    private constructor() {
        this.buildMap();
	}

    private buildMap(): void {
        console.log(`map: length=${this.map.length}`);
        console.log(`map: val=${this.map[0]}`);
        console.log(`map: val=${this.map[10]}`);
    }

    private getTextureType(material: BABYLON.Material): TextureType {
        let textureType: TextureType = TextureType.Unknown;

        if (material) {
            let materialName = material.name;
            if (materialName.length > 9) {
                let num = materialName.substr(9);
                let idx = Number.parseInt(num);
                if (!Number.isNaN(idx)) {
                    if (idx >= 0 || idx < this.map.length) {
                        textureType = this.map[idx];
                    }
                }
            }
        }

        return textureType;
    }

    public genShadow(material: BABYLON.Material): boolean {
        let textureType = this.getTextureType(material);
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

        //if (textureType !== TextureType.Unknown)
        //   console.log(`**** genShadow: name=${material.name}, val=${val}`);
        return val;
    }

    private getMetallicRoughnessFactors(material: BABYLON.Material): MetallicRoughnessFactors {
        let textureType = this.getTextureType(material);
        let mrf = new MetallicRoughnessFactors(0.5, 0.5);

        switch (textureType) {
            case TextureType.Street:
            case TextureType.Pavement:
            case TextureType.Parking:
                mrf.m = 0.3;
                mrf.r = 0.5
                break;

            case TextureType.Yard:
                mrf.m = 0.0;
                mrf.r = 1.0
                break;

            case TextureType.RoofTop:
            case TextureType.FlatTop:
                mrf.m = 0.2;
                mrf.r = 0.4
                break;

            case TextureType.Facade:
                mrf.m = 0.3;
                mrf.r = 0.8;
                break;

            case TextureType.Glasses:
                mrf.m = 0.9;
                mrf.r = 0.5;
                break;

            case TextureType.Unknown:
            default:
        }

        return mrf;
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
            //console.log(`**** MaterialType: ${material.getClassName()}`);
            if (material instanceof BABYLON.PBRMaterial) {
                let txt = material.albedoTexture ? material.albedoTexture.name : "none";
                //console.log(`**** PBRMaterial: no=${matNo++}, name=${material.name}, baseTexture=${txt}, baseColor=${material.albedoColor.toString()}, metallic=${material.metallic}, roughness=${material.roughness}`);
                let mrf = this.getMetallicRoughnessFactors(material);
                material.metallic = mrf.m;
                material.roughness = mrf.r;

                material.usePhysicalLightFalloff = true;
            }
            else {
                console.warn('**** non-PBR material');
            }
        }
    }

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
        //81
        TextureType.Yard,
        //82
        TextureType.RoofTop,
        //83
        TextureType.Yard,
        //84
        TextureType.Yard,
        //85
        TextureType.Yard,
        //86
        TextureType.Yard,
        //87
        TextureType.RoofTop,
        //88
        TextureType.Parking,
        //89
        TextureType.RoofTop,

        //90
        TextureType.Yard,
        //91
        TextureType.RoofTop,
        //92
        TextureType.RoofTop,
        //93
        TextureType.RoofTop,
        //94
        TextureType.Yard,
        //95
        TextureType.Yard,
        //96
        TextureType.RoofTop,
        //97
        TextureType.Glasses,
        //98
        TextureType.Parking,
        //99
        TextureType.Facade,

        //100
        TextureType.RoofTop,
        //101
        TextureType.RoofTop,
        //102
        TextureType.RoofTop,
        //103
        TextureType.RoofTop,
        //104
        TextureType.RoofTop,
        //105
        TextureType.RoofTop,
        //106
        TextureType.RoofTop,
        //107
        TextureType.RoofTop,
        //108
        TextureType.Facade,
        //109
        TextureType.Facade,

        //110
        TextureType.Facade,
        //111
        TextureType.Street,
        //112
        TextureType.Parking,
        //113
        TextureType.Parking,
        //114
        TextureType.Yard,
        //115
        TextureType.Yard,
        //116
        TextureType.Parking,
        //117
        TextureType.RoofTop,
        //118
        TextureType.RoofTop,
        //119
        TextureType.RoofTop,

        //120
        TextureType.RoofTop,
        //121
        TextureType.RoofTop,
        //122
        TextureType.Facade,
        //123
        TextureType.RoofTop,
        //124
        TextureType.Yard,
        //125
        TextureType.RoofTop,
        //126
        TextureType.Parking,
        //127
        TextureType.RoofTop,
        //128
        TextureType.Parking,
        //129
        TextureType.RoofTop,

        //130
        TextureType.RoofTop,
        //131
        TextureType.RoofTop,
        //132
        TextureType.RoofTop,
        //133
        TextureType.RoofTop,
        //134
        TextureType.RoofTop,
        //135
        TextureType.RoofTop,
        //136
        TextureType.Facade,
        //137
        TextureType.RoofTop,
        //138
        TextureType.RoofTop,
        //139
        TextureType.Yard,

        //140
        TextureType.Parking,
        //141
        TextureType.Yard,
        //142
        TextureType.Street,
        //143
        TextureType.Street,
        //144
        TextureType.Street,
        //145
        TextureType.RoofTop,
        //146
        TextureType.RoofTop,
        //147
        TextureType.RoofTop,
        //148
        TextureType.RoofTop,
        //149
        TextureType.Parking,

        //150
        TextureType.Yard,
        //151
        TextureType.Parking,
        //152
        TextureType.Parking,
        //153
        TextureType.Street,
        //154
        TextureType.Street,
        //155
        TextureType.Street,
        //156
        TextureType.Street,
        //157
        TextureType.Street
    );
}

