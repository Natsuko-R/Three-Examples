"use client"

import { useEffect, useRef, useState } from "react"
import { AmbientLight, DirectionalLight } from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SceneManager from "./manager/scene/SceneManager";
import SkyBoxManager from "./manager/bg/SkyBoxManager";
import GroundManager from "./manager/bg/GroundManager";
import RendererManager from "./manager/renderer/RendererManager";
import { OutlineEffect } from "three/examples/jsm/Addons.js";
import PerspectiveCameraManager from "./manager/camera/PerspectiveCameraManager";
import CameraControler from "./manager/controler/CameraControler";

export const GLTFViewer = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMount, setIsMount] = useState(false)

  //-----------------------------------------------------------------------------//
  // refの宣言
  //-----------------------------------------------------------------------------//
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const guiRef = useRef<GUI>()
  const sceneRef = useRef<SceneManager>()
  const skyBoxRef = useRef<SkyBoxManager>()
  const groundRef = useRef<GroundManager>()
  const rendererRef = useRef<RendererManager>()
  const persCameraRef = useRef<PerspectiveCameraManager>()
  const cameraControlerRef = useRef<CameraControler>()
  const outlineEffectRef = useRef<OutlineEffect>()
  //
  let requestId: number
  let timer: NodeJS.Timeout

  const initWorld = () => {
    // ウィンドウサイズの取得
    let canvasWidth: number = window.innerWidth
    let canvasHeight: number = window.innerHeight

    // シーンの作成
    sceneRef.current = new SceneManager()

    // ライトの作成
    sceneRef.current.add(new DirectionalLight(0xffffff, 1))
    sceneRef.current.add(new AmbientLight(0xffffff, 2.5))

    // カメラの作成
    persCameraRef.current = new PerspectiveCameraManager(
      canvasWidth,
      canvasHeight,
      sceneRef.current.getScene()
    )

    // カメラコントローラの作成
    cameraControlerRef.current = new CameraControler(
      persCameraRef.current.getCamera()
    )

    // レンダラーの作成
    rendererRef.current = new RendererManager(
      canvasWidth,
      canvasHeight,
      sceneRef.current.getScene(),
      persCameraRef.current.getCamera()
    )

    // スカイボックスの作成
    skyBoxRef.current = new SkyBoxManager(
      sceneRef.current.getScene(),
      rendererRef.current.getRenderer()
    )

    // 地面の作成
    groundRef.current = new GroundManager(sceneRef.current.getScene())

    // Add dat.gui.
    guiRef.current = new GUI({ autoPlace: false })
    guiRef.current.domElement.style.cssText = `
		position: absolute;
		top: 1rem;
		right: 9rem;
	  `
    guiRef.current
      .add(persCameraRef.current.getCamera(), "fov")
      .min(10)
      .max(70)
      .step(1)
      .onChange(() => {
        persCameraRef.current?.getCamera().updateProjectionMatrix()
      })
      .name("カメラ調整")
  }

  const tick = () => {
    rendererRef.current?.render()
    cameraControlerRef.current?.updateControler()
    requestId = requestAnimationFrame(tick)
  }

  const onWindowResize = () => {
    let canvasWidth: number = window.innerWidth
    let canvasHeight: number = window.innerHeight

    persCameraRef.current?.setAspect(canvasWidth, canvasHeight)
    rendererRef.current?.resize(canvasWidth, canvasHeight)
  }

  const waitSeconds = (second = 0) => {
    return new Promise((resolve) => setTimeout(resolve, second * 1000))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loader = new GLTFLoader();
    loader.load(URL.createObjectURL(file), (gltf) => {
      // Do something with the loaded model, e.g., add it to the scene
      console.log('Model loaded:', gltf);

      const baseModel = gltf.scene;
      baseModel.scale.set(40, 40, 40);
      baseModel.position.set(100, 40, 40);
      sceneRef.current?.getScene().add(baseModel);
    });
  };

  useEffect(() => {
    if (isMount) {
      initWorld();
      tick();
      if (canvasRef.current?.parentElement && guiRef.current) {
        canvasRef.current.parentElement.appendChild(guiRef.current.domElement)
      }
      window.addEventListener("resize", onWindowResize) // リサイズ処理
    };

    setIsMount(true);

    return () => {
      cancelAnimationFrame(requestId)
      clearInterval(timer)
      window.removeEventListener("resize", onWindowResize)
      sceneRef.current?.terminate()
      skyBoxRef.current?.terminate()
      groundRef.current?.terminate()
      rendererRef.current?.terminate()

      const guiDom = guiRef.current?.domElement;
      if (guiDom && guiDom.parentElement) {
        guiDom.parentElement.removeChild(guiDom);
      }
    }
  }, [isMount])

  if (!isMount) return null

  return (
    <div>
      <div>
        <input
          type="file"
          accept=".gltf,.glb"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <button onClick={() => fileInputRef.current?.click()}>导入模型文件</button>
      </div>
      <canvas id="glcanvas" className="relative" ref={canvasRef} />
    </div>
  )
}
