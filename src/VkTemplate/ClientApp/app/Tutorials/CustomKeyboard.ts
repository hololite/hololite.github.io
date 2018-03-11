import 'babylonjs'
import 'babylonjs-gui'
//import 'babylonjs-loaders'
//import 'babylonjs-materials';
//import 'cannon';
//import 'oimo';
import { Common } from '../Common'

export class CustomKeyboard {
    private readonly SHIFT = "\u21E7";
    private readonly ENTER = "\u21B5";
    private readonly BACKSPACE = "\u2190";
    private loKeyboard: BABYLON.GUI.VirtualKeyboard;
    private hiKeyboard: BABYLON.GUI.VirtualKeyboard;
    private activeKeyboard: BABYLON.GUI.VirtualKeyboard;
    private advancedTexture: BABYLON.GUI.AdvancedDynamicTexture
    private input: BABYLON.GUI.InputText;
    private mode: boolean = false; // false: loKeyboard, true: hiKeyboard
    private onTextCompleted: (text: string) => void;

    constructor(advancedTexture: BABYLON.GUI.AdvancedDynamicTexture, input: BABYLON.GUI.InputText, onTextCompleted: (text: string) => void) {
        this.advancedTexture = advancedTexture;
        this.input = input;
        this.onTextCompleted = onTextCompleted;

        // keyboard layout for lower case keys + numerics
        this.loKeyboard = new BABYLON.GUI.VirtualKeyboard();
        this.loKeyboard.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.loKeyboard.addKeysRow(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", this.BACKSPACE]);
        this.loKeyboard.addKeysRow(["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"]);
        this.loKeyboard.addKeysRow(["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", this.ENTER]);
        this.loKeyboard.addKeysRow([this.SHIFT, "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]);
        this.loKeyboard.addKeysRow([" "], [{ width: "200px" }]); // 4
        this.loKeyboard.isVisible = false;
        this.loKeyboard.onKeyPressObservable.add((key: string, eventState: BABYLON.EventState) => {
            if (this.mode === false) {
                this.processKey(key, eventState);
            }
        });

        // keyboard layout for upper case keys + alphanumerics
        this.hiKeyboard = new BABYLON.GUI.VirtualKeyboard();
        this.hiKeyboard.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.hiKeyboard.addKeysRow(["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+", this.BACKSPACE]);
        this.hiKeyboard.addKeysRow(["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"]);
        this.hiKeyboard.addKeysRow(["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", this.ENTER]);
        this.hiKeyboard.addKeysRow([this.SHIFT, "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
            [{ color: "#7799FF" }, null, null, null, null, null, null, null, null, null, null]);
        this.hiKeyboard.addKeysRow([" "], [{ width: "200px" }]); // 4
        this.hiKeyboard.isVisible = false;
        this.hiKeyboard.onKeyPressObservable.add((key: string, eventState: BABYLON.EventState) => {
            if (this.mode === true) {
                this.processKey(key, eventState);
            }
        });

        this.activeKeyboard = this.loKeyboard; // initial mode
        this.activeKeyboard.connect(this.input);
		this.advancedTexture.addControl(this.activeKeyboard);
    }

    private processKey(key: string, eventState: BABYLON.EventState): void {
        if (key === this.SHIFT) {
            this.toggleKeyboardMode();
        }
        else if (key === this.ENTER) {
            this.onTextCompleted(this.input.text);
        }
    }

    private toggleKeyboardMode(): void {
        this.activeKeyboard.disconnect();
		this.advancedTexture.removeControl(this.activeKeyboard);
        this.activeKeyboard.isVisible = false;

        this.mode = !this.mode;
        this.activeKeyboard = (this.mode === true) ? this.hiKeyboard : this.loKeyboard;

		this.advancedTexture.addControl(this.activeKeyboard);
        this.activeKeyboard.connect(this.input);
        this.activeKeyboard.isVisible = true;
    }
}
