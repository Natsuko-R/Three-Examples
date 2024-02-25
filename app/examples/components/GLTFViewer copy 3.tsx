"use client"

import { useEffect, useRef, useState } from "react"
import { EquirectangularReflectionMapping, AmbientLight, DirectionalLight, Object3D, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer, Box3, Vector3, BoxGeometry, Mesh, MeshLambertMaterial, Box3Helper, Color } from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import ResourceTracker from "./manager/tracker/ResourceTrackerManager";

const HDR_PATH_TEXTURE: string = '/images/pedestrian_overpass_1k.hdr';
const INITIAL_MODEL: string = 'models/gltf/Nefertiti.glb';
const modelFileList = {
  '1': 'models/gltf/Flamingo.glb',
  '2': 'models/gltf/AnisotropyBarnLamp.glb',
  '3': 'models/gltf/Horse.glb',
  '4': 'models/gltf/Nefertiti.glb',
  '5': 'models/gltf/Stork.glb',
  '6': 'models/gltf/SheenChair.glb',
};
const scaleController = {
  scale: 1.0
};

export const GLTFViewer = () => {
  const [isMount, setIsMount] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<Scene>();
  const rendererRef = useRef<WebGLRenderer>();
  const loader = new GLTFLoader();
  const resMgr = new ResourceTracker();
  const track = resMgr.track.bind(resMgr);

  let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;
  let controls: OrbitControls, stats: Stats, gui: GUI;
  let model: Object3D;
  let requestId: number;

  const initWorld = async () => {

    // シーン

    scene = new Scene();

    // ライト

    const dirLight = new DirectionalLight(0xffffff, 3);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);
    scene.add(new AmbientLight(0xffffff, 3));

    // カメラ

    camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(- 50, 30, 100);

    // レンダラー

    renderer = new WebGLRenderer({
      canvas: document.querySelector("#glcanvas") as HTMLCanvasElement,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // カメラコントローラ

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // HDR

    new RGBELoader().load(HDR_PATH_TEXTURE, function (texture) {
      texture.mapping = EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    });

    // dat.gui.

    gui = new GUI();
    gui.add(camera, "fov")
      .min(10)
      .max(100)
      .step(1)
      .onChange(() => camera.updateProjectionMatrix())
      .name("カメラ調整")
    gui.add(scaleController, "scale", 0.1, 5)
      .step(0.1)
      .name("Scale")
      .onChange(() => {
        model.scale.set(scaleController.scale, scaleController.scale, scaleController.scale);
      });

    // stats

    stats = new Stats();
    document.querySelector("#container")?.appendChild(stats.dom);

    // init refs

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // init initial model

    const gltf = await loadGLTF(INITIAL_MODEL);
    model = track(gltf.scene);
    model.name = "InitialModel";
    scene.add(model);
  }

  const animate = () => {
    renderer.render(scene, camera);
    controls.update();

    // scene.children.forEach(item => {
    //   if (item.name === "NewModel" || item.name === "InitialModel") {
    //     item.rotation.y += 0.01;
    //   }
    // });

    requestId = requestAnimationFrame(animate);
  }

  // リサイズ処理
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  const frameArea = (sizeToFitOnScreen: any, boxSize: any, boxCenter: any, camera: any) => {

    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = camera.fov * .5 * Math.PI / 180;
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new Vector3(1, 0, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y + 200, boxCenter.z);

  }

  const clearOldModel = () => {
    if (!sceneRef.current || !rendererRef.current) return;

    resMgr.dispose();

    const scene = sceneRef.current;
    const groups = scene.children.filter(item =>
      item.parent && (item.name === "NewModel" || item.name === "InitialModel")
    );
    groups.forEach((g) => g.parent?.remove(g));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    clearOldModel();

    const gltf = await loadGLTF(URL.createObjectURL(file));
    model = track(gltf.scene);
    model.name = "NewModel";
    scene.add(model);

    const box = new Box3().setFromObject(model);
    const boxSize = box.getSize(new Vector3()).length();
    const boxCenter = box.getCenter(new Vector3());
    frameArea(boxSize * 1.1, boxSize, boxCenter, camera);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    clearOldModel();

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target?.result as string;

      const gltf = await loadGLTF(data);
      model = track(gltf.scene);
      model.name = "NewModel";
      scene.add(model);

      const box = new Box3().setFromObject(model);
      const boxSize = box.getSize(new Vector3()).length();
      const boxCenter = box.getCenter(new Vector3());
      frameArea(boxSize * 1.1, boxSize, boxCenter, camera);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const loadGLTF = (url: string): Promise<GLTF> => {

    return new Promise((resolve, reject) => {

      loader.load(url, resolve, undefined, reject);

    });

  }

  useEffect(() => {
    if (isMount) {
      initWorld();
      animate();
      window.addEventListener("resize", onWindowResize)
    };
    setIsMount(true);
    return () => {
      cancelAnimationFrame(requestId)
      window.removeEventListener("resize", onWindowResize)
      gui?.destroy();
      sceneRef.current?.remove();
      rendererRef.current?.dispose();
    }
  }, [isMount]);

  if (!isMount) return null;

  return (
    <div
      id="container"
      className="relative flex justify-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="absolute bottom-[2rem] z-50 bg-slate-800 px-8 py-6 flex flex-col gap-4 items-center ">
        <p className="text-white">プレビューしたいGLTFモデルを、</p>
        <p className="text-white">ここにドラッグ＆ドロップ</p>
        <input
          type="file"
          accept=".gltf,.glb"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded">
          またはファイルを選択
        </button>
      </div>
      <canvas id="glcanvas" className="relative" ref={canvasRef} />
    </div>
  )
}
