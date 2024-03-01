"use client"

import { useEffect, useRef, useState } from "react"
import { EquirectangularReflectionMapping, AmbientLight, DirectionalLight, Object3D, PerspectiveCamera, Scene, WebGLRenderer, Box3, Vector3 } from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import ResourceTracker from "./manager/tracker/ResourceTrackerManager";

type GuiData = {
  modelFileUrl: string;
  scale: number;
  rotateY: boolean;
};

const HDR_PATH_TEXTURE: string = '/images/pedestrian_overpass_1k.hdr';

const MODEL_LIST: Record<string, string> = {
  'SheenChair': 'models/SheenChair.glb',
  'AnisotropyBarnLamp': 'models/AnisotropyBarnLamp.glb',
  'Nefertiti': 'models/Nefertiti.glb',
  'RobotExpressive': 'models/RobotExpressive.glb',
  'Flamingo': 'models/Flamingo.glb',
  'Horse': 'models/Horse.glb',
  'Stork': 'models/Stork.glb',
  'Parrot': 'models/Parrot.glb',
};

export const GLTFViewer = () => {
  const [isMount, setIsMount] = useState(false); // マウント状態の管理
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene>();
  const rendererRef = useRef<WebGLRenderer>();
  const loader = new GLTFLoader();
  const resMgr = new ResourceTracker(); // 資源管理や回収
  const track = resMgr.track.bind(resMgr);

  let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;
  let controls: OrbitControls, stats: Stats, gui: GUI;
  let model: Object3D;
  let requestId: number;

  // GUIデータの初期値
  const guiData: GuiData = {
    modelFileUrl: MODEL_LIST['SheenChair'],
    scale: 1.0,
    rotateY: false
  };

  // 初期化処理
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

    // HDRの読み込み

    new RGBELoader().load(HDR_PATH_TEXTURE, function (texture) {
      texture.mapping = EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    });

    // Stats

    stats = new Stats();
    document.querySelector("#container")?.appendChild(stats.dom);

    // refsの初期化

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // 初期モデルの読み込み

    reloadObject();

  }

  // モデルを読み込む
  const reloadObject = async () => {

    model && scene.remove(model);

    // GLTFの読み込み
    const gltf = await loadGLTF(guiData.modelFileUrl);
    model = track(gltf.scene);

    // モデルを画面の中心に設定
    const box = new Box3().setFromObject(model);
    const boxSize = box.getSize(new Vector3()).length();
    const boxCenter = box.getCenter(new Vector3());
    frameArea(boxSize * 1.1, boxSize, boxCenter, camera);

    // モデルの特殊処理
    if (guiData.modelFileUrl === MODEL_LIST['SheenChair']) {
      model.position.set(0, -0.2, 0);
    }
    if (guiData.modelFileUrl === MODEL_LIST['Nefertiti']) {
      model.scale.set(0.8, 0.8, 0.8);
      model.position.set(0, -9, 0);
    }
    if (guiData.modelFileUrl === MODEL_LIST['AnisotropyBarnLamp']) {
      model.position.set(0, 0.1, 0);
    }

    scene.add(model);

    createGUI();
  }

  //　GUI作成
  const createGUI = () => {
    gui && gui.destroy();

    gui = new GUI();

    // guiのDOM要素はが非同期に作成されるため、タイマーを設定してselect要素を取得
    setTimeout(() => {
      const selectElement = gui.domElement.querySelector('select');
      if (selectElement) {
        selectElement.style.backgroundColor = '#fff';
        selectElement.style.color = '#000';
      }
    }, 100);

    gui.add(guiData, 'modelFileUrl', MODEL_LIST)
      .name('モデル選択')
      .onFinishChange(() => reloadObject());
    gui.add(camera, "fov")
      .name("カメラ調整")
      .min(10)
      .max(100)
      .step(1)
      .onChange(() => camera.updateProjectionMatrix())
    gui.add(guiData, "scale", 0.1, 5)
      .name("スケール調整")
      .step(0.1)
      .onChange(() => {
        model.scale.set(guiData.scale, guiData.scale, guiData.scale);
      });
    gui.add(guiData, 'rotateY')
      .name('回転Y軸')
  }

  //　動画
  const animate = () => {
    renderer.render(scene, camera);
    controls.update();
    if (model && guiData.rotateY) {
      model.rotation.y += 0.01;
    };
    requestId = requestAnimationFrame(animate);
  }

  // リサイズ処理
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // 画面の中心にモデルを配置する
  const frameArea = (sizeToFitOnScreen: number, boxSize: number, boxCenter: Vector3, camera: PerspectiveCamera) => {

    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = camera.fov * .5 * Math.PI / 180;
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    // カメラが現在どの方向を向いているかを示す単位ベクトルを計算する
    // ボックスの中心からカメラの位置を引いて、xz平面における方向を示す
    const direction = (new Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new Vector3(1, 0, 1))
      .normalize();

    // カメラを中心からの距離ユニットの位置に移動させる
    // カメラがすでに中心からどの方向を向いているかを考慮する
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    camera.updateProjectionMatrix();

    // カメラをボックスの中心を見るように設定する
    camera.lookAt(boxCenter.x, boxCenter.y + 200, boxCenter.z);

  }

  // 古いモデルをクリアする関数
  const clearOldModel = () => {
    if (!sceneRef.current || !rendererRef.current) return;

    resMgr.dispose();

    const scene = sceneRef.current;
    const groups = scene.children.filter(item =>
      item.parent && (item.name === "NewModel" || item.name === "InitialModel")
    );
    groups.forEach((g) => g.parent?.remove(g));
  };

  // ファイルのアップロードを処理する関数
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

  // ドラッグアンドドロップを処理する関数
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

  // ドラッグオーバーを処理する関数
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // GLTFをロードする関数
  const loadGLTF = (url: string): Promise<GLTF> => {

    return new Promise((resolve, reject) => loader.load(url, resolve, undefined, reject));

  };

  useEffect(() => {
    if (isMount) {
      initWorld();
      animate();
      window.addEventListener("resize", onWindowResize)
    };
    setIsMount(true);

    // アンマウントする時、リソースを解放する
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
      <div className="absolute bottom-[2rem] z-50 bg-slate-800 px-8 py-6 flex gap-4 items-center ">
        <div className="text-white">
          プレビューしたいGLTFモデルを、ここにドラッグ＆ドロップ
        </div>
        <div>
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
      </div>
      <canvas id="glcanvas" className="relative" ref={canvasRef} />
    </div>
  )
}