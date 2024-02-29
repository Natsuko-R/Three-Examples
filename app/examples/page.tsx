import { AnimationSkinningMorph } from "./components/webgl_animation_skinning_morph";
import { ExporterDRACO } from "./components/misc_exporter_draco";
import { AmmoRope } from "./components/ammo_rope";
import { DragControlCanvas } from "./components/misc_controls_drag";
import { CameraArray } from "./components/webgl_camera_array";
import { GLTFClient } from "./components/GLTFClient";
import { GLTFViewer } from "./components/GLTFViewer";

const HousePage = () => {
	return (
		// <>
		// 	<div className="w-full h-full flex">
		// 		<GLTFClient />
		// 		<div className="w-[20rem] h-screen bg-slate-600">BBBBBBBBBBBB</div>
		// 	</div>
		// </>
		<GLTFViewer />
	)
};

export default HousePage;
