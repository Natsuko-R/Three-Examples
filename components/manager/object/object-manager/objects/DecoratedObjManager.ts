import { Scene } from "three";
import ObjectManager, { ModelInfo } from "../ObjectManager";

const MODEL_INFO: ModelInfo[] = [
    { name: "HeatPump", path: "/models/HeatPump.glb", scale: 30 },
    { name: "WaterTank", path: "/models/WaterTank.glb", scale: 30 },
    { name: "WaterTankBlack", path: "/models/WaterTankBlack.glb", scale: 40 },
    { name: "Co2GasCylinder", path: "/models/GasCylinder.glb", scale: 40 },
    { name: "ControlPanel", path: "/models/ControlPanel.glb", scale: 35 },
    { name: "Compressor", path: "/models/Compressor.glb", scale: 50 },
    { name: "SignBoard", path: "/models/SignBoard.glb", scale: 30 },
    { name: "AirCylinder", path: "/models/AirCylinder.glb", scale: 40 },
    { name: "Camera", path: "/models/Camera.glb", scale: 40 }
];

// OBJs : typeID = 0
export default class DecoratedObjManager extends ObjectManager {

    public constructor(scene: Scene) {
        super(scene);
        this.modelInfo = MODEL_INFO;
    }

}