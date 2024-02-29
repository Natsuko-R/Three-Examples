import { Scene } from "three";
import AnimationObjectManager from "../AnimationObjectManager";

const PATH_MODEL: string = "/models/CircuratorFan.glb"
const SCALE_MODEL: number = 30;

export default class CircuratorFanManager extends AnimationObjectManager {

    public constructor(scene: Scene) {

        super(scene);
        this.pathModel = PATH_MODEL;
        this.scaleModel = SCALE_MODEL;
    }

}