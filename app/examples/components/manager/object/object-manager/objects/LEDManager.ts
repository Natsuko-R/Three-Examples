import { Mesh, MeshStandardMaterial, Scene } from "three";
import ObjectManager from "../ObjectManager";

const PATH_MODEL: string = "/models/Led.glb";
const SCALE_MODEL: number = 50;

export default class LEDManager extends ObjectManager {

	public colorMaterial: MeshStandardMaterial

	public constructor(scene: Scene) {
		super(scene);

		this.pathModel = PATH_MODEL;
		this.scaleModel = SCALE_MODEL;

		// 稼働時用マテリアル
		this.colorMaterial = new MeshStandardMaterial({
			color: 0xff0000, // ベースカラー
			emissive: 0xff0080, // 発光色
			emissiveIntensity: 10, // 発光強度
			roughness: 0, // 表面のざらつき
			metalness: 1 // 金属度合い
		});
	}

	public toggleLedColor(ledStates: any[]) {
		if (!this.children || this.children.length === 0) return;

		this.children.forEach(c => {
			c.traverse(led => {
				ledStates.forEach(stateItem => {
					if (
						led.userData.attribute == stateItem.type &&
						led.userData.deviceId == stateItem.device_id &&
						stateItem.state == 1
					) {
						led.traverse(child => { if (child instanceof Mesh) { child.material = this.colorMaterial; } })
					}
				});
			});
		});
	}

}
