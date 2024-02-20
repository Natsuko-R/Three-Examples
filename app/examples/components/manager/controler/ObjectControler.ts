import { Object3D, Scene, Camera, Raycaster, Vector2, Intersection } from "three";
import OutlineEffect from "../posteffect/OutlineEffect";
import { ObjectControlerProps } from "@/components/common-3d-house/components/popup/interfaces";

const CANVAS_NAME: string = "#glcanvas";

export default class ObjectControler {

    private targetScene: Scene;
    private targetCamera: Camera;
    private targetCanvas: HTMLCanvasElement;
    private outlineEffect: OutlineEffect;

    public constructor(camera: Camera, targetScene: Scene, outlineEffect: OutlineEffect) {

        // ターゲットのシーンの格納
        this.targetScene = targetScene;

        // 影響するカメラオブジェクトの格納
        this.targetCamera = camera;

        // アウトラインエフェクトのインスタンスを取得
        this.outlineEffect = outlineEffect;

        // キャンバスエレメントの取得
        this.targetCanvas = document.querySelector(CANVAS_NAME) as HTMLCanvasElement;

    }

    public checkIntersects({ setIsSelected, setSelectedDevice, sendRequest }: ObjectControlerProps) {

        // レイキャスターの宣言
        const raycaster: Raycaster = new Raycaster();

        // マウス座標（スクリーン座標）の宣言
        const mousePos: Vector2 = new Vector2();

        // マウスのクリックイベントを定義
        this.targetCanvas.addEventListener('click', (event) => {

            // キャンバス要素のクライアントに対する座標を取得
            const rect = this.targetCanvas.getBoundingClientRect();

            // マウスのスクリーン座標を正規化した二次元の座標ベクトルで取得
            mousePos.x = (event.clientX - rect.left) / this.targetCanvas.width * 2.0 - 1.0;
            mousePos.y = -(event.clientY - rect.top) / this.targetCanvas.height * 2.0 + 1.0;

            // レイキャストする
            raycaster.setFromCamera(mousePos, this.targetCamera);

            const intersects: Intersection[] = raycaster.intersectObjects(this.targetScene.children, true).filter(obj =>
                obj.object.parent!.userData.attribute === "CO2Sensor" ||
                obj.object.parent!.userData.attribute === "SolarRadiationSensor" ||
                obj.object.parent!.userData.attribute === "WindSensor" ||
                obj.object.parent!.userData.attribute === "RainSensor" ||
                obj.object.parent!.userData.attribute === "Heater" ||
                obj.object.parent!.userData.attribute === "HeatPump" ||
                obj.object.parent!.userData.attribute === "CircuratorFan" ||
                obj.object.parent!.userData.attribute === "ExhaustFan" ||
                obj.object.parent!.userData.attribute === "Co2GasCylinder"
            );

            // 交差判定処理
            if (intersects.length > 0) {
                // 交差したオブジェクトが一つ以上存在するとき
                const selectedObjects: Object3D[] = [];
                selectedObjects.push(intersects[0].object.parent!);

                // アウトラインの追加
                this.outlineEffect.addOutline(selectedObjects);

                const selectedObjInfo = intersects[0].object.userData;

                setIsSelected(true);
                setSelectedDevice({
                    deviceId: selectedObjInfo.deviceId,
                    attribute: selectedObjInfo.attribute,
                    state: selectedObjInfo.state
                });

                if (["CO2Sensor", "ExhaustFan", "CircuratorFan"].includes(selectedObjInfo.attribute)) {
                    sendRequest({
                        id: selectedObjInfo.deviceId,
                        name: selectedObjInfo.attribute,
                        place_type: selectedObjInfo.place_type,
                    })
                };

            } else {
                // 交差しなかった場合
                this.outlineEffect.removeOutline();
                setIsSelected(false);
            }

        });
    }

    public checkIntersectsFor400({ setIsSelected, setSelectedDevice, sendRequest }: ObjectControlerProps) {

        const raycaster: Raycaster = new Raycaster();
        const mousePos: Vector2 = new Vector2();

        this.targetCanvas.addEventListener('click', (event) => {

            const rect = this.targetCanvas.getBoundingClientRect();

            mousePos.x = (event.clientX - rect.left) / this.targetCanvas.width * 2.0 - 1.0;
            mousePos.y = -(event.clientY - rect.top) / this.targetCanvas.height * 2.0 + 1.0;

            raycaster.setFromCamera(mousePos, this.targetCamera);

            const intersects: Intersection[] = raycaster.intersectObjects(this.targetScene.children, true).filter(obj =>
                obj.object.parent!.userData.attribute === "CO2Sensor"
            );

            // 交差判定処理
            if (intersects.length > 0) {
                // 交差したオブジェクトが一つ以上存在するとき
                const selectedObjects: Object3D[] = [];
                selectedObjects.push(intersects[0].object.parent!);

                // アウトラインの追加
                this.outlineEffect.addOutline(selectedObjects)

                const selectedObjInfo = intersects[0].object.userData;

                setIsSelected(true);
                setSelectedDevice({
                    deviceId: selectedObjInfo.deviceId,
                    attribute: selectedObjInfo.attribute,
                    state: selectedObjInfo.state
                });

                sendRequest({
                    id: selectedObjInfo.deviceId,
                    name: selectedObjInfo.attribute,
                    place_type: selectedObjInfo.place_type,
                })

            } else {
                // 交差しなかった場合
                this.outlineEffect.removeOutline();
                setIsSelected(false);
            }

        });
    }
}