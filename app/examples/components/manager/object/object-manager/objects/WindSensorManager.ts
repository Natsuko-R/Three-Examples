import { Scene } from "three";
import ObjectManager from "../ObjectManager";

const PATH_MODEL : string = "/models/WindSensor.glb"
const SCALE_MODEL : number = 40;

export default class WindSensorManager extends ObjectManager{

    public constructor(scene : Scene){
        
        super(scene);
        this.pathModel = PATH_MODEL;
        this.scaleModel = SCALE_MODEL;
    }
    
}