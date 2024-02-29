import { Device, DeviceWithSize } from "@/actions/get-3d-data";
import { Scene, Object3D, Group } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface ModelInfo {
	name: string;
	path: string;
	scale: number;
};

export default class ObjectManager {

	protected targetScene: Scene;
	protected children: Array<Object3D>;
	protected baseModel: Object3D;
	protected loader: GLTFLoader;
	protected pathModel: string;
	protected scaleModel: number;
	protected modelInfo: ModelInfo[];

	public constructor(scene: Scene) {
		this.targetScene = scene;
		this.children = [];
		this.pathModel = "";
		this.scaleModel = 1;
		this.modelInfo = [];
		this.loader = new GLTFLoader();
		this.baseModel = new Object3D();
	}

	//  array : the same type of device
	public async addDevices(array: Device[] | DeviceWithSize[]) {

		if (!array || array.length === 0) return;

		try {
			const gltf = await this.loadGltfModel(this.pathModel);
			this.baseModel = gltf.scene;

			const group = new Group();
			group.name = array[0].attribute;

			for (let i = 0; i < array.length; i++) {

				// 
				const { deviceId, attribute, place_type, loc_id, type_id, posX, posY, posZ, rotY, state } = array[i];
				let size: number = 1;
				let uuid: string = "";
				if ('size' in array[i] && 'uuid' in array[i]) {
					size = (array[i] as DeviceWithSize).size;
					uuid = (array[i] as DeviceWithSize).uuid;
				};

				// 
				const model: Object3D = this.baseModel.clone();
				model.name = attribute;
				const objectData = this.newUserData(model, deviceId, attribute, place_type, loc_id, type_id, posX, posY, posZ, rotY, state, size, uuid);
				model.traverse(m => m.userData = objectData);
				model.scale.set(this.scaleModel, this.scaleModel, this.scaleModel * size);
				model.position.set(posX, posY, posZ);
				model.rotation.y = rotY * (Math.PI / 180);

				this.children.push(model);
				group.add(model);
			}

			this.targetScene.add(group);

		} catch (error) {
			console.log("ObjectManager: failed on loading " + this.pathModel);
			console.error(error);
		}
	};

	//  array : different types of device
	public async addMultiDevices(array: Device[]) {
		if (!array || array.length === 0) return;

		const group = new Group();
		group.name = array[0].attribute;

		for (let i = 0; i < array.length; i++) {
			const { deviceId, attribute, place_type, loc_id, type_id, posX, posY, posZ, rotY, state } = array[i];
			const m: ModelInfo | undefined = this.modelInfo.find(m => m.name === attribute); // .find() might not find a matching model, resulting undefined.

			if (m) {
				try {
					const gltf = await this.loadGltfModel(m.path);
					const model: Object3D = gltf.scene;
					model.name = attribute;
					const objectData = this.newUserData(model, deviceId, attribute, place_type, loc_id, type_id, posX, posY, posZ, rotY, state);
					model.traverse(m => m.userData = objectData);
					model.scale.set(m.scale, m.scale, m.scale);
					model.position.set(posX, posY, posZ);
					model.rotation.y = rotY * (Math.PI / 180);

					this.children.push(model);
					group.add(model);
				} catch (error) {
					console.log("ObjectManager: failed on loading " + m.path);
					console.error(error);
				};
			};
		}

		this.targetScene.add(group);

	};

	public getChildByDeviceId(id: number) {

		for (let i = 0; i < this.children.length; i++) {
			if (this.children[i].userData.deviceId === id) {
				return this.children[i];
			}
		}

	};

	protected newUserData(model: Object3D, deviceId: number, attribute: string, place_type: number, loc_id: number, type_id: number, posX: number, posY: number, posZ: number, rotY: number, state: number, size?: number, uuid?: string) {
		return {
			parentObject: model,
			deviceId: deviceId,
			attribute: attribute,
			place_type: place_type,
			loc_id: loc_id,
			type_id: type_id,
			posX: posX,
			posY: posY,
			posZ: posZ,
			rotY: rotY,
			state: state,
			size: size,
			uuid: uuid,
		};
	};

	protected loadGltfModel(path: string): Promise<GLTF> {
		return new Promise((resolve, reject) => {
			const loader = new GLTFLoader();
			loader.load(
				path,
				(gltf) => {
					resolve(gltf);
				},
				undefined,
				(error) => {
					reject(error);
				}
			);
		});
	}

}
