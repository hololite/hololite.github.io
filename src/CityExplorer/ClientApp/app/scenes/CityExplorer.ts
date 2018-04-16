import 'babylonjs'
import 'babylonjs-inspector'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'babylonjs-post-process'
import 'babylonjs-procedural-textures'
import 'cannon';
import 'oimo';
import { Common } from './../VkCore/Common'
import { VkScene, FirstScene } from './../VkCore/Vk'
import { VkMenu } from './../VkCore/VkMenu'
import * as Collections from 'typescript-collections'

export interface ICityExplorerOptions {
    rotate?:        boolean;
    defaultEnv:     boolean;
    soundFile?:     string;
    envDdsFile?:    string;
    scale?:         number;
}

class CityExplorerOptions implements ICityExplorerOptions {
    constructor(args?: ICityExplorerOptions) {
        if (args !== undefined) {
            if (args.rotate !== undefined)
                this.rotate = args.rotate;
            if (args.defaultEnv !== undefined)
                this.defaultEnv = args.defaultEnv;
            if (args.soundFile !== undefined)
                this.soundFile = args.soundFile;
            if (args.envDdsFile !== undefined)
                this.envDdsFile = args.envDdsFile;
            if (args.scale !== undefined)
                this.scale = args.scale;
        }
    }

    rotate:         boolean = false;
    defaultEnv:     boolean = true;
    soundFile:      string = "";
    envDdsFile:     string = "";
    scale:          number = 1;
}

export class CityExplorerScene extends FirstScene implements EventListenerObject {
    private light: BABYLON.HemisphericLight = null;
    private menu: VkMenu = new VkMenu(this);
    private decals: BABYLON.Mesh[] = [];
    private decalMaterial: BABYLON.StandardMaterial;
    private meshes: BABYLON.AbstractMesh[] = null;
    private path: string;
    private file: string;
    private skyBox: BABYLON.Mesh = null;
    private sound3D: BABYLON.Sound = null;
    private skybox: BABYLON.Mesh = null;
    private skyboxMaterial: BABYLON.SkyMaterial = null;
    private loaderOptions: CityExplorerOptions = null;
    private skyboxMode: number = 0;
    private textureAtlas = new Collections.Dictionary<string, BABYLON.Texture>(); 
    private opt = {optimizeMeshes: false, freezeMeshes: false, optClear: false, optTexture:false, enableLOD: false};
    private speed = 0.05;
    private s1: BABYLON.SimplificationSettings = null;
    private s2: BABYLON.SimplificationSettings = null;
    private s3: BABYLON.SimplificationSettings = null;

    /*
    * Public members
    */
    constructor(path: string, file: string, position: BABYLON.Vector3, target: BABYLON.Vector3, options?: ICityExplorerOptions) {
        super({
            cameraInitialPosition: position,
            cameraInitialTarget: target
        });

        this.path = path;
        this.file = file;
        this.loaderOptions = new CityExplorerOptions(options);
    }

    /*
    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }
    */

    private createSound(): void {
        console.log(`**** soundFile=${this.loaderOptions.soundFile}`);
        if (this.loaderOptions.soundFile !== "") {
            this.sound3D = new BABYLON.Sound(
                "Sound3D",
                this.loaderOptions.soundFile,
                this.scene,
                () => {},
                {
                    loop: true, autoplay: true, volume: 0.7, spatialSound: true, distanceModel: "linear"
                }
            );

            // Set 3D sound's position
            this.sound3D.setPosition(new BABYLON.Vector3(0, 100, 0));

            // Set 3D sound's max distance (linear model)
            this.sound3D.maxDistance = 5000;
        }
    }

    private deleteSound(): void {
        if (this.sound3D) {
            this.sound3D.stop();
            this.sound3D.dispose();
            this.sound3D = null;
            console.log('sound deleted');
        }
        else {
            console.log('no sound');
        }
    }

