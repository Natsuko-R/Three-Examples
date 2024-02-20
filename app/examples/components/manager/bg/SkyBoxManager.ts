import { Scene, WebGLRenderer, TextureLoader, WebGLCubeRenderTarget, Texture } from "three";

const PATH_TEXTURE: string = '/images/sky_01.jpg';
//-----------------------------------------------------------------------------//
//  空の背景を管理するクラス
//-----------------------------------------------------------------------------//
export default class SkyBoxManager {

    private targetScene: Scene;
    private targetRenderer: WebGLRenderer;
    private textureLoader: TextureLoader;
    private texture: Texture;
    private renderTarget: WebGLCubeRenderTarget;

    public constructor(scene: Scene, renderer: WebGLRenderer) {

        this.targetScene = scene;
        this.targetRenderer = renderer;
        this.textureLoader = new TextureLoader();
        this.renderTarget = new WebGLCubeRenderTarget();
        this.texture = new Texture();

        this.addSkyBox();
    }

    // スカイボックスを作成
    public addSkyBox() {

        this.textureLoader.load(PATH_TEXTURE, (texture) => {
            this.texture = texture;
            this.renderTarget = new WebGLCubeRenderTarget(texture.image.height);
            this.renderTarget.fromEquirectangularTexture(this.targetRenderer, texture);
            this.targetScene.background = this.renderTarget.texture;
            // console.log("SkyBoxManager : succeeded on loading " + PATH_TEXTURE);
        }, undefined, () => {
            console.error("SkyBoxManager : failed on loading " + PATH_TEXTURE);
        });

    };

    public terminate() {
        this.texture.dispose();
    }
};