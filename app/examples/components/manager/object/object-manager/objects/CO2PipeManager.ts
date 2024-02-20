import { Scene} from "three";
import ObjectManager from "../ObjectManager";

const PATH_MODEL : string = "/models/Pipe.glb"
const SCALE_MODEL : number = 30;

export default class CO2PipeManager extends ObjectManager {

	public constructor(scene: Scene) {
		
		super(scene);
		this.pathModel = PATH_MODEL;
		this.scaleModel = SCALE_MODEL;
	}

}