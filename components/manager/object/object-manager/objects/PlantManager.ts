import { Scene } from "three";
import ObjectManager, { ModelInfo } from "../ObjectManager";

const MODEL_INFO: ModelInfo[] = [
    { name: "Plant1", path: "/models/StrawberryPlant.glb", scale: 40 },
    { name: "Plant2", path: "/models/TomatoPlant.glb", scale: 40 },
    { name: "Plant3", path: "/models/KikuYellow.glb", scale: 40 },
    { name: "Plant4", path: "/models/KikuWhite.glb", scale: 40 },
    { name: "Plant5", path: "/models/KikuPurple.glb", scale: 40 },
    { name: "Plant6", path: "/models/Shiitake.glb", scale: 40 },
];

export default class PlantManager extends ObjectManager {

    public constructor(scene: Scene) {
        super(scene);
        this.modelInfo = MODEL_INFO;
    }

}