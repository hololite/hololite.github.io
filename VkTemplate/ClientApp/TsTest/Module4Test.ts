//
//  internal module
//  'module' has been replaced with 'namespace' in TS 1.5
//
namespace Shapes { // internal module
    export class Rectangle {    // need to use 'export'

    }
}

// extending module
namespace Shapes { // internal module
    export class Circle {    // need to use 'export'

    }
}

let rect = new Shapes.Rectangle();
let circle = new Shapes.Circle();