import { Scene } from "three";
import ObjectManager, { ModelInfo } from "../ObjectManager";

const MODEL_INFO: ModelInfo[] = [
    { name: "Heater", path: "/models/Heater.glb", scale: 30 },
    { name: "HeaterGray", path: "/models/HeaterGray.glb", scale: 30 }
];

export default class HeaterManager extends ObjectManager {

    public constructor(scene: Scene) {
        super(scene);
        this.modelInfo = MODEL_INFO;
    }
    
}