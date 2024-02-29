import { Scene } from "three";
import ObjectManager from "../ObjectManager";

const PATH_MODEL : string = "/models/SolarRadiationSensor.glb"
const SCALE_MODEL : number = 70;

export default class SolarRadiationSensorManager extends ObjectManager{

    public constructor(scene : Scene){
        
        super(scene);
        this.pathModel = PATH_MODEL;
        this.scaleModel = SCALE_MODEL;
    }
    
}