    private addDecal(pickInfo: BABYLON.PickingInfo, pickedMesh: BABYLON.AbstractMesh): void {
        let decalSize = new BABYLON.Vector3(1, 1, 1);
        let decal = BABYLON.MeshBuilder.CreateDecal("decal", pickedMesh, { position: pickInfo.pickedPoint, normal: pickInfo.getNormal(true), size: decalSize });
        decal.material = this.decalMaterial;
        this.decals.push(decal);
    }

    protected onTriggerButton(controller: BABYLON.WebVRController, pressed: boolean): void {
        if (pressed && this.meshes) { // this.meshes can be null while it is still being constructed
            console.log('>>>> DecalScene.onTriggerButton');

            let ray = controller.getForwardRay();
            let pickedMesh: BABYLON.AbstractMesh = null;
            let pickInfo: BABYLON.PickingInfo;

            for (let mesh of this.meshes) {
                pickInfo = ray.intersectsMesh(mesh);
                if (pickInfo.hit) {
                    pickedMesh = mesh;
                    break;
                }
            }

            if (pickedMesh) {
                this.addDecal(pickInfo, pickedMesh);
            }

            console.log('<<<< DecalScene.onTriggerButton');
        }
    }
    
    protected createAssets(): void {
        this.light = new BABYLON.HemisphericLight("Hemi", new BABYLON.Vector3(0, 1, 0), this.scene);
        this.light.intensity = 2;

        this.decalMaterial = new BABYLON.StandardMaterial("decalMat", this.scene);
        this.decalMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/impact.png", this.scene);
        this.decalMaterial.diffuseTexture.hasAlpha = true;
        this.decalMaterial.zOffset = -2;

        //this.menu.createAssets();
    }

    // EventListenerObject interface method
    public handleEvent(evt: Event): void {
        console.log('>>>> onPointerDown');

        // check if we are under a mesh
        //let pickInfo = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) => { return mesh === this.cat; });
        //this.addDecal(pickInfo);

        console.log('<<<< onPointerDown');
    }

