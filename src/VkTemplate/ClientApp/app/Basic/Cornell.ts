import 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'
import 'babylonjs-materials'
import 'babylonjs-post-process'
import 'babylonjs-procedural-textures'
import 'cannon';
import 'oimo';
import { Common } from '../Common'
import { VkScene, FirstScene } from '../Vk'
import { VkMenu } from '../VkMenu'

export class CornellScene extends FirstScene {
    private menu: VkMenu = new VkMenu(this);
    private probe: BABYLON.ReflectionProbe;
    private sphereProbeMat: BABYLON.PBRMaterial;
    private shadowGenerator: BABYLON.ShadowGenerator = null;
    private BJSlogo: BABYLON.AbstractMesh = null;
    private BJSmatRed: BABYLON.PBRMaterial = null; 
    private meshes: BABYLON.AbstractMesh[] = null;
    private t: number;

    /*
    * Public members
    */
    constructor(
        position: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 5),
        target: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0)
    ){
        super({
            cameraInitialPosition: position,
            cameraInitialTarget: target
        });
    }

    protected onMenuButton(controller: BABYLON.WebVRController, pressed: boolean) {
        this.menu.handleMenuButton(controller, pressed);
    }

    protected createAssets(): void {
        let hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("assets/gltf/cornellBox/neutral_env_EnvHDR.dds", this.scene);
        hdrTexture.name = "envTex";
        hdrTexture.gammaSpace = false;
        //       createDefaultSkybox(environmentTexture, pbr, scale, blur)
        this.scene.createDefaultSkybox(hdrTexture, true, 1000, 0);

        /*
        let universalCamera = new BABYLON.UniversalCamera("universalCamera", new BABYLON.Vector3(0,1,0), this.scene);
        universalCamera.speed = 0.1;
        universalCamera.fov = 1.2;
        universalCamera.minZ = 0.01;
        universalCamera.position = new BABYLON.Vector3(0, 1.5, 4);
        universalCamera.rotation = new BABYLON.Vector3(0, -3.15, 0);
        this.scene.activeCamera = universalCamera;
        this.scene.activeCamera.attachControl(canvas);
        */

        let cornellBox = null;

        let gltfLoader = BABYLON.SceneLoader.ImportMesh(
            "",
            "assets/gltf/cornellBox/",
            "cornellBox-PBR.gltf",
            this.scene,
            (meshes: BABYLON.AbstractMesh[]) => {
                this.meshes = meshes;
                // ligthmap assignation
                let mtl = null;
                let myLMurl = "";
                let myLM = null;
                let myLMobjects = [
                    "cornellBox.000",
                    "bloc.000",
                    "suzanne.000"
                ];

                for (let i = 0; i < myLMobjects.length; i++){
                    // we create the lightmap using the mesh name pattern
                    myLMurl = "assets/gltf/cornellBox/LM/" + myLMobjects[i] + ".LM.png";
                    myLM = new BABYLON.Texture(myLMurl, this.scene);
                    myLM.name = myLMobjects[i] + ".LM";
                    myLM.coordinatesIndex = 1;
                    myLM.level = 1;
                    myLM.vScale = -1; // <- why needed?
                    let object = this.scene.getMeshByName(myLMobjects[i]);
                    if (!object || !object.material && !object.getChildren()) {
                        continue;
                    };
                    if (!object.material && object.getChildren()){
                        for (let c=0; c < object.getChildren().length; c++){
                            let am: BABYLON.AbstractMesh = <BABYLON.AbstractMesh>object.getChildren()[c];
                            mtl = am.material;
                            let mode = 1;
                            switch(mode){
                                case 1:
                                    // lightmap as shadow
                                    mtl.lightmapTexture = myLM;
                                    mtl.useLightmapAsShadowmap = true;
                                    break;
                                case 2:
                                    // lightmap
                                    mtl.lightmapTexture = myLM;
                                    mtl.useLightmapAsShadowmap = false;
                                    break;
                                case 3:
                                    // ambient
                                    mtl.ambientTexture = myLM;
                                    break;
                                default:
                                    break;
                            }
                        }
                    };
                };

                // the mesh fake-light on the ceiling
                let lightMtl: BABYLON.PBRMaterial = <BABYLON.PBRMaterial>this.scene.getMaterialByName("light.000");

                let white =  BABYLON.Color3.White();
                let white4 = new BABYLON.Color4(white.r, white.g, white.b);
                lightMtl.emissiveColor = white;

                // some things on the logo mesh
                this.BJSlogo = this.scene.getMeshByName("BJSlogo.000");
                this.BJSlogo.position.y = 1.5;
                let mat: BABYLON.PBRMaterial = <BABYLON.PBRMaterial>this.scene.getMaterialByName("BJS-3D-logo_white.01.000");
                mat.emissiveColor = white;
                this.BJSmatRed = <BABYLON.PBRMaterial>this.scene.getMaterialByName("BJS-3D-logo_red.01.000");

                for (let n of this.BJSlogo.getChildren()) {
                    let mesh = <BABYLON.AbstractMesh>n;
                    let mat = <BABYLON.PBRMaterial>mesh.material;
                    mat.metallic = 0.1;
                    mat.roughness = 0;
                };
                this.BJSmatRed.metallic = 1;

                // prepare the room to receive shadows
                cornellBox = this.scene.getMeshByName("cornellBox.000");
                for(let m=0; m < cornellBox._children.length; m++){
                    cornellBox._children[m].receiveShadows = true;
                }
                cornellBox.receiveShadows = true;

                // set to true to play with a probe
                let activateReflProbes = false;                
                if (activateReflProbes){
                    let sphereProbe = BABYLON.Mesh.CreateSphere("sphereProbe", 32, .25, this.scene);
                    this.sphereProbeMat = new BABYLON.PBRMaterial("sphereProbeMat", this.scene);
                    this.sphereProbeMat.roughness = 0;
                    this.sphereProbeMat.metallic = 1;
                    sphereProbe.position = new BABYLON.Vector3(0, 1.5, 0);
                    sphereProbe.material = this.sphereProbeMat;
                    
                    this.probe = new BABYLON.ReflectionProbe("reflectionProbe", 128, this.scene, true);
                    this.probe.attachToMesh(sphereProbe);
                    for (let m = 0; m < this.scene.meshes.length; m++){
                        this.probe.renderList.push( this.scene.meshes[m] );
                    }
                    setTimeout(() => { this.waitToPauseProbe(); }, 2000); // just to be sure all meshes are loaded
                };

                this.shadowGenerator.addShadowCaster(this.BJSlogo);

                this.beforeRenderCallback = () => {
                    //if (this.shadowGenerator && this.BJSlogo && this.BJSmatRed) {
                        // some animations on the logo
                        this.t += 0.1;
                        this.BJSlogo.rotation.x += .03;
                        this.BJSlogo.rotation.y -= .03;
                        this.BJSlogo.rotation.z -= .03;
                        this.BJSmatRed.emissiveColor = new BABYLON.Color3((Math.cos(this.t) * 0.5) + 0.5, 0, 0);
                    //}
                };
            }
        );


        // why not using glow?
        let gl = new BABYLON.GlowLayer("glow", this.scene, {
            mainTextureFixedSize: 256,
            blurKernelSize: 32
        });

        ///
        this.menu.createAssets();
    }

    waitToPauseProbe(): void {
        this.probe.refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        this.sphereProbeMat.reflectionTexture = this.probe.cubeTexture;
        let groundMat: BABYLON.PBRMaterial = <BABYLON.PBRMaterial>this.scene.getMaterialByName("cornellBox.ground.000");
        let texture = this.probe.cubeTexture;
        groundMat.reflectionTexture = texture;
        groundMat.metallic = .1;
        groundMat.roughness = 0;
        texture.coordinatesMode = BABYLON.Texture.INVCUBIC_MODE;
        texture.boundingBoxSize = new BABYLON.Vector3(4, 3, 4);
        groundMat.ambientColor = BABYLON.Color3.White();
    };

    protected onStart(): void {
        let white =  BABYLON.Color3.White();
        let white4 = new BABYLON.Color4(white.r, white.g, white.b);
        this.scene.clearColor = white4;
        this.scene.ambientColor = white;

        // dyn light to geneate shadows 
        let dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 0), this.scene);
        dirLight.position = new BABYLON.Vector3(0, 3, 0);
        this.shadowGenerator = new BABYLON.ShadowGenerator(64, dirLight);
        this.t = 0; //this will be used as a time variable


        //
        this.menu.start();
    }

    protected onStop(): void {
        if (this.meshes) {
            for (let mesh of this.meshes) {
                mesh.dispose();
            }
            this.meshes = null;
        }
    }
}
