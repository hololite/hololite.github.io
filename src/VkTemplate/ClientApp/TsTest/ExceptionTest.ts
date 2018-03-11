abstract class MyException {

}
class MyException2 extends MyException {

}
class MyException3 extends MyException {

}

class Table {
    lookup(): void {
    }
}

function run1(): void {
    let success: boolean = false;
    try {
        let v: number = null;
        let w: boolean = null;
        let z = null;
        if (v === null && w === null && z === null) {
            console.log('all null');
        }

        let table: Table;
        let i: number;
        let k;
        let j: boolean;
        if (i === undefined && k === undefined && j === undefined && table === undefined) {
            console.log("undefined");
        }
    }
    //catch (e: MyException) {      // wrong, cannot specify type of exception object inside catch()
    //}                             // exception object is of 'any' type
    finally {
        console.log(`success=${success}`);
        // no catch, only finally, is ok
    }

    try {
        let table = null;
        if (table === null) {
            console.log("table is null");
        }
        else {
            console.log("table is not null");
        }
        table.lookup();
        success = true;
    }
    catch (e) {     
        // no finally, only catch, is ok
        console.log(`success=${success}`);
    }

    try {
        let i: number = 0;
        throw new MyException3();
    }
    catch (e) {
        if (e instanceof MyException3) {
            alert('MyException');
        }
        else if (e instanceof MyException2) {
            alert('MyException2');
        }
        else if (e instanceof MyException) {
            alert('MyException3');
        }
        else {
            alert('other exception');

        }
        alert(e.toString())
    }
    finally {

    }
}

export function run(): void {
    run1();
}
