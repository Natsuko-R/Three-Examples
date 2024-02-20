import { Scene } from "three";
import ObjectManager from "../ObjectManager";

const PATH_MODEL : string = "/models/CO2Sensor.glb"
const SCALE_MODEL : number = 60;

export default class CO2SensorManager extends ObjectManager{

    public constructor(scene : Scene){
        
        super(scene);
        this.pathModel = PATH_MODEL;
        this.scaleModel = SCALE_MODEL;
    }
    
}