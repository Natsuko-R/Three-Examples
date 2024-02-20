import { Camera, Scene, WebGLRenderer } from "three"

const CANVAS_NAME : string = "#glcanvas";
const CLEAR_COLOR : number = 0x2A2A2A;
const CLEAR_ALPHA : number = 1;

//-----------------------------------------------------------------------------//
//  レンダラーオブジェクトを管理するクラス
//  クラス名　　：  RendererManager
//  引数　　　　：  width: キャンバスの横幅
//　　　　　　　　  height: キャンバスの縦幅
//-----------------------------------------------------------------------------//
export default class RendererManager{

    private renderer: WebGLRenderer;
    private canvasWidth: number;
    private canvasHeight: number;
    private targetScene : Scene;
    private targetCamera : Camera;

    public constructor(width: number, height: number, scene: Scene, camera: Camera){

        // 引数を格納する
        this.canvasWidth = width;
        this.canvasHeight = height;

        this.targetScene = scene;
        this.targetCamera = camera;

        
        // クラスが呼び出された時、レンダラーオブジェクトを作成する
        this.renderer = new WebGLRenderer({
            canvas: document.querySelector(CANVAS_NAME) as HTMLCanvasElement
        });
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        this.renderer.setPixelRatio(1);
        this.renderer.setClearColor(CLEAR_COLOR, CLEAR_ALPHA);

    }; 

    // シーンをレンダリング
    public render(){
        this.renderer.render(this.targetScene, this.targetCamera);
    };

    // 描画をリサイズする
    public resize(width: number, height:number){
        
        // 引数を格納する
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
    };

    // キャッシュサイズを取得
    public getRenderInfo(){
        console.log("geometry : " + this.renderer.info.memory.geometries);
        console.log("texture : " + this.renderer.info.memory.textures);
        console.log("call : " + this.renderer.info.render.calls);
        console.log("triangle : " + this.renderer.info.render.triangles);
    };

    // レンダラーを終了
    public terminate(){
        this.renderer.dispose();
    };

    public getRenderer(){
        return this.renderer;
    };
}
