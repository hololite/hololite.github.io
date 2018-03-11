var x = 1;
var y;
var firstName = 'John';
var lastName: string = 'Papa';

var num1 = 100;
var num2: number = 20;

function addNumber(n1: number, n2:  number, n3: number) {
    var result = n1 + n2 + n3;
    var msg = 'Sum is ' + result;
    alert(msg);
    //
}

//
//
// Object type
//
var square = { h: 10, w: 20 };  // object literal
var points: Object = { x: 0, y: 0 };    // object type

//
// function type
//
// function type with specific signature
var multiply = function (x: number) {   // function literal
    return x * x;
}
/* this would cause error
multiply = function (x: string) {   // function literal
    return x;
}
*/


// function type with no/any signature
var multiplyMore: Function; // function type
multiplyMore = function (x: number) {
    return x * x;
}
multiplyMore = function (x: string) { // ok
    return x + "abc";
}

// arrow function (compact notation for function)
// no 'function' and 'return' keyword
// can be used as function literal or function signature
var myFunc = (h: number, w: number) => h * w;   // function literal
var myFunc2: (x: number, y: number) => number;  // function signature

export function run(): void {

}