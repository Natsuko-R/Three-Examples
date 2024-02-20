//-----------------------------------------------------------------------------//
// インポート || import
//-----------------------------------------------------------------------------//
import { Camera } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//-----------------------------------------------------------------------------//
// 定数 || constant
//-----------------------------------------------------------------------------//
const CANVAS_NAME : string = "#glcanvas";
const ZOOM_DISTANCE : number = 1000;
const FOCUS_DISTANCE : number = 500;

//-----------------------------------------------------------------------------//
//  カメラ操作を管理するクラス
//-----------------------------------------------------------------------------//
export default class CameraControler{

    //-----------------------------------------------------------------------------//
    // フィールド || field
    //-----------------------------------------------------------------------------//
    private targetCamera    : Camera;
    private targetCanvas    : HTMLCanvasElement;
    private controler       : OrbitControls;

    //-----------------------------------------------------------------------------//
    // コンストラクタ || constructor
    //-----------------------------------------------------------------------------//
    public constructor(camera : Camera){
        
        // 影響するカメラオブジェクトの格納
        this.targetCamera = camera;

        // キャンバスエレメントの取得
        this.targetCanvas = document.querySelector(CANVAS_NAME) as HTMLCanvasElement;
    
        // コントローラーの宣言
        this.controler = new OrbitControls(this.targetCamera, this.targetCanvas);

        // コントローラーの動きの滑らかさ
        this.controler.enableDamping = true;
        this.controler.dampingFactor = 0.1;

        // カメラの回転・ズーム範囲設定
        this.controler.maxDistance = ZOOM_DISTANCE;
        this.controler.maxPolarAngle = 0.475 * Math.PI;

        // カメラの移動制限
        this.controler.addEventListener('change', () => {
      
            // 注視座標の取得
            const focusPosition = this.controler.target;

            // 注視座標のX座標制限
            if(focusPosition.x < -FOCUS_DISTANCE){
                focusPosition.x = -FOCUS_DISTANCE;
            }else if(focusPosition.x > FOCUS_DISTANCE){
                focusPosition.x = FOCUS_DISTANCE;
            }

            // 注視座標のZ座標制限
            if(focusPosition.z < -FOCUS_DISTANCE){
                focusPosition.z = -FOCUS_DISTANCE;
            }else if(focusPosition.z > FOCUS_DISTANCE){
                focusPosition.z = FOCUS_DISTANCE;
            }
        
        });
        
    };

    //-----------------------------------------------------------------------------//
    // メソッド || methods 
    //-----------------------------------------------------------------------------//

    // コントローラーの更新
    public updateControler(){

        this.controler.update();
    };
}