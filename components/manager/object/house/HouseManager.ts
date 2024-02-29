import {
	AnimationMixer,
	AnimationObjectGroup,
	BoxGeometry,
	Clock,
	Group,
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	PlaneGeometry,
	Scene,
	Texture,
	TextureLoader,
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// モデルのスケール
const MODEL_SCALE = 50.0;
const MODEL_SPACING = 50.0;
const ROOF_OFFSETS: Record<number, number> = {
	4: 100,
	5: 125,
	6: 150,
	7: 175,
	9: 225,
	15: 375,
	20: 500,
};
const WARM_MATERIAL = new MeshBasicMaterial({ color: 0xFF9900, transparent: true, opacity: 0.5 });
const SHADE_MATERIAL = new MeshBasicMaterial({ color: 0xFFE599, transparent: true, opacity: 0.5 });

export default class HouseManager {
	public targetScene: Scene;
	public mixers: AnimationMixer[];
	public clock: Clock;
	public groupWinCur: Group;
	public halfLength: number;
	public offset: number;
	public posY: number;

	public constructor(scene: Scene) {
		this.targetScene = scene;
		this.mixers = [];
		this.clock = new Clock();
		this.groupWinCur = new Group();
		this.halfLength = 0;
		this.offset = 0;
		this.posY = 100;
	}

	public async createHouse(roofSize: number, roofType: number, roofNumber: number, houseLength: number, floorType: number, doorPosition: number[]) {
		this.halfLength = houseLength * MODEL_SPACING / 2;
		this.offset = ROOF_OFFSETS[roofSize] || 100;
		this.posY = (roofSize === 15 || roofSize === 20) ? 150 : 100;

		const BasicHouse = new Group();

		try {
			const promises = [
				this.loadGltfModel(`/models/size-${roofSize}/${roofType === 1 ? "circlewall" : "trianglewall"}.glb`),
				this.loadGltfModel(`/models/size-${roofSize}/wall_exit.glb`),
				this.loadGltfModel(`/models/size-${roofSize}/wall_noexit.glb`),
				this.loadGltfModel(`/models/size-${roofSize}/basewall.glb`),
				this.loadGltfModel(`/models/size-${roofSize}/${roofType === 1 ? "basecircleroof" : "baseroof"}.glb`),
				this.loadGltfModel(`/models/size-4/endroof.glb`)
			];
			const [gltf1, gltf2, gltf3, gltf4, gltf5, gltf6] = await Promise.all(promises);
			const baseModels = [gltf1.scene, gltf2.scene, gltf3.scene, gltf4.scene, gltf5.scene, gltf6.scene];
			baseModels.forEach(m => m.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE));

			// PART : WallsWithExit

			const WallsWithExitGroup = new Group();
			WallsWithExitGroup.name = "WallsWithExit";
			for (let i = 0; i < doorPosition.length; i++) {
				if (doorPosition[i]) {
					const exitM = baseModels[1].clone();
					exitM.position.set(i * this.offset * 2 - (roofNumber - 1) * this.offset, 0, - this.halfLength);
					WallsWithExitGroup.add(exitM);
				} else {
					const wallM = baseModels[2].clone();
					wallM.position.set(i * this.offset * 2 - (roofNumber - 1) * this.offset, 0, - this.halfLength);
					WallsWithExitGroup.add(wallM);
				}
			}
			this.targetScene.add(WallsWithExitGroup);

			// PART : BaseWalls

			const BaseWallsGroup = new Group();
			BaseWallsGroup.name = "BaseWalls";
			for (let i = 0; i < houseLength; i++) {
				// 左側
				const leftM = baseModels[3].clone();
				leftM.rotation.y = -0.5 * Math.PI;
				leftM.position.set(-this.offset * roofNumber, 0, - this.halfLength + i * MODEL_SPACING + 25);
				// 右側
				const rightM = baseModels[3].clone();
				rightM.rotation.y = 0.5 * Math.PI;
				rightM.position.set(this.offset * roofNumber, 0, - this.halfLength + i * MODEL_SPACING + 25);
				// グループに登録
				BaseWallsGroup.add(leftM, rightM);
			}
			this.targetScene.add(BaseWallsGroup);

			// PART : WallsNoExit

			baseModels[2].name = "WallsNoExit";
			baseModels[2].position.z = this.halfLength;

			// PART : CircleWalls / Trianglewall

			const front = baseModels[0].clone();
			const back = baseModels[0].clone();
			front.position.set(0, this.posY, this.halfLength);
			back.position.set(0, this.posY, -this.halfLength);
			const group1 = new Group();
			group1.name = "CircleTriangle";
			group1.add(front, back);

			// PART : BaseRoofs

			const group2 = new Group();
			group2.name = "BaseRoofs";
			for (let j = 0; j < roofNumber; j++) {
				const posXoffset = j * this.offset * 2 - (roofNumber - 1) * this.offset;
				const animationGroup = new AnimationObjectGroup();
				const mixer = new AnimationMixer(animationGroup);

				for (let i = 0; i < houseLength; i++) {
					// 左側
					const leftM = baseModels[4].clone();
					leftM.rotation.y = -0.5 * Math.PI;
					leftM.position.x = posXoffset - 50;
					leftM.position.y = this.posY;
					leftM.position.z = - this.halfLength + i * MODEL_SPACING + 50;
					// 右側
					const rightM = baseModels[4].clone();
					rightM.rotation.y = 0.5 * Math.PI;
					rightM.position.x = posXoffset + 50;
					rightM.position.y = this.posY;
					rightM.position.z = - this.halfLength + i * MODEL_SPACING;
					// for triangle size 4 
					if (roofSize == 4 && roofType !== 1) {
						// front
						const endFront = baseModels[5].clone();
						endFront.rotation.y = - 0.5 * Math.PI;
						endFront.position.set(posXoffset - 50, this.posY, -this.halfLength);
						// back
						const endBack = baseModels[5].clone();
						endBack.rotation.y = 0.5 * Math.PI;
						endBack.position.set(posXoffset + 50, this.posY, this.halfLength);
						// add to group 
						group2.add(endFront, endBack);
					}
					group2.add(leftM, rightM);
					animationGroup.add(leftM, rightM);
				}
				// circle-roof doesn't have animations
				if (roofType !== 1) {
					const action = mixer.clipAction(gltf5.animations[roofSize === 4 ? 2 : 1]);
					action.setDuration(5);
					action.play();
					this.mixers.push(mixer);
				}
			}
			this.targetScene.add(group2);
			// 登録用グループに登録
			BasicHouse.add(baseModels[2], group1);

		} catch (error) {
			console.log("ObjectManager: failed on loading ");
			console.error(error);
		};

		const BasicHouseGroup = new Group();
		BasicHouseGroup.name = `Size${roofSize}House`;
		for (let i = 0; i < roofNumber; i++) {
			const house = BasicHouse.clone();
			house.position.set(i * this.offset * 2 - (roofNumber - 1) * this.offset, 0, 0);
			BasicHouseGroup.add(house);
		}
		this.createFloor(floorType, roofNumber);
		this.createLRWindow(roofNumber);
		this.targetScene.add(BasicHouseGroup);
		this.targetScene.add(this.groupWinCur);
	}

	public async createFloor(floorType: number, roofNumber: number) {
		try {
			const pathTexture: string = (floorType == 2) ? "/texture/floor2.png" : "/texture/floor1.png";
			const texture = await this.loadTexture(pathTexture);
			const width = Math.round(2 * this.offset * roofNumber);
			const length = Math.round(2 * this.halfLength);
			// 
			const geometry = new PlaneGeometry(width, length, 1, 1);
			const material = new MeshStandardMaterial({ map: texture });
			const model = new Mesh(geometry, material);
			model.position.set(0, 0.05, 0);
			model.rotation.x = -0.5 * Math.PI;
			// 
			const group = new Group();
			group.name = "HouseFloor";
			group.add(model);
			this.targetScene.add(group);
		} catch (error) {
			console.error("FloorManager: failed on loading ", error);
		}
	}

	public createLRWindow(roofNumber: number) {

		const geometry = new BoxGeometry(1, 1, this.halfLength * 2);
		const material = new MeshBasicMaterial({ color: 0x878787, transparent: true, opacity: 0.4 });

		const left = new Mesh(geometry, material);
		left.name = "leftWindow";
		left.position.setX(this.offset * roofNumber);

		const right = left.clone();
		right.name = "rightWindow";
		right.position.setX(-this.offset * roofNumber);

		// const geometryBack = new BoxGeometry(1, 1, 1);
		// const back = new Mesh(geometryBack, material);
		// back.name = "backWindow";
		// back.position.setZ(this.halfLength);

		this.groupWinCur.add(left, right);
	}

	public setLRWinDegree(degL: number, degR: number) {
		[degL, degR] = [degL, degR].map(d => d / 100 * this.posY);

		for (const child of this.groupWinCur.children) {
			if (child instanceof Mesh) {
				if (degL > 0 && child.name === "leftWindow") {
					child.scale.y = Math.round(degL);
					child.position.setY(this.posY - degL / 2);
				};
				if (degR > 0 && child.name === "rightWindow") {
					child.scale.y = Math.round(degR);
					child.position.setY(this.posY - degR / 2);
				};
				// if (child.name === "backWindow") {};
			}
		}
	}

	public createOneCurtain(roofNumber: number) {

		const geometry = new BoxGeometry(1, 1, this.halfLength * 2);

		// warm curtain
		const warmL = new Mesh(geometry, WARM_MATERIAL);
		warmL.name = "leftWarmC";
		warmL.position.set(this.offset * roofNumber, this.posY + 3, 0);

		const warmR = warmL.clone();
		warmR.name = "rightWarmC";
		warmR.position.set(-this.offset * roofNumber, this.posY + 3, 0);

		// shade curtain
		const shadeL = new Mesh(geometry, SHADE_MATERIAL);
		shadeL.name = "leftShadeC";
		shadeL.position.set(this.offset * roofNumber, this.posY - 2, 0);

		const shadeR = shadeL.clone();
		shadeR.name = "rightShadeC";
		shadeR.position.set(-this.offset * roofNumber, this.posY - 2, 0);

		// add to group
		this.groupWinCur.add(warmL, warmR, shadeL, shadeR);
	}

	public setOneCurtainDegree(warmDeg: number, shadeDeg: number, roofNumber: number) {

		if (warmDeg < 0 || shadeDeg < 0) return;

		const wd = warmDeg / 100 * this.offset * roofNumber;
		const sd = shadeDeg / 100 * this.offset * roofNumber;

		for (const child of this.groupWinCur.children) {
			if (child instanceof Mesh) {
				if (child.name === "leftWarmC") {
					child.scale.x = wd;
					child.position.setX(-this.offset * roofNumber + wd / 2);
				}
				if (child.name === "rightWarmC") {
					child.scale.x = wd;
					child.position.setX(this.offset * roofNumber - wd / 2);
				}
				if (child.name === "leftShadeC") {
					child.scale.x = sd;
					child.position.setX(-this.offset * roofNumber + sd / 2);
				}
				if (child.name === "rightShadeC") {
					child.scale.x = sd;
					child.position.setX(this.offset * roofNumber - sd / 2);
				}
			}
		}
	}

	public createCurtains(roofNumber: number) {

		const geometry = new BoxGeometry(1, 1, this.halfLength * 2);

		for (let i = 0; i < roofNumber; i++) {

			// warm curtain
			const warmL = new Mesh(geometry, WARM_MATERIAL);
			warmL.name = `WarmCurtainL${i + 1}`;
			warmL.position.setY(this.posY + 3);

			const warmR = warmL.clone();
			warmR.name = `WarmCurtainR${i + 1}`;

			// shade curtain
			const shadeL = new Mesh(geometry, SHADE_MATERIAL);
			shadeL.name = `ShadeCurtainL${i + 1}`;
			shadeL.position.setY(this.posY - 2);

			const shadeR = shadeL.clone();
			shadeR.name = `ShadeCurtainR${i + 1}`;

			// add to group
			this.groupWinCur.add(warmL, shadeL, warmR, shadeR);

		}
	}

	public setCurtainsDegree(arrW: number[], arrS: number[], roofNumber: number) {

		// warm

		const warmDegs = arrW.reverse().map(c => c / 100 * this.offset);
		const WarmLeft = this.groupWinCur.children.filter(c => c.name.startsWith("WarmCurtainL"));
		const WarmRight = this.groupWinCur.children.filter(c => c.name.startsWith("WarmCurtainR"));

		WarmLeft?.forEach((child, i) => {
			if (child.name.endsWith(`${i + 1}`)) {
				child.scale.x = Math.round(warmDegs[i]);
			};
			child.position.setX((i + 1) * 2 * this.offset - roofNumber * this.offset - warmDegs[i] / 2);
		})

		WarmRight?.forEach((child, i) => {
			if (child.name.endsWith(`${i + 1}`)) {
				child.scale.x = Math.round(warmDegs[i]);
			}
			child.position.setX(i * 2 * this.offset - roofNumber * this.offset + warmDegs[i] / 2);
		})

		// shade

		const shadeDegs = arrS.reverse().map(c => c / 100 * this.offset);
		const ShadeLeft = this.groupWinCur.children.filter(c => c.name.startsWith("ShadeCurtainL"));
		const ShadeRight = this.groupWinCur.children.filter(c => c.name.startsWith("ShadeCurtainR"));

		ShadeLeft?.forEach((child, i) => {
			if (child.name.endsWith(`${i + 1}`)) {
				child.scale.x = Math.round(shadeDegs[i]);
			};
			child.position.setX((i + 1) * 2 * this.offset - roofNumber * this.offset - shadeDegs[i] / 2);
		})

		ShadeRight?.forEach((child, i) => {
			if (child.name.endsWith(`${i + 1}`)) {
				child.scale.x = Math.round(shadeDegs[i]);
			}
			child.position.setX(i * 2 * this.offset - roofNumber * this.offset + shadeDegs[i] / 2);
		})
	}

	public setRoofDegree(array: number[]) {

		const times = [...array].reverse().map(deg => 4.99 * (deg * 0.01));
		times?.forEach((time, index) => {
			this.mixers[index] && this.mixers[index].setTime(time)
		});

	}

	private loadTexture(path: string): Promise<Texture> {
		return new Promise((resolve, reject) => {
			const loader = new TextureLoader();
			loader.load(
				path,
				(texture) => {
					resolve(texture);
				},
				undefined,
				(error) => {
					reject(error);
				}
			);
		});
	}

	private loadGltfModel(path: string): Promise<GLTF> {
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
