import { Scene } from "three";
import ObjectManager from "../ObjectManager";

const PATH_MODEL : string = "/models/RainSensor.glb"
const SCALE_MODEL : number = 20;

export default class RainSensorManager extends ObjectManager{

    public constructor(scene : Scene){
        
        super(scene);
        this.pathModel = PATH_MODEL;
        this.scaleModel = SCALE_MODEL;
    }
    
}