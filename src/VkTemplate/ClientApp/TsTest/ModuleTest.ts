//
// Module setup:
// - Install requirejs and its ts def file to the wwwroot
//   npm install requirejs --save 
//   npm install @types/ requirejs --save
//
// - Create RequireConfig.ts
//   requirejs codes to specify which modules to be loaded
//
// - Edit index.html:
//   include RequireConfig.js like the following:   
//   <script type ="text/javascript" src ="node_modules/requirejs/require.js" data-main="RequireConfig"></script>
//
// - Edit tsconfig.json or related VS TS config:
//   the 'module' must be set to 'AMD'
//

//
//  ModuleTest depends on Module2Test
//
// MODULE2 is used as the namespace for module Module2Test
import * as MODULE2 from './Module2Test';

function run1(): void {
    console.log('Module testing start...');

    class MyNumberValidator implements MODULE2.NumberValidator {
        isAcceptable(s: string): boolean {
            return false; // not implemented yet
        }
    }
    let numValidator = new MyNumberValidator();
    numValidator.isAcceptable("1212121");

    let zipCodeValidator = new MODULE2.ZipCodeValidator();
    console.log(zipCodeValidator.isAcceptable("1212121212"));

    alert('success!');
}

export function run(): void {

}
