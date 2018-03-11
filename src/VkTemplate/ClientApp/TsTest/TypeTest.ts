// Interface
interface IPoint {
    getDist(): number;
}

// Module
module Shapes {

    // Class
    export class Point implements IPoint {
        // Constructor
        constructor(public x: number, public y: number) { }

        // Instance member
        getDist() { return Math.sqrt(this.x * this.x + this.y * this.y); }

        // Static member
        static origin = new Point(0, 0);
    }
}


abstract class Type1 {
    constructor() {
        alert('Type1.ctor');
        this.internalMethod();
    }

    internalMethod(): void {
        alert('Type1.internalMethod');
    }

    getData(arg: number): number {
        return arg * 2;
    }

    getProperty(arg: number): number {
        return arg * 2;
    }
}

class Type2 extends Type1 {
    constructor() {
        super();
        alert('Type2.ctor');
    }

    internalMethod(): void {
        alert('Type2.internalMethod');
    }

    getData(arg: number): number {
        return arg * 4;
    }
    getProperty(arg2: number): number{
        return arg2 * 2;
    }

    /*
    getProperty(arg: string): string{
        return arg + arg;
    }
    */
}

class Type3 extends Type2 {
    constructor() {
        super();
        alert('Type3.ctor');
    }

    /*
    internalMethod(): void {
        alert('Type3.internalMethod');
    }
    */

    getData(arg: number): number {
        return arg * 8;
    }
}

let t3: Type3 = new Type3();
let t2: Type2 = t3;
let t1: Type1 = t2;

alert('t1=' + t1.getData(1));
alert('t2=' + t2.getData(1));
alert('t3=' + t3.getData(1));



console.log("**** HEY HEY HEY!!!");

let anyObj: any;
anyObj = 10;
anyObj = "test me";
anyObj = true;

if (anyObj == 0) {
    alert("yes it's 0");
}
else {
    alert("it's not 0");
}

alert("anyObj=" + anyObj);
anyObj = 11;
alert("anyObj=" + anyObj);

// Local variables
var p: IPoint = new Shapes.Point(3, 4);
var dist = p.getDist();
var x3 = 1;
var x3: number = 2;
//

var y;  // implicitly is 'any' type

var z = 'hello';
var v: string = 'hello hello';


//
// boolean
//
let isDone: boolean = true; 

//
//  number
//
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;

//alert('decimal=' + decimal);

function modifyNumber(num: number) : void {
    decimal = num;
}

modifyNumber(8);

//alert('decimal=' + decimal);


//
// string
//
let color: string = "blue";
color = 'red';

let fullName: string = `Bob Bobbington`;
let age: number = 37;
let sentence: string = `Hello, my name is ${ fullName }.

I'll be ${ age + 1 } years old next month.`;

//
// array
//
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];
let element1: number = list1[0];

//
//  null
//
// null is a subtype of all types except void and undefined
//


//
//  undefined
//
// subtype of any type


//
// tuple
//
// Declare a tuple type
let x2: [string, number];
// Initialize it
x2 = ["hello", 10]; // OK

//
// enum
//
enum Color {Red, White, Green, Blue}
let c: Color = Color.Green;
let colorName: string = Color[2];

//alert(colorName); // Displays 'Green' as it's value is 2 above

//
//  function
//
// function is a first-class type
// Note the difference between:
// - function statement
// - function literal
// - function type spec

// function literal
// - looks like function but has no name
// - has params and body
// - implies the specific function type
var isBald = function () { return 'yes' };  // the type of isBald is a 'function(): string'
var isBald2 = function (name: string) { return 'yes' };  // the type of isBald is a 'function(): string'
var isBald3 = function (namename: string) { return 'yes' };  // the type of isBald is a 'function(): string'

//
// arrow function
// - function compact format
// - no 'function' keyword
// - no 'return' keyword

// 'function literal' has no name
//
// 'function literal': function(h: number, w: number) { return h * w; }   // normal format
//                     (h: number, w: number) => h * w;                   // arrow format
//
//  'function type spec': like function literal but has no body
//                          (h: number): string             // normal format
//                          (msg: string) => void           // arrow format
// 
let helloWorld: (name?: string) => void;                // using 'function type spec'
helloWorld = (name?: string) => { if (name !== undefined) console.log(name); };  // using function literal
helloWorld();
helloWorld('john papa');

// function type spec can also appear in interface
interface SquareFunction {
    (x: number): number;
}

var multipleMore: Function;     // general function type
var multipleMore2 = function () {};     // general function type
multipleMore = isBald;          // casting specific -> general function is ok
multipleMore2 = isBald;          // casting specific -> general function is ok
//isBald = isBald2;             // error: function type has different signatures
isBald3 = isBald2;              // ok: param name is different but param type is the same

var hasHair = !!isBald(); // invoking function variable isBald, hasHair is a boolean


// applying !! will get you true or false

//
//  object type
//
// object literal
let point1 = { x: 10, y: 20 };
// same as: let point1: Object = { x: 10, y: 20 };

let point2 = {};    // general object
// same as let point2: Object ;    // general object
//point1 = point2;  //error: objects of different structures
point2 = point1;    // specific -> general object casting is ok
let point3: Object;


//
//  class
//
class Student {
    fullName: string;
    constructor(public firstName: string, public middleInitial: string, public lastName: string) {
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}

interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person: Person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}

let user = new Student("Jane", "Middle", "Last222");


window.onload = () => {
	//var myClass = new MyClass();
	//myClass.render("content", "Hello World from TS");
    var el: HTMLElement = document.getElementById("content");
    el.innerText = greeter(user);
};

alert('TypeTest');

export function run(): void {

}
