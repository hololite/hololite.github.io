import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'babylonjs-procedural-textures'
import 'cannon';
import 'oimo';
import { Common } from '../../../../VkCore/Common'
import { VkScene, FirstScene } from '../../../../VkCore/Vk'
import { VkMenu } from '../../../../VkCore/VkMenu'

//
//  Volumetric Light Scattering (VLS) post-process 
//

export class VLSScene extends FirstScene {
    private menu: VkMenu = new VkMenu(this);
    private rad1: BABYLON.Mesh;
    private newMesh: BABYLON.Mesh;
        
    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 10, -25)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    private createVLSAssets(): void {
        //Adding a light
        // let light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 40, 0), this.scene);
        let light = new BABYLON.HemisphericLight("Hemi", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        // light.specular = new BABYLON.Color3(1, 1, 1);
        light.intensity = .15;
    
        //Adding an Arc Rotate Camera
        /*
        let camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1.2, 20, new BABYLON.Vector3(0, 1, 0), this.scene);
        camera.attachControl(canvas, false);
        camera.wheelPrecision = 50;
        */
    
    // -------------------------------------------------------------------------
        // assorted materials
        let aux1Mat = new BABYLON.StandardMaterial("aux1Mat", this.scene);
        aux1Mat.wireframe = true;
        aux1Mat.backFaceCulling = false;
        aux1Mat.diffuseColor = new BABYLON.Color3(0, 1, 0);
        aux1Mat.emissiveColor = new BABYLON.Color3(0, .5, 0);
    
        let aux2Mat = new BABYLON.StandardMaterial("aux2Mat", this.scene);
        aux2Mat.wireframe = true;
        aux2Mat.backFaceCulling = false;
        aux2Mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        aux2Mat.emissiveColor = new BABYLON.Color3(.5, 0, 0);
    
        let aux3Mat = new BABYLON.StandardMaterial("aux3Mat", this.scene);
        aux3Mat.wireframe = true;
        aux3Mat.backFaceCulling = false;
        aux3Mat.diffuseColor = new BABYLON.Color3(1, 0, 1);
        aux3Mat.emissiveColor = new BABYLON.Color3(.5, 0, .5);
    
        let aux4Mat = new BABYLON.StandardMaterial("aux4Mat", this.scene);
        aux4Mat.wireframe = true;
        aux4Mat.backFaceCulling = false;
        aux4Mat.diffuseColor = new BABYLON.Color3(0, 1, 1);
        aux4Mat.emissiveColor = new BABYLON.Color3(0, .5, .5);
    
        let aux5Mat = new BABYLON.StandardMaterial("aux5Mat", this.scene);
        aux5Mat.wireframe = true;
        aux5Mat.backFaceCulling = false;
        aux5Mat.diffuseColor = new BABYLON.Color3(1, 1, 0);
        aux5Mat.emissiveColor = new BABYLON.Color3(.5, .5, 0);
    
    // -------------------------------------------------------------------------
        // make some this.scene mesh
        let sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 4, this.scene);
        let box1 = BABYLON.Mesh.CreateBox("box1", 4, this.scene);
        let box2 = BABYLON.Mesh.CreateBox("box2", 4, this.scene);
    
        let box3 = BABYLON.Mesh.CreateBox("box3", 8, this.scene);
        // box3.showBoundingBox = true;
        let box4 = BABYLON.Mesh.CreateBox("box4", 8, this.scene);
        // box4.showBoundingBox = true;
        let box5 = BABYLON.Mesh.CreateBox("box5", 8, this.scene);
        // box5.showBoundingBox = true;
        let box6 = BABYLON.Mesh.CreateBox("box6", 8, this.scene);
        // box6.showBoundingBox = true;
        let cyl1 = BABYLON.Mesh.CreateCylinder("cyl1", 10, 11, 11, 16, this.scene);
    
    // -------------------------------------------------------------------------
        // apply materials to this.scene mesh
        sphere.material = aux3Mat;
        box1.material = aux4Mat;
        box2.material = aux5Mat;
    
        box3.material = aux1Mat;
        box4.material = aux1Mat;
        box5.material = aux1Mat;
        box6.material = aux1Mat;
        cyl1.material = aux2Mat;
    
        box2.rotation.y += Math.PI / 8.0;
    
        sphere.position = new BABYLON.Vector3(15, 3.5, 15);
        box1.position = new BABYLON.Vector3(15, 1, 15);
        box2.position = new BABYLON.Vector3(15, 2, 15);
    
    
        box3.position = new BABYLON.Vector3(-15, 3, 20);
        box3.rotation = new BABYLON.Vector3(0, 0, 0);
    
        box4.position = new BABYLON.Vector3(-15, 3, 20);
        box4.rotation = new BABYLON.Vector3(0, (Math.PI/8), 0);
    
        box5.position = new BABYLON.Vector3(-15, 3, 20);
        box5.rotation = new BABYLON.Vector3(0, (Math.PI/8)*2, 0);
    
        box6.position = new BABYLON.Vector3(-15, 3, 20);
        box6.rotation = new BABYLON.Vector3(0, (Math.PI/8)*3, 0);
    
        cyl1.position = new BABYLON.Vector3(-15, 3, 20);
        cyl1.rotation = new BABYLON.Vector3(0, 0, 0);
    
    // -------------------------------------------------------------------------
        // csg-ify the mesh
        let sphereCSG = BABYLON.CSG.FromMesh(sphere);
        let box1CSG = BABYLON.CSG.FromMesh(box1);
        let box2CSG = BABYLON.CSG.FromMesh(box2);
        let box3CSG = BABYLON.CSG.FromMesh(box3);
        let box4CSG = BABYLON.CSG.FromMesh(box4);
        let box5CSG = BABYLON.CSG.FromMesh(box5);
        let box6CSG = BABYLON.CSG.FromMesh(box6);
        let cyl1CSG = BABYLON.CSG.FromMesh(cyl1);
    
    // -------------------------------------------------------------------------
        // Set up a MultiMaterial
        let mat0 = new BABYLON.StandardMaterial("mat0", this.scene);
        mat0.diffuseColor.copyFromFloats(0.4, 0.1, 0.6);
        mat0.emissiveColor.copyFromFloats(0.1, 0, 0.2);
        mat0.backFaceCulling = false;
    
        let mat1 = new BABYLON.StandardMaterial("mat1", this.scene);
        mat1.diffuseColor.copyFromFloats(0.2, 0.8, 0.2);
        mat1.emissiveColor.copyFromFloats(0, 0.2, 0);
        mat1.backFaceCulling = false;
    
    // -------------------------------------------------------------------------
        // go csg-crazy
        let subCSG = box1CSG.subtract(sphereCSG);
        this.newMesh = subCSG.toMesh("csg", mat0, this.scene, true);
        this.newMesh.position = new BABYLON.Vector3(-12, 0, 0);
    
        subCSG = sphereCSG.subtract(box1CSG);
        this.newMesh = subCSG.toMesh("csg2", mat0, this.scene, true);
        this.newMesh.position = new BABYLON.Vector3(12, 0, 0);
    
        subCSG = sphereCSG.intersect(box1CSG);
        this.newMesh = subCSG.toMesh("csg3", mat0, this.scene, true);
        this.newMesh.position = new BABYLON.Vector3(12, 0, 10);
    
        // Submeshes are built in order : mat0 will be for the first cube, and mat1 for the second
        let multiMat = new BABYLON.MultiMaterial("multiMat", this.scene);
        multiMat.subMaterials.push(mat0, mat1);
    
        // Last parameter to true means you want to build 1 subMesh for each mesh involved
        subCSG = box1CSG.subtract(box2CSG);
        this.newMesh = subCSG.toMesh("csg4", multiMat, this.scene, true);
        this.newMesh.position = new BABYLON.Vector3(-12, 0, 10);
    
        // wingy's fiddle-padiddle
        subCSG = cyl1CSG.subtract(box3CSG);
        subCSG = subCSG.subtract(box4CSG);
        subCSG = subCSG.subtract(box5CSG);
        subCSG = subCSG.subtract(box6CSG);
        // subCSG = cyl1CSG.subtract(box4CSG);
        // subCSG = cyl1CSG.subtract(box5CSG);
        // subCSG = cyl1CSG.subtract(box6CSG);
        this.newMesh = subCSG.toMesh("csg5", mat0, this.scene, true);
        this.newMesh.position = new BABYLON.Vector3(0, 2, 0);
        this.newMesh.scaling = new BABYLON.Vector3(1, .8, 1);
    
    // -----------------------------------------------------------------------------------------------------------------------
        // the bricks
        let brickMat = new BABYLON.StandardMaterial("auxMat", this.scene);

        let brickTexture = new BABYLON.BrickProceduralTexture("brickme", 512, this.scene);
        brickTexture.numberOfBricksWidth = 20;
        brickMat.diffuseTexture = brickTexture;

        // brickMat.bumpTexture = brickMat.diffuseTexture;
        // brickMat.emissiveTexture = brickMat.diffuseTexture;
        brickMat.emissiveColor = new BABYLON.Color3(.1, .1, .1);
    
        // numberOfBricksHeight no workie... problem at...
        // master/Babylon/Materials/Textures/Procedurals/babylon.standardProceduralTexture.ts#L288
        // brickMat.diffuseTexture._numberOfBricksHeight = 10;
        // brickMat.diffuseTexture.updateShaderUniforms();
        // brickMat.diffuseTexture.numberOfBricksHeight = 10;
        // brickMat.diffuseTexture.cloudColor = 20;
    
        // brickMat.diffuseTexture.jointColor = new BABYLON.Color4(1, 1, 1, 1);
        // brickMat.diffuseTexture.brickColor = new BABYLON.Color3(0, 0, 2);
        this.newMesh.material = brickMat;
        // brickMat.diffuseTexture.wAng = Math.PI/2;
    
    // -----------------------------------------------------------------------------------------------------------------------
        // the this.rad1 radiator (the logo)
        // let this.rad1 = BABYLON.Mesh.CreateBox("this.rad1", 5, this.scene);
        this.rad1 = BABYLON.Mesh.CreatePlane("this.rad1", 2, this.scene);
        // let this.rad1 = BABYLON.Mesh.CreateSphere("this.rad1", 8, 16, this.scene);
        // let this.rad1 = BABYLON.Mesh.CreateCylinder("this.rad1", 10, 5, 5, 8, 8, this.scene);
        this.rad1.visibility = 1;
    
        let sm = new BABYLON.StandardMaterial("bmat", this.scene);
        this.rad1.material = sm;
        sm.diffuseColor = new BABYLON.Color3(0.0, 1.0, 0.0);
        sm.emissiveColor = new BABYLON.Color3(1, 1, 1);
        // this.rad1.material.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.1);
        this.rad1.material.backFaceCulling = false;
    
        this.rad1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    
        // this.rad1.position = new BABYLON.Vector3(10, 5, 0);
        this.rad1.position = this.newMesh.position;
        this.rad1.rotation = new BABYLON.Vector3(Math.PI, 0, 0);
    
        // this.rad1.showBoundingBox = true;
        // this.rad1.material.wireframe = true;
    
    // ------------------------------------------------------------------------------
        // ground
        let grd = BABYLON.Mesh.CreateGround("grd", 50, 50, 1, this.scene);
        this.addTeleportMesh(grd);
        // let grd = BABYLON.Mesh.CreatePlane("grd", 50, this.scene);
        grd.showBoundingBox = true;
        grd.position = new BABYLON.Vector3(0, -2.02, 0);
        grd.rotation = new BABYLON.Vector3(0, 0, 0);
        grd.setEnabled(true);
    
        grd.material = new BABYLON.StandardMaterial("gmat", this.scene);
        grd.material.backFaceCulling = false;
        // grd.material.diffuseColor = new BABYLON.Color4(0.3,0.1,0.1);
    
    // ------------------------------------------------------------------------------
        // Create the "God Rays" effect (volumetric light scattering)
        let godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, this.getDefaultCamera(), this.rad1, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.engine, false);
        //TODO:
        //godrays._volumetricLightScatteringRTT.renderParticles = true;
        godrays.exposure = 0.1;
        godrays.decay = 0.96815;
        godrays.weight = 0.98767;
        godrays.density = 0.996;
    
        // make a base64 of the BJS logo, since Logo.png is not in playground/textures/ yet
        let image = 'data:image/png;base64, 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';
    
        // set the godrays texture to be the image.
        (<BABYLON.StandardMaterial>godrays.mesh.material).diffuseTexture = 
            new BABYLON.Texture('data:my_image_name', this.scene, true,
                               false, BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                               null, null, image, true);
    }
    
    protected createAssets(): void {
        this.createVLSAssets();
        this.menu.createAssets();
    }

    protected onStart(): void {
        this.scene.clearColor = new BABYLON.Color4(0 ,0, .15);

        this.beforeRenderCallback = () => {
            //camera.alpha += .01;
            //this.rad1.rotation.y += .05;
            this.newMesh.rotation.y -= .01;
        };

        this.menu.start();
    }

    protected onStop(): void {
    }
}

