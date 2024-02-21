"use client"

import { useEffect, useRef, useState } from "react"
import { AmbientLight, AnimationAction, AnimationMixer, CircleGeometry, Clock, DirectionalLight, Mesh, MeshStandardMaterial, Object3D, PerspectiveCamera, Scene, TextureLoader, WebGLCubeRenderTarget, WebGLRenderer, DoubleSide, HemisphereLight, Group } from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const SKYBOX_PATH_TEXTURE: string = '/images/sky_01.jpg';
const GROUND_PATH_TEXTURE: string = '/images/moon.jpg';
const INITIAL_MODEL: string = 'models/gltf/RobotExpressive/RobotExpressive.glb';

export const GLTFViewer = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<Scene>();
  const rendererRef = useRef<WebGLRenderer>();

  // const [isMount, setIsMount] = useState(false)

  let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;
  let controls: OrbitControls, stats: Stats;
  let clock: Clock, mixer: AnimationMixer, actions: { [key: string]: AnimationAction }, activeAction: AnimationAction;
  let model: Object3D;
  let requestId: number;

  const initWorld = () => {

    // シーン

    scene = new Scene();

    // ライト

    const dirLight = new DirectionalLight(0xffffff, 3);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    scene.add(new AmbientLight(0xffffff, 3));

    // カメラ

    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(400, 200, 0);
    camera.lookAt(0, 0, 0);

    // レンダラーの作成

    renderer = new WebGLRenderer({
      canvas: document.querySelector("#glcanvas") as HTMLCanvasElement,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // カメラコントローラ

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 100;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;
    controls.update();

    // スカイボックス

    const textureLoader = new TextureLoader();
    textureLoader.load(SKYBOX_PATH_TEXTURE, (texture) => {
      const target = new WebGLCubeRenderTarget(texture.image.height);
      target.fromEquirectangularTexture(renderer, texture);
      scene.background = target.texture;
      console.log("SkyBox : succeeded on loading " + SKYBOX_PATH_TEXTURE);
    }, undefined, () => {
      console.error("SkyBox : failed on loading " + SKYBOX_PATH_TEXTURE);
      return;
    });

    // 地面

    const groundTexture = textureLoader.load(GROUND_PATH_TEXTURE, () => {
      console.log("Ground : succeeded on loading " + GROUND_PATH_TEXTURE);
    }, undefined, () => {
      console.log("Ground : failed on loading " + GROUND_PATH_TEXTURE);
      return;
    });
    const groundMaterial = new MeshStandardMaterial({ side: DoubleSide });
    groundMaterial.map = groundTexture;
    const groundGeometry = new CircleGeometry(300, 300);
    const groundModel = new Mesh(groundGeometry, groundMaterial);
    groundModel.name = "ground";
    groundModel.position.set(0, 0, 0);
    groundModel.rotation.x = (-0.5 * Math.PI);
    scene.add(groundModel);

    // initial model

    const loader = new GLTFLoader();
    loader.load(INITIAL_MODEL, function (gltf) {
      model = gltf.scene;
      model.name = "InitialModel";
      model.scale.set(40, 40, 40);

      scene.add(model);
    }, undefined, function (e) {
      console.error(e);
    });

    // dat.gui.

    const gui = new GUI();
    gui.add(camera, "fov")
      .min(10)
      .max(100)
      .step(1)
      .onChange(() => camera.updateProjectionMatrix())
      .name("カメラ調整")

    // init refs

    sceneRef.current = scene;
    rendererRef.current = renderer;

  }

  const animate = () => {
    renderer.render(scene, camera);
    controls.update();
    requestId = requestAnimationFrame(animate);
  }

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  const clearOldModel = async () => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const groups = scene.children.filter(item => 
      item.parent && (item.name === "NewModel" || item.name === "InitialModel")
    );
    groups.forEach((g) => g.parent?.remove(g));
    rendererRef.current.render(scene, camera);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearOldModel();

    const loader = new GLTFLoader();
    loader.load(URL.createObjectURL(file), (gltf) => {
      const model = gltf.scene;
      model.name = "NewModel"
      model.position.set(0, 20, 0);
      scene.add(model);
    });
  };

  useEffect(() => {
    // if (isMount) {
    initWorld();
    animate();
    window.addEventListener("resize", onWindowResize) // リサイズ処理
    // };
    // setIsMount(true);
    return () => {
      cancelAnimationFrame(requestId)
      window.removeEventListener("resize", onWindowResize)
      scene.remove();
      renderer.dispose();
    }
    // }, [isMount])
  }, [])

  // if (!isMount) return null

  return (
    <div className="relative" >
      <div className="absolute top-4 left-4 z-50" >
        <input
          type="file"
          accept=".gltf,.glb"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded">
          Import Local Model
        </button>
      </div>
      <canvas id="glcanvas" className="relative" ref={canvasRef} />
    </div>
  )
}
