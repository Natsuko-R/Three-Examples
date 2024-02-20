import { WebGLRenderer, Scene, Camera, Vector2, Object3D } from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

const EDGE_STRENGTH : number = 6;
const EDGE_THICKNESS : number = 4;
const EDGE_COLOR : string = '#ff0000';


//-----------------------------------------------------------------------------//
//  アウトラインパスを管理するクラス
//  引数：  Rendererインスタンス, Sceneインスタンス, Cameraインスタンス
//-----------------------------------------------------------------------------//
export default class OutlineEffect{

    private targetRenderer      : WebGLRenderer;
    private targetScene         : Scene;
    private targetCamera        : Camera;
    private targetCanvas        : HTMLCanvasElement;
    private composer            : EffectComposer;
    private renderPass          : RenderPass;
    private outlinePass         : OutlinePass;

    public constructor(targetRenderer : WebGLRenderer, targetScene : Scene, targetCamera : Camera){

        // 引数の格納
        this.targetRenderer = targetRenderer;
        this.targetScene = targetScene;
        this.targetCamera = targetCamera;

        // キャンバス要素の取得
        this.targetCanvas = document.querySelector('#glcanvas') as HTMLCanvasElement;

        // エフェクトコンポーザの作成
        this.composer = new EffectComposer(this.targetRenderer);

        // レンダーパスの作成
        this.renderPass = new RenderPass(this.targetScene, this.targetCamera);
        this.composer.addPass(this.renderPass);

        // アウトラインパスの作成
        this.outlinePass = new OutlinePass(new Vector2(this.targetCanvas.width, this.targetCanvas.height), this.targetScene, this.targetCamera);
        this.outlinePass.edgeStrength = EDGE_STRENGTH;
        this.outlinePass.edgeThickness = EDGE_THICKNESS;
        this.outlinePass.visibleEdgeColor.set(EDGE_COLOR);
        this.outlinePass.hiddenEdgeColor.set(EDGE_COLOR);
        this.composer.addPass(this.outlinePass);

    };

    // 縁取りのレンダリング
    public render(){
        this.composer.render();
    }

    // 対象のオブジェクト配列を縁取り
    public addOutline(objects : Object3D[]){

        // 渡されたObject3D配列をアウトラインパスの対象にする
        this.outlinePass.selectedObjects = objects;

    };

    // 現在のアウトラインパスの対象を削除する
    public removeOutline(){

        this.outlinePass.selectedObjects = [];

    };

    // コンポーザーのゲッター
    public getComposer(){
        return this.composer;
    };
}