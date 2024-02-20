import { Scene } from "three";
import AnimationObjectManager from "../AnimationObjectManager";

const PATH_MODEL: string = "/models/ExhaustFan.glb"
const SCALE_MODEL: number = 25;

export default class ExhaustFanManager extends AnimationObjectManager {

    public constructor(scene : Scene){
        
        super(scene);
        this.pathModel = PATH_MODEL;
        this.scaleModel = SCALE_MODEL;
    }
    
}