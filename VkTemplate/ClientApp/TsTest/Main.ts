import * as GameTest from './GameTest';
import * as TypeTest from './TypeTest';
import * as ModuleTest from './ModuleTest';
import * as ExceptionTest from './ExceptionTest';
import * as StatementTest from './StatementTest';

interface Options {
    enableVR?: boolean;
    position?: number;
}

function testOption(options?: Options): void {
    if (options === undefined) {
        console.log("options undefined");
    }

    if (options !== undefined && options.enableVR) {
        console.log("enableVR true");
    }
    else {
        console.log("enableVR false");
    }

}

let i: number = 12;
let testNum = (12 > i) ? 10 : 20;
console.log('testNum=' + testNum);

testOption();
testOption({ enableVR: true });

//ExceptionTest.run();
//GameTest.run();
ModuleTest.run();
