//-----------------------------------------------------------------------------//
// インポート || import
//-----------------------------------------------------------------------------//
import { PerspectiveCamera, Scene, Vector3 } from "three";

//-----------------------------------------------------------------------------//
// 定数 || constant
//-----------------------------------------------------------------------------//
const FOV           : number = 45;
const NEAR          : number = 10;
const FAR           : number = 2500;
const BASE_POSITION : Vector3 = new Vector3(-1500, 300, -3000)
const BASE_LOOKAT   : Vector3 = new Vector3(0, 0, 0);

//-----------------------------------------------------------------------------//
//  カメラオブジェクトを管理するクラス
//-----------------------------------------------------------------------------//
export default class PerspectiveCameraManager{

    //-----------------------------------------------------------------------------//
    // フィールド || field
    //-----------------------------------------------------------------------------//
    private camera: PerspectiveCamera;
    private canvasWidth: number;
    private canvasHeight: number;
    private fov: number;
    private near: number;
    private far: number;

    //-----------------------------------------------------------------------------//
    // コンストラクタ || constructor
    //-----------------------------------------------------------------------------//
    public constructor(width: number, height: number, scene: Scene){
    
        // 引数を格納する
        this.canvasWidth = width;
        this.canvasHeight = height;

        // 値を設定する
        this.fov = FOV;
        this.near = NEAR;
        this.far = FAR;

        // カメラインスタンスを作成する
        this.camera = new PerspectiveCamera(this.fov, this.canvasWidth / this.canvasHeight, this.near, this.far);

        // カメラ座標・焦点を設定する
        this.setPostition(BASE_POSITION);
        this.setLookAt(BASE_LOOKAT);

        // シーンインスタンスに格納する
        scene.add(this.camera);
    }

    //-----------------------------------------------------------------------------//
    // メソッド || methods 
    //-----------------------------------------------------------------------------//
    
    // 配置座標を設定
    public setPostition(position : Vector3){
        this.camera.position.set(position.x, position.y, position.z);
    }; 

    // 焦点座標をセット
    public setLookAt(position : Vector3){
        this.camera.lookAt(position.x, position.y, position.z);
    }

    // アスペクトをセット
    public setAspect(width : number, height : number){
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    public getCamera(){
        return this.camera;
    }
}