export class VLS2Scene extends FirstScene {
    private alpha = 1;
    private mesh: BABYLON.Mesh;
    private menu: VkMenu = new VkMenu(this);

    constructor() {
        super({
            cameraInitialTarget: BABYLON.Vector3.Zero(),
            cameraInitialPosition: new BABYLON.Vector3(0, 2, -20)
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    private createRibbon(mesh, pathArray, doubleSided, closeArray, closePath, offset): void {
        let positions = [];
        let indices = [];
        let indicesRecto = [];
        let indicesVerso = [];
        let normals = [];
        let normalsRecto = [];
        let normalsVerso = [];
        let uvs = [];
        let us = [];		// us[path_id] = [uDist1, uDist2, uDist3 ... ] distances between points on path path_id
        let vs = [];		// vs[i] = [vDist1, vDist2, vDist3, ... ] distances between points i of consecutives paths from pathArray
        let uTotalDistance = []; // uTotalDistance[p] : total distance of path p
        let vTotalDistance = []; //  vTotalDistance[i] : total distance between points i of first and last path from pathArray
        let minlg;		  // minimal length among all paths from pathArray
        let lg = [];		// array of path lengths : nb of vertex per path
        let idx = [];	   // array of path indexes : index of each path (first vertex) in positions array

        closeArray = closeArray || false;
        closePath = closePath || false;
        doubleSided = doubleSided || false;
        let defaultOffset = Math.floor(pathArray[0].length / 2);
        offset = offset || defaultOffset;
        offset = offset > defaultOffset ? defaultOffset : Math.floor(offset);

        // single path in pathArray
        if ( pathArray.length < 2) {
            let ar1 = [];
            let ar2 = [];
            for (let i = 0; i < pathArray[0].length - offset; i++) {
            ar1.push(pathArray[0][i]);
            ar2.push(pathArray[0][i+offset]);
            }
            pathArray = [ar1, ar2];
        }

        // positions and horizontal distances
        let idc = 0;
        minlg = pathArray[0].length;
        for(let p = 0; p < pathArray.length; p++) {
            uTotalDistance[p] = 0;
            us[p] = [0];
            let path = pathArray[p];
            let l = path.length;
            minlg = (minlg < l) ? minlg : l;
            lg[p] = l;
            idx[p] = idc;
            let j = 0;
            while (j < l) {
            positions.push(path[j].x, path[j].y, path[j].z);
            if (j > 0) {
                let vectlg = path[j].subtract(path[j-1]).length();
                let dist = vectlg + uTotalDistance[p];
                us[p].push(dist);
                uTotalDistance[p] = dist;
            }
            j++;
            }
            if ( closePath ) {
            let vectlg = path[0].subtract(path[j-1]).length();
            let dist = vectlg + uTotalDistance[p];
            uTotalDistance[p] = dist;
            }
            idc += l;
        }

        // vertical distances
        for (let i = 0; i < minlg; i++) {
            vTotalDistance[i] = 0;
            vs[i] =[0];

            let p: number;
            for (p = 0; p < pathArray.length-1; p++) {
                let path1 = pathArray[p];
                let path2 = pathArray[p+1];
                let vectlg = path2[i].subtract(path1[i]).length();
                let dist =  vectlg + vTotalDistance[i];
                vs[i].push(dist);
                vTotalDistance[i] = dist;
            }

            if (closeArray) {
                let path1 = pathArray[p];
                let path2 = pathArray[0];
                let vectlg = path2[i].subtract(path1[i]).length();
                let dist =  vectlg + vTotalDistance[i];
                vTotalDistance[i] = dist;
            }
        }

        // uvs
        for (let p = 0; p < pathArray.length; p++) {
            for(let i = 0; i < minlg; i++) {
                let u = us[p][i] / uTotalDistance[p];
                let v = vs[i][p] / vTotalDistance[i];
                uvs.push(u, v);
            }
        }

        // indices
        let p = 0;					// path index
        let i = 0;					// positions array index
        let l1 = lg[p] - 1;		   // path1 length
        let l2 = lg[p+1] - 1;		 // path2 length
        let min = ( l1 < l2 ) ? l1 : l2 ;   // index d'arrÃªt de i dans le path en cours
        let shft = idx[1] - idx[0];						  // shift
        let path1nb = closeArray ? lg.length : lg.length -1;	 // combien de path1 Ã  parcourir
        while ( i <= min && p < path1nb ) {					  // on reste sur le min des deux paths et on ne va pas au delÃ  de l'avant-dernier

            // draw two triangles between path1 (p1) and path2 (p2) : (p1.i, p2.i, p1.i+1) and (p2.i+1, p1.i+1, p2.i) clockwise
            let t1 = i;
            let t2 = i + shft;
            let t3 = i +1;
            let t4 = i + shft + 1;

            indices.push(i, i+shft, i+1);
            indices.push(i+shft+1, i+1, i+shft);
            i += 1;
            if ( i == min  ) {						  // dÃ¨s qu'on atteint la fin d'un des deux paths consÃ©cutifs, on passe au suivant s'il existe
            if (closePath) {						  // if closePath, add last triangles between start and end of the paths
                indices.push(i, i+shft, idx[p]);
                indices.push(idx[p]+shft, idx[p], i+shft);
                t3 = idx[p];
                t4 = idx[p] + shft;
            }
            p++;
            if ( p == lg.length - 1 ) {							// si on a atteint le dernier path du tableau <=> closeArray == true
                shft = idx[0] - idx[p];
                l1 = lg[p] - 1;
                l2 = lg[0] - 1;
            }
            else {
                shft = idx[p+1] - idx[p];
                l1 = lg[p] - 1;
                l2 = lg[p+1] - 1;
            }

            i = idx[p];
            min = ( l1 < l2 ) ? l1 + i : l2 + i;
            }
        }

        //faces(false, indices);
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);

        mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false);
        mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, false);
        mesh.setIndices(indices);
        mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, false);
    };

    // -----------------------------------------------
    // function Ribbon
    // mesh : a BABYLON.Mesh object
    // pathArray : array populated with paths; path = arrays of Vector3
    // doubleSided : boolean, true if the ribbon has got two reflective faces
    // closeArray : boolean, true if paths array is a loop => adds a extra ribbon joining last path and first path
    // closePath : boolean, true if paths are circular => last point joins first point, default false
    // offset : default  path length / 2, only for a single path
    // this.scene : the current this.scene
    // END RibbonMesh
    // -----------------------------------------------
    private harmonic(m, lat, long, paths): void {
        let pi = Math.PI;
        let pi2 = Math.PI * 2;
        let steplat = pi / lat;
        let steplon = pi2 / long;

        for (let theta = 0; theta <= pi2; theta += steplon) {
            let path = [];

            for (let phi = 0; phi <= pi; phi += steplat ) {
                let r = 0;
                r += Math.pow( Math.sin(m[0]*phi), m[1] );
                r += Math.pow( Math.cos(m[2]*phi), m[3] );
                r += Math.pow( Math.sin(m[4]*theta), m[5] );
                r += Math.pow( Math.cos(m[6]*theta), m[7] );

                let p = new BABYLON.Vector3( r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta) );
                path.push(p);
            }
            paths.push(path);
        }
        paths.push(paths[0]);
    };
    // -----------------------------------------------

    protected createAssets(): void {
        this.mesh = new BABYLON.Mesh("mesh", this.scene);
        this.mesh.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
        /*
        let showPath = function(path, scene) {
            let line = BABYLON.Mesh.CreateLines("line", path, this.scene )
        };
        */
        // -----------------------------------------------
        let paths = [];
    
        // here's the 'm' numbers used to create the SH shape
        let m = [7,3,8,0,9,2,7,2];
        /*
        let m = [
            Math.random().toFixed(1)*10,
            Math.random().toFixed(1)*10,
    
            // 1, // this makes the shapes more basic, less spikey.  Or use this line...
            Math.random().toFixed(1)*10,
    
            Math.random().toFixed(1)*10,
            Math.random().toFixed(1)*10,
            Math.random().toFixed(1)*10,
            Math.random().toFixed(1)*10,
            Math.random().toFixed(1)*10
        ];
        */
        console.log("m-numbers: " + m);
        // -----------------------------------------------
        // go make the shape!
        this.harmonic(m, 64, 64, paths);
    
    /*
        for (let p = 0; p < paths.length; p++) {
        showPath(paths[p], this.scene);
        }
    */
    
        // make a blank mesh and scale it up. Used soon, past the fire stuff.
        // -----------------------------------------------
        // clone of the BJS fire procedural texture's shader
        BABYLON.Effect.ShadersStore["myFirePixelShader"]=
    
            "#ifdef GL_ES\r\n"+
            "precision highp float;\r\n"+
            "#endif\r\n"+
    
            "uniform float time;\r\n"+
            "uniform vec3 c1;\r\n"+
            "uniform vec3 c2;\r\n"+
            "uniform vec3 c3;\r\n"+
            "uniform vec3 c4;\r\n"+
            "uniform vec3 c5;\r\n"+
            "uniform vec3 c6;\r\n"+
            "uniform vec2 speed;\r\n"+
            "uniform float shift;\r\n"+
            "uniform float alphaThreshold;\r\n"+
    
            "varying vec2 vUV;\r\n"+
    
            "float rand(vec2 n) {\r\n"+
            "	return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\r\n"+
            "}\r\n"+
    
            "float noise(vec2 n) {\r\n"+
            "	const vec2 d = vec2(0.0, 1.0);\r\n"+
            "	vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\r\n"+
            "	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);\r\n"+
            "}\r\n"+
    
            "float fbm(vec2 n) {\r\n"+
            "	float total = 0.0, amplitude = 1.0;\r\n"+
            "	for (int i = 0; i < 4; i++) {\r\n"+
            "		total += noise(n) * amplitude;\r\n"+
            "		n += n;\r\n"+
            "		amplitude *= .5;\r\n"+
            "	}\r\n"+
            "	return total;\r\n"+
            "}\r\n"+
    
            "void main() {\r\n"+
            "	vec2 p = vUV * 8.0;\r\n"+
            "	float q = fbm(p - time * .1);\r\n"+
            "	vec2 r = vec2(fbm(p + q + time * speed.x - p.x - p.y), fbm(p + q - time * speed.y));\r\n"+
            "	vec3 c = mix(c1, c2, fbm(p + r)) + mix(c3, c4, r.x) - mix(c5, c6, r.y);\r\n"+
            "	vec3 color = c * cos(shift * vUV.y);\r\n"+
            "	float luminance = dot(color.rgb, vec3(0.3, 0.59, 0.11));\r\n"+
    
            "	gl_FragColor = vec4(color, luminance * alphaThreshold + (1.0 - alphaThreshold));\r\n"+
        "}";
        // alert(BABYLON.Effect.ShadersStore["myFirePixelShader"]);
        // -----------------------------------------------
        // create/texturize the fire material that uses it
        let fireMaterial = new BABYLON.StandardMaterial("fontainSculptur2", this.scene);
        let fireTexture = new BABYLON.FireProceduralTexture("fire", 256, this.scene);
        fireTexture.level = 1;
    
        // black area compensator
        fireTexture.uScale = .7;
        fireTexture.vScale = .7;
    
        // el forco de shadero
        fireTexture.setFragment("myFire");
    
        // turn more fire material knobs
        fireMaterial.diffuseColor = new BABYLON.Color3(Math.random()/2, Math.random()/2, Math.random()/2);
        fireMaterial.diffuseTexture = fireTexture;
        fireMaterial.alpha = 1;
        // fireMaterial.opacityTexture = fireTexture;
        // fireMaterial.opacityColor = new BABYLON.Color3(0, 3, 0);
        fireMaterial.specularTexture = fireTexture;
        fireMaterial.emissiveTexture = fireTexture;
        fireMaterial.specularPower = 4;
        fireMaterial.backFaceCulling = false;
    
        // use a preset firecolors 6-pack
        // fireTexture.fireColors = BABYLON.FireProceduralTexture.PurpleFireColors;
    
        // or stock the firecolors array with six colors
        fireTexture.fireColors = [
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random()),
            new BABYLON.Color3(Math.random(), Math.random(), Math.random())
        ];
        // -----------------------------------------------
        // assign it to the mesh
        this.mesh.material = fireMaterial;
        // -----------------------------------------------
        // here we go loop-tee-loo
        this.createRibbon(this.mesh, paths, false, null, true, 0);
        // -----------------------------------------------
        // Adding some experimenter's lights
        let light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 0, 0), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        // light.specular = new BABYLON.Color3(1, 1, 1);
        light.intensity = .25;
    
        // let light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(0, 1, 0), this.scene);
        // light.diffuse = new BABYLON.Color3(1, 1, 1);
        // light.specular = new BABYLON.Color3(1, 1, 1);
    
        // let light = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(0, -10, 0), new BABYLON.Vector3(0, 1, 0), 0.8, 2, this.scene);
        // light.diffuse = new BABYLON.Color3(1, 1, 1);
        // light.specular = new BABYLON.Color3(1, 1, 1);
        // light.intensity = 0;
    
        // let light = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, -1, 0), this.scene);
        // light.diffuse = new BABYLON.Color3(1, 1, 1);
        // light.specular = new BABYLON.Color3(1, 1, 1);
        // light.intensity = .7;
    
        //Adding an Arc Rotate Camera
        /*
        let camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, 1, 20, BABYLON.Vector3.Zero(), this.scene);
        camera.attachControl(canvas, false);
        camera.wheelPrecision = 50;  // lower = faster
        */
        // -----------------------------------------------
    /*
        // a handy m&m for experimenting-with.  (mesh & material)
        let box = BABYLON.Mesh.CreateBox("box", 1, this.scene);
        // let box = BABYLON.Mesh.CreatePlane("box", 50, this.scene);
        box.visibility = 1;
        // camera.target = box;
    
        box.material = new BABYLON.StandardMaterial("bmat", this.scene);
        // box.material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        box.position = new BABYLON.Vector3(0, -.1, 0);
        box.rotation = new BABYLON.Vector3(-Math.PI/2, 0, 0);
        box.showBoundingBox = true;
    */
        // -----------------------------------------------
        // Create the "God Rays" effect (volumetric light scattering)
        let godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, this.getDefaultCamera(), this.mesh, 50, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.engine, false);
        // alert("gr.mesh name: " + godrays.mesh.name);
    
        // no particles in this demo, so we leave this false
        // godrays._volumetricLightScatteringRTT.renderParticles = true;
    
        // some advanced godrays settings for you to play-with
        godrays.exposure = 0.2;
        godrays.decay = 0.96815;
        godrays.weight = 0.58767;
        godrays.density = 0.926;
        // -----------------------------------------------
        // not sure about this.  Right now, with my active hemi, it does little/nothing.
        light.position = godrays.mesh.position;
        // -----------------------------------------------
    /*
        // this displays a small flat plane to better see the fire texture
        let monitor = BABYLON.Mesh.CreatePlane("mon", 1.8, this.scene);
        monitor.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        monitor.position = new BABYLON.Vector3(4, 2, -1);
        monitor.material = fireMaterial;
        monitor.showBoundingBox = true;
        // monitor.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
    */
        // -----------------------------------------------
        // how about some animation?
        
        this.menu.createAssets();
    }

    protected onStart(): void {
        let black =  BABYLON.Color3.Black();
        let black4 = new BABYLON.Color4(black.r, black.g, black.b);
        this.scene.clearColor = black4;

        this.beforeRenderCallback = () => {
            this.mesh.rotation.y -= 0.03;
            this.mesh.rotation.x += 0.01;
            // activate these 2 lines for y-axis scale-pulsing
            //this.alpha += 0.3;
            //this.mesh.scaling.y = (Math.cos(this.alpha)/2)+.7;
        };

        this.menu.start();
    }
}
