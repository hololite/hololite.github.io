import { Common } from './VkCore/Common'
import { VkApp, IVkDirector, VkScene, EndScene } from './VkCore/Vk'

// declare js types defined in mytypes.js
declare var Module: any;

export class VkTable {
    private myTable: any = null;
    private x: number = 0;

    private onSetData(i: number): void {
        console.log(`**** VkTable.onSetData: x=${this.x}, i=${i}`);
    }

    public constructor() {
        console.log('>>>> VkTable.constructor');
        this.myTable = new Module.MyTable();
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

    public constructor() {
        console.log('>>>> VkTypes.constructor');

        Module.onRuntimeInitialized = () => {
            this.moduleInitialized = true;
            console.log('*** EM Module is initialized!!!')
            this.test();
        }

        console.log('<<<< VkTypes.constructor');
    }

    private test(): void {
        let vkTable: VkTable = new VkTable();
        vkTable.setData(888);

        var vector = new Module.Vector(100, 101, 102);
        console.log('vector.x=' + vector.get_x());
        vector.set_y(7);
        vector.set_z(8);
        var v2 = vector.multiply(2);
        console.log('v2.x=' + v2.get_x());
        console.log('v2.y=' + v2.get_y());
        console.log('v2.z=' + v2.get_z());

        var f = Module.Foo.prototype.createInstance();

        var bar = new Module.Bar(777);
        var foo = bar.makeFoo(); 

        foo.setVectorRef(vector);

        var val = bar.getVal();
        console.log(val);

        Module.destroy(foo);
        Module.destroy(bar);
    }
}
