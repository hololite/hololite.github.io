import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene, FirstScene } from '../../../../VkCore/Vk'
import { VkMenu } from '../../../../VkCore/VkMenu'

export class FrameScene extends VkScene {
    private light: BABYLON.HemisphericLight;
    private frame: BABYLON.Mesh;
    private menu: VkMenu = new VkMenu(this);
        
    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 2, -100)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    private frameMaker(name, options): BABYLON.Mesh {	
        let path = options.path;
        let profile = options.profile;
        
        let originX = Number.MAX_VALUE;
        
        for(let m = 0; m < profile.length; m++) {
            originX = Math.min(originX, profile[m].x);
        }

        let innerData = [];
        let outerData = [];
        let angle = 0;
        let extrusion = 0;
        let width = 0;
        let cornerProfile = [];
        
        let nbPoints = path.length;
        let line = BABYLON.Vector3.Zero();
        let nextLine = BABYLON.Vector3.Zero();
        path[1].subtractToRef(path[0], line);
        path[2].subtractToRef(path[1], nextLine);    
        
        for(let p = 0; p < nbPoints; p++) {    
            angle = Math.PI - Math.acos(BABYLON.Vector3.Dot(line, nextLine)/(line.length() * nextLine.length()));            
            let direction = BABYLON.Vector3.Cross(line, nextLine).normalize().z;                
            let lineNormal = new BABYLON.Vector3(line.y, -1 * line.x, 0).normalize();
            line.normalize();
            let extrusionLength = line.length();
            cornerProfile[(p + 1) % nbPoints] = [];
            //local profile
            for(let m = 0; m < profile.length; m++) {
                width = profile[m].x - originX;
                cornerProfile[(p + 1) % nbPoints].push(path[(p + 1) % nbPoints].subtract(lineNormal.scale(width)).subtract(line.scale(direction * width/Math.tan(angle/2))));			
            }   
            
            line = nextLine.clone();        
            path[(p + 3) % nbPoints].subtractToRef(path[(p + 2) % nbPoints], nextLine);    
        }
        
        let frame = [];
        let extrusionPaths = []
        
        for(let p = 0; p < nbPoints; p++) {
            extrusionPaths = [];
            for(let m = 0; m < profile.length; m++) {
                extrusionPaths[m] = [];
                extrusionPaths[m].push(new BABYLON.Vector3(cornerProfile[p][m].x, cornerProfile[p][m].y, profile[m].y));
                extrusionPaths[m].push(new BABYLON.Vector3(cornerProfile[(p + 1) % nbPoints][m].x, cornerProfile[(p + 1) % nbPoints][m].y, profile[m].y));
            }
            
            frame[p] = BABYLON.MeshBuilder.CreateRibbon("frameLeft", {pathArray: extrusionPaths, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: true, closeArray: true}, this.scene);
        }
        
        return BABYLON.Mesh.MergeMeshes(frame, true).convertToFlatShadedMesh();
    }
    
    protected createAssets(): void {
        this.light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(5, 10, 0), this.scene);
	
        /*
        let path  = [
            new BABYLON.Vector3(-150, -100, 0),
            new BABYLON.Vector3(150, -100, 0),
            new BABYLON.Vector3(150, 100, 0),
            new BABYLON.Vector3(-150, 100, 0)
        ]; 
        //profile in XoY plane, the left most point(s) will form the outer edge of the frame along the given path.
        let profilePoints = [
            new BABYLON.Vector3(-15, 15, 0),
            new BABYLON.Vector3(-15, -15, 0),
            new BABYLON.Vector3(15, -15, 0),
            new BABYLON.Vector3(15, 10, 0),
            new BABYLON.Vector3(10, 10, 0),
            new BABYLON.Vector3(10, 15, 0)
        ];
        */

        /*
        let path  = [
        new BABYLON.Vector3(-150, -100, 0),
        new BABYLON.Vector3(150, -100, 0),
        new BABYLON.Vector3(110, 100, 0)
        ]; 
        //profile in XoY plane, the left most point(s) will form the outer edge of the frame along the given path.
        let profilePoints = [
            new BABYLON.Vector3(-12, 12, 0),
            new BABYLON.Vector3(-12, -12, 0),
            new BABYLON.Vector3(12, -12, 0),
            new BABYLON.Vector3(12, -6, 0),
            new BABYLON.Vector3(-6, -6, 0),
            new BABYLON.Vector3(-6, 12, 0)
        ];
        */

        let path  = []; 
        let deltaAngle = Math.PI/128;
        let radiusX = 15;
        let radiusY = 20;
        for(let a = 0; a < 2 * Math.PI; a += deltaAngle) {
            path.push(new BABYLON.Vector3(radiusX * Math.cos(a), radiusY * Math.sin(a), 0));
        }
        
        //profile
        
        let height = 0.4;
        let inset = 0.1;
        let width = 2;
        let profilePoints = [
            new BABYLON.Vector3(width, 0, 0),
            new BABYLON.Vector3(-width, 0, 0),
            new BABYLON.Vector3(-width, height, 0),
            new BABYLON.Vector3(-width + inset, height, 0)
        ];
        
        let theta = -3 * Math.PI / 2;
        let steps = 40;
        let x = 0;
        let y = 0;
        for(let s = 0; s < steps; s++) {
            x = -width + inset + 2 * s * (width - inset) / steps;
            y = height + (1 - 1/((width - inset) * (width - height)) * x * x) * Math.abs(Math.cos(theta)) ;
            profilePoints.push(new BABYLON.Vector3(x, y, 0));
            theta += 3 * Math.PI /steps;		
        }
        
        profilePoints.push(new BABYLON.Vector3(width - inset, height, 0));
        profilePoints.push(new BABYLON.Vector3(width, height, 0));
        
        this.frame = this.frameMaker("line", {path: path, profile:profilePoints});

        this.menu.createAssets();
    }

    protected onStart(): void {
        this.beforeRenderCallback = () => {
            //this.light.position = this.vrHelper.currentVRCamera.position;
            this.frame.rotation.y += 0.01;
        };
	
        this.menu.start();
    }

    protected onStop(): void {
    }
}