    private createSkybox(): void {
        // Sky material
        this.skyboxMaterial = new BABYLON.SkyMaterial("skyMaterial", this.scene);
        this.skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial._cachedDefines.FOG = true;

        // Sky mesh (box)
        this.skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, this.scene);
        this.skybox.material = this.skyboxMaterial;
    }

    private setSkyboxSettings(property, from, to): void {
		let keys = [
            { frame: 0, value: from },
			{ frame: 100, value: to }
        ];
		
		let animation = new BABYLON.Animation("animation", property, 100, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		animation.setKeys(keys);
		
		this.scene.stopAnimation(this.skybox);
		this.scene.beginDirectAnimation(this.skybox, [animation], 0, 100, false, 1);
	};

    private updateSkyboxSettings(): void {
        this.skyboxMode++;
        if (this.skyboxMode > 4) {
            this.skyboxMode = 1;
        }

        let timeout = 0;

        switch (this.skyboxMode) {
            case 1:
                //noon
                this.light.intensity = 2;
                this.setSkyboxSettings("material.inclination", this.skyboxMaterial.inclination, 0); 
                //this.setSkyboxSettings("material.luminance", this.skyboxMaterial.luminance, 1.0); 
                console.log(`luminance=${this.skyboxMaterial.luminance}`);
                timeout = 120000;
                break;

            case 2:
                // afternoon
                this.light.intensity = 0.5;
                this.setSkyboxSettings("material.inclination", this.skyboxMaterial.inclination, -0.3);  // night
                timeout = 20000;
                break;

            case 3:
                // night
                this.light.intensity = 0.2;
                this.setSkyboxSettings("material.inclination", this.skyboxMaterial.inclination, -0.5);  // night
                timeout = 10000;
                break;

            case 4:
                // morning
                this.light.intensity = 0.5;
                this.setSkyboxSettings("material.inclination", this.skyboxMaterial.inclination, -0.4);  // morning
                //this.setSkyboxSettings("material.luminance", this.skyboxMaterial.luminance, 0.1); // morning
                timeout = 20000;
                break;

            //this.setSkyboxSettings("material.luminance", this.skyboxMaterial.luminance, 1.0); 
            //this.setSkyboxSettings("material.turbidity", this.skyboxMaterial.turbidity, 40); 
            //this.setSkyboxSettings("material.turbidity", this.skyboxMaterial.turbidity, 5); 
        }

        setTimeout(() => { this.updateSkyboxSettings(); }, timeout);
    }

    private createTextureFromAtlas(atlas: BABYLON.Texture, name: string, x: number, y: number, w: number, h: number, aw: number, ah: number): BABYLON.Texture {
        let texture = atlas.clone();
        texture.name = name;

        texture.uScale = w / aw;
        texture.vScale = h / ah;

        texture.uOffset = x / aw;
        texture.vOffset = (ah - y - h) / ah;
        //texture.uOffset = ( aw /2 - x)/w - 0.5
	    //texture.vOffset = (-ah/2 + y)/h + 0.5

        return texture;
    }

    private buildTextureAtlas(atlasFile: string, atlasConfigFile: string): void {
        console.log('>>>> buildTextureAtlas');
        console.log(`atlasFile=${atlasFile}`);
        console.log(`atlasConfigFile=${atlasConfigFile}`);

        interface TextureFrame {
            filename: string;
            frame: { x: number; y: number; w: number; h: number };
        }
        interface AtlasConfig {
            frames: TextureFrame[];
            meta: {
                size: {w: number; h: number}
            }
        }

        let request = new XMLHttpRequest();
        request.open('GET', atlasConfigFile, false);  // `false` for synchronous op
        request.send(null);
        if (request.status !== 200) {
            throw new Error('Texture atlas config is not found');
        }

        //console.log(`json=${request.responseText}`);
        let atlasConfig: AtlasConfig = JSON.parse(request.responseText);
        let aw: number = atlasConfig.meta.size.w;
        let ah: number = atlasConfig.meta.size.h;
        console.log(`**** atlas: aw=${aw}, ah=${ah}`);

        let roofAtlas = new BABYLON.Texture(atlasFile, this.scene, false, true);
        roofAtlas.hasAlpha = true;
        for (let textureFrame of atlasConfig.frames) {
            let name = textureFrame.filename;
            let x = textureFrame.frame.x;
            let y = textureFrame.frame.y;
            let w = textureFrame.frame.w;
            let h = textureFrame.frame.h;

            console.log(`**** texture: name=${name}, x=${x}, y=${y}, w=${w}, h=${h}`); 
            let texture = this.createTextureFromAtlas(roofAtlas, name, x, y, w, h, aw, ah);
            this.textureAtlas.setValue(name, texture);
        }

        console.log('<<<< buildTextureAtlas');
    }

    private buildTextureAtlases(): void {
        // roof texture atlas
        this.buildTextureAtlas(
            'assets/scenes/babylonjs/city/RoofTextureAtlas.png',
            'assets/scenes/babylonjs/city/RoofTextureAtlas.json'
            );

        // flat roof texture atlas
        this.buildTextureAtlas(
            'assets/scenes/babylonjs/city/FlatTextureAtlas.png',
            'assets/scenes/babylonjs/city/FlatTextureAtlas.json'
            );

        // facade texture atlas
        this.buildTextureAtlas(
            'assets/scenes/babylonjs/city/FacadeTextureAtlas.png',
            'assets/scenes/babylonjs/city/FacadeTextureAtlas.json'
            );
    }

    private fixDupMaterials(): void {
        //
        //  build the maps for the dup materials
        //
        class MaterialInfo {
            constructor(sm: BABYLON.StandardMaterial) {
                this.main = sm;
                this.dups = new Collections.Dictionary<string, BABYLON.StandardMaterial>();
            }

            main: BABYLON.StandardMaterial;
            dups: Collections.Dictionary<string, BABYLON.StandardMaterial>;
        }

        let textureMap = new Collections.Dictionary<string, MaterialInfo>();

        // material which is in this map is a dup material
        // this map returns the main (non-dup) material 
        // main material is *not* in this map
        let materialMap = new Collections.Dictionary<string, BABYLON.StandardMaterial>();

        let matNo = 1;
        for (let material of this.scene.materials) {
            if (material instanceof BABYLON.StandardMaterial) {
                if (material.diffuseTexture) {
                    let materialName = material.name;
                    let textureName = material.diffuseTexture.name;
                    //console.log(`** material: no=${matNo++}, mat=${materialName}, texture=${textureName}`);

                    if (!textureMap.containsKey(textureName)) {
                        // the first found material becomes the main material
                        let materialInfo = new MaterialInfo(material);
                        //console.log(`>> creating entry for texture=${texture}`);
                        textureMap.setValue(textureName, materialInfo);
                    }
                    else {
                        let materialInfo = textureMap.getValue(textureName);
                        if (!materialInfo.dups.containsKey(materialName)) {
                            //console.log(`>> adding mat=${material}, texture=${texture}`);
                            materialInfo.dups.setValue(materialName, material);
                        }

                        materialMap.setValue(materialName, materialInfo.main);
                    }
                }
            }
        }

        let dupCount = 0;
        textureMap.forEach((texture: string, materialInfo: MaterialInfo) => {
            //console.log(`**** texture=${texture}`);
            //console.log(`    main-mat=${materialInfo.main.name}`);

            materialInfo.dups.forEach((name: string, sm: BABYLON.StandardMaterial) => {
                //console.log(`    dup-mat=${sm.name}, dup-texture=${sm.diffuseTexture.name}`);
                dupCount++;
            });
        });

        console.log(`dupCount=${dupCount}`);

        // iterate unique textures and correponding materials
        let uniqueCount = 0;
        textureMap.forEach((textureName: string, materialInfo: MaterialInfo) => {
            console.log(`**** unique texture=${textureName}, material=${materialInfo.main.name}`);
            let texture = this.textureAtlas.getValue(textureName); // texture from atlas
            if (texture) {
                console.log(`**** replacing texture=${materialInfo.main.diffuseTexture.name} with atlasTexture=${texture.name}`);
                materialInfo.main.diffuseTexture.dispose();
                materialInfo.main.diffuseTexture = texture;
            }
            uniqueCount++;
        });
        console.log(`**** uniqueCount=${uniqueCount}`);

        //
        //  fix mesh's material to point to the main materials
        //
        let replaceCount = 0;
        for (let mesh of this.scene.meshes) {
            if (mesh.material && mesh.material.name) {
                //console.log(`**** mesh: name=${mesh.name}, material=${mesh.material.name}`);
                let materialName = mesh.material.name;
                let mainMaterial = materialMap.getValue(materialName);
                if (mainMaterial) {
                    //console.log(`replacing dup-material: from=${mesh.material.name} to=${mainMaterial.name}`);
                    mesh.material = mainMaterial;
                    replaceCount++;
                }
            }
        }
        console.log(`replaceCount=${replaceCount}`);

        //
        //  dispose dup materials
        //
        let disposeCount = 0;
        textureMap.forEach((texture: string, materialInfo: MaterialInfo) => {
            //console.log(`**** texture=${texture}`);
            //console.log(`    main-mat=${materialInfo.main.name}`);
            materialInfo.dups.forEach((name: string, sm: BABYLON.StandardMaterial) => {
                //console.log(`**** disposing dup-mat=${sm.name}, dup-texture=${sm.diffuseTexture.name}`);
                sm.diffuseTexture.dispose();
                sm.dispose();
                disposeCount++;
            });
        });
        console.log(`**** disposeCount=${disposeCount}`);
    }

    /**
     * 5. Get camera's looking direction according to it's location in 3D
     */
    private vecToLocal(vector: BABYLON.Vector3, cam: BABYLON.Camera): BABYLON.Vector3 {
        var m = cam.getWorldMatrix();
        var v = BABYLON.Vector3.TransformCoordinates(vector, m);
		return v;
    }

    private checkCollisions(): boolean {
        let status = false;
         /**
         * 4. In which direction camera is looking?
         */
        let camera = this.vrHelper.currentVRCamera;
        //let origin = camera.position;
        let origin = this.vrHelper.webVRCamera.devicePosition;

        let forward = new BABYLON.Vector3(0, 0, 1);
        forward = this.vecToLocal(forward, camera);

	    let direction = forward.subtract(origin);
	    direction = BABYLON.Vector3.Normalize(direction);

        let rot = this.vrHelper.webVRCamera.deviceRotationQuaternion.clone();
        let dir = rot.toEulerAngles();
        //let dir = new BABYLON.Vector3(rot.x, rot.y, rot.z);

        /**
         * 6. Create a ray in that direction
         */
	    //let ray = new BABYLON.Ray(origin, direction);
	    //let ray = new BABYLON.Ray(origin, direction);
	    let ray = new BABYLON.Ray(origin, dir);


        /**
         * 7. Get the picked mesh and the distance
         */
        let hit = this.scene.pickWithRay(ray, (mesh: BABYLON.AbstractMesh) => { return true; });
        if (hit.pickedMesh) {
           let dist = hit.pickedMesh.position.subtract(camera.position).length();
           //let dist = BABYLON.Vector3.Distance(origin, hit.pickedMesh.position)
           console.log(`**** hit: mesh=${hit.pickedMesh.name}, dist=${dist}`);
           if (dist <= 20) {
               status = true;
           }
	    }

        return status;
    }

    protected onStart(): void {
        /*
        let black =  BABYLON.Color3.Black();
        let black4 = new BABYLON.Color4(black.r, black.g, black.b);
        this.scene.clearColor = black4;
        */

        if (this.loaderOptions.envDdsFile !== "") {
            let hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("assets/textures/environment.dds", this.scene);
            this.skyBox = this.scene.createDefaultSkybox(hdrTexture, true);
        }
        else if (this.loaderOptions.defaultEnv) {
            // basic scene
            let helper = this.scene.createDefaultEnvironment({
                enableGroundMirror: true,
                groundShadowLevel: 0.6
            });       
            helper.setMainColor(BABYLON.Color3.Teal());
        }

        if (this.loaderOptions.rotate) {
            this.beforeRenderCallback = () => {
                if (this.meshes) {
                    this.meshes[0].rotation.y += 0.005;
                }
            }
        }

        // The first parameter can be used to specify which mesh to import. Here we import all meshes
        //BABYLON.SceneLoader.ImportMesh("", this.path, this.file, this.scene, (newMeshes) => {
        BABYLON.SceneLoader.LoadAssetContainer(this.path, this.file, this.scene, (container: BABYLON.AssetContainer) => {
            console.log(`**** asset container: lights=${container.lights.length}, camera=${container.cameras.length}, geo=${container.geometries.length}
                meshes=${container.meshes.length}, mat=${container.materials.length}, textr=${container.textures.length}, transnodes=${container.transformNodes.length}, shadowgen=${container.shadowGenerators.length},
                particles=${container.particleSystems.length}, morph=${container.morphTargetManagers.length}, animGroup=${container.animationGroups.length}, effectLayers=${container.effectLayers.length},
                lens=${container.lensFlareSystems.length}, action=${container.actionManagers.length}, sounds=${container.sounds.length}, multi-mat=${container.multiMaterials.length}, anim=${container.animations.length}, skelt=${container.skeletons.length}`);
            this.meshes = container.meshes;

            if (this.opt.enableLOD) {
                this.s1 = new BABYLON.SimplificationSettings(0.9, 40, true);
                this.s2 = new BABYLON.SimplificationSettings(0.7, 60, true);
                this.s3 = new BABYLON.SimplificationSettings(0.5, 100, true);
            }

            for (let am of this.meshes) {
                let m = <BABYLON.Mesh>am;

                //let submeshesCount = m.subMeshes ? m.subMeshes.length : 0;
                //let childCount = m.getChildMeshes() ? m.getChildMeshes(true).length : 0;
                //console.log(`mesh: name=${m.name}, submeshes=${submeshesCount}, children=${childCount}`);

                if (this.opt.optimizeMeshes) {
                    m.parent = null;
                }

                if (this.opt.freezeMeshes) {
                    m.alwaysSelectAsActiveMesh = this.opt.freezeMeshes;
                    m.freezeWorldMatrix();
                }

                if (this.opt.enableLOD) {
                    m.simplify([this.s1, this.s2, this.s3], false, BABYLON.SimplificationType.QUADRATIC);
                }

                if (!m.name.startsWith("Facade")) {
                    // add to teleport mesh
                    //BABYLON.Tools.Log(`teleport mesh: name=${m.name}`);
                    this.vrHelper.addFloorMesh(<BABYLON.Mesh>m);
                }

                /* 
                if (this.loaderOptions.scale !== 1) {
                    this.meshes[0].scaling.scaleInPlace(this.loaderOptions.scale);
                }
                */
            }

            container.addAllToScene();

            if (this.opt.freezeMeshes) {
                this.scene.freezeActiveMeshes();
            }
            else {
                this.scene.unfreezeActiveMeshes();
            }

            if (this.opt.optimizeMeshes) {
                // remove the root mesh
                let root = this.scene.getMeshByName("RootNode");
                root.isVisible = false;
                console.log(`root mesh removed: index=${this.scene.removeMesh(root)}`);
                // use oct tree
                this.scene.createOrUpdateSelectionOctree();
            }

            if (this.opt.optClear) {
                this.scene.autoClear = false; // color buffer
                this.scene.autoClearDepthAndStencil = false; // depth and stencil buffer
            }

            if (this.opt.optTexture) {
                //this.buildTextureAtlases();
                this.fixDupMaterials();
            }
        });

        this.createSkybox();
        this.updateSkyboxSettings();

        this.createSound();
        //this.menu.start();

        // for browser interaction using mouse click
        this.canvas.addEventListener("pointerdown", this, false);

        // 
        //  logic for navigation movements based on headset orientation
        //  headset orientation determines the movement of its position
        //
        this.beforeRenderCallback = () => {
            let rot = this.vrHelper.webVRCamera.deviceRotationQuaternion.clone();

            //console.log(`x=${rot.x}, y=${rot.y}, z=${rot.z}`);
            let deltaY = this.speed * Math.sin(rot.x * Math.PI);
            let deltaZ = this.speed * Math.cos(rot.y * Math.PI);
            let deltaX = this.speed * Math.sin(rot.y * Math.PI);
            deltaY = (deltaY < 0) ? deltaY*7 : deltaY;  // make moving up faster than moving down

            this.vrHelper.currentVRCamera.position.y -= deltaY;
            this.vrHelper.currentVRCamera.position.x += deltaX;
            this.vrHelper.currentVRCamera.position.z += deltaZ;

            //this.checkCollisions();
        }


        /* for raycasting
        this.vrHelper.raySelectionPredicate = (mesh: BABYLON.AbstractMesh) => {
            return true;
        };

        this.vrHelper.onNewMeshPicked.add((pickInfo: BABYLON.PickingInfo, eventState: BABYLON.EventState) => {
            if (pickInfo.hit && (pickInfo.distance < 5)) {
                console.log(`**** DANGER!!! mesh: name=${pickInfo.pickedMesh.name}, distance=${pickInfo.distance}`);
                this.collided = true;
            }
            else {
                this.collided = false;
            }
        });
        */

    }

    protected onStop(): void {
        this.deleteSound();

        this.canvas.removeEventListener("pointerdown", this);

        if (this.meshes) {
            for (let mesh of this.meshes) {
                mesh.dispose();
            }
            this.meshes = null;
        }

        for (let decal of this.decals) {
            decal.dispose();
        }
        this.decals.length = 0;

        if (this.skyBox) {
            this.skyBox.dispose();
            this.skyBox = null;
        }
    }
}
