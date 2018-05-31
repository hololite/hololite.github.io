import { Common } from './VkCore/Common'
import { VkApp, IVkDirector, VkScene, EndScene } from './VkCore/Vk'

//
// declare js types defined in mytypes.js
//
declare function createVkModule(): any;

export class VkTable {
    private myTable: any = null;
    private x: number = 0;

    private onSetData(i: number): void {
        console.log(`**** VkTable.onSetData: x=${this.x}, i=${i}`);
    }

    public constructor(vkModule: any) {
        console.log('>>>> VkTable.constructor');
        this.myTable = new vkModule.MyTable();
        this.myTable.onSetData = (i: number) => { this.onSetData(i); };
        this.x = 100;
        console.log('<<<< VkTable.constructor');
    }

    public setData(i: number): void {
        this.myTable.setData(i);
    }
}

export class VkTypes {
    private moduleInitialized = false;
    private vkModule: any = null;

    public constructor() {
        console.log('>>>> VkTypes.constructor');
        this.vkModule = createVkModule();
        this.vkModule.onRuntimeInitialized = () => {
            this.moduleInitialized = true;
            console.log('*** EM Module is initialized!!!')
            this.test();
        }

        console.log('<<<< VkTypes.constructor');
    }

    private test(): void {
        let vkTable: VkTable = new VkTable(this.vkModule);
        vkTable.setData(888);

        var vector = new this.vkModule.Vector(100, 101, 102);
        console.log('vector.x=' + vector.get_x());
        vector.set_y(7);
        vector.set_z(8);
        var v2 = vector.multiply(2);
        console.log('v2.x=' + v2.get_x());
        console.log('v2.y=' + v2.get_y());
        console.log('v2.z=' + v2.get_z());

        var f = this.vkModule.Foo.prototype.createInstance();

        var bar = new this.vkModule.Bar(777);
        var foo = bar.makeFoo(); 

        foo.setVectorRef(vector);

        var val = bar.getVal();
        console.log(val);

        this.vkModule.destroy(foo);
        this.vkModule.destroy(bar);
    }
}
