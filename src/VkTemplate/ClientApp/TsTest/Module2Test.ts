//
//  Module2Test depends on Module3Test
//
import { NumberValidator } from './Module3Test';

// no need to use namespace

export { NumberValidator } from './Module3Test';  // re-export NumberValidator
export const numberRegexp = /^[0-9]+$/;

interface StringValidator {
    isAcceptable(s: string): boolean;
}

//
// ZipCodeValidator depends on StringValidator, but no need
//  to export StringValidator as long as the consumer does not reference it directly
//
export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string): boolean {
        return s.length === 5 && numberRegexp.test(s);
    }
}
