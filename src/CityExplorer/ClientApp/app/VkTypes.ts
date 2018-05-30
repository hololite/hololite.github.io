import { Common } from './VkCore/Common'
import { VkApp, IVkDirector, VkScene, EndScene } from './VkCore/Vk'

// declare js types defined in mytypes.js
declare var Module: any;
declare var Table: any;
declare var MyTable: any;
declare var Vector: any;
declare var Foo: any;

export class VkTable {
    private myTable: any = null;
    private x: number = 0;

    private onSetData(i: number): void {
        console.log(`**** VkTable.onSetData: x=${this.x}, i=${i}`);
    }

    public constructor() {
        console.log('>>>> VkTable.constructor');
        this.myTable = new MyTable();
        this.myTable.onSetData = (i: number) => { this.onSetData(i); };
        this.x = 100;
        console.log('<<<< VkTable.constructor');
    }

    public setData(i: number): void {
        this.myTable.setData(i);
    }
}

export class VkTypes {
    public constructor() {
        console.log('>>>> VkTypes.constructor');


        var vector = new Vector(100, 101, 102);
        console.log('vector.x=' + vector.get_x());
        vector.set_y(7);
        vector.set_z(8);
        var v2 = vector.multiply(2);
        console.log('v2.x=' + v2.get_x());
        console.log('v2.y=' + v2.get_y());
        console.log('v2.z=' + v2.get_z());

        var f = Foo.prototype.createInstance();

        var bar = new Module.Bar(777);
        var foo = bar.makeFoo(); 

        foo.setVectorRef(vector);

        var val = bar.getVal();
        console.log(val);

        Module.destroy(foo);
        Module.destroy(bar);

        console.log('<<<< VkTypes.constructor');
    }
}
