"use client"

import { useEffect, useRef, useState } from "react"
import { EquirectangularReflectionMapping, AmbientLight, DirectionalLight, Object3D, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer, Box3, Vector3, BoxGeometry, Mesh, MeshLambertMaterial, Box3Helper, Color } from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';
import ResourceTracker from "./manager/tracker/ResourceTrackerManager";

const HDR_PATH_TEXTURE: string = '/images/pedestrian_overpass_1k.hdr';
// const INITIAL_MODEL: string = 'models/gltf/RobotExpressive/RobotExpressive.glb';
const INITIAL_MODEL: string = 'models/gltf/Nefertiti.glb';

const scaleController = {
  scale: 1.0
};

export const GLTFViewer = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<Scene>();
  const rendererRef = useRef<WebGLRenderer>();

  const [isMount, setIsMount] = useState(false)

  const textureLoader = new TextureLoader();
  const resMgr = new ResourceTracker();
  const track = resMgr.track.bind(resMgr);

  let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;
  let controls: OrbitControls, stats: Stats, gui: GUI;
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

    camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(- 50, 30, 100);
    // camera.lookAt(1000, 1000, 1000);

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
    // controls.dampingFactor = 0.05;
    // controls.screenSpacePanning = false;
    // controls.minDistance = 100;
    // controls.maxDistance = 500;
    // controls.maxPolarAngle = Math.PI / 2;
    // controls.update();

    // スカイボックス

    // textureLoader.load(SKYBOX_TEXTURE, (texture) => {
    //   const target = new WebGLCubeRenderTarget(texture.image.height);
    //   target.fromEquirectangularTexture(renderer, texture);
    //   scene.background = target.texture;
    //   console.log("SkyBox : succeeded on loading " + SKYBOX_TEXTURE);
    // }, undefined, () => {
    //   console.error("SkyBox : failed on loading " + SKYBOX_TEXTURE);
    //   return;
    // });

    new RGBELoader().load(HDR_PATH_TEXTURE, function (texture) {
      texture.mapping = EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    });

    // 地面

    // const groundTexture = textureLoader.load(GROUND_TEXTURE, () => {
    //   console.log("Ground : succeeded on loading " + GROUND_TEXTURE);
    // }, undefined, () => {
    //   console.log("Ground : failed on loading " + GROUND_TEXTURE);
    //   return;
    // });
    // const groundMaterial = new MeshStandardMaterial({ side: DoubleSide });
    // groundMaterial.map = groundTexture;
    // const groundGeometry = new CircleGeometry(300, 300);
    // const groundModel = new Mesh(groundGeometry, groundMaterial);
    // groundModel.name = "ground";
    // groundModel.position.set(0, 0, 0);
    // groundModel.rotation.x = (-0.5 * Math.PI);
    // scene.add(groundModel);

    // initial model

    gui = new GUI();
    gui.add(camera, "fov")
      .min(10)
      .max(100)
      .step(1)
      .onChange(() => camera.updateProjectionMatrix())
      .name("カメラ調整")


    const loader = new GLTFLoader();
    loader.load(INITIAL_MODEL, function (gltf) {
      model = gltf.scene;
      model.name = "InitialModel";
      model.position.set(0, -10, 0)
      scene.add(model);

      gui.add(scaleController, "scale", 0.1, 5)
        .step(0.1)
        .name("Scale")
        .onChange(() => {
          model.scale.set(scaleController.scale, scaleController.scale, scaleController.scale);
        });

      gui.add(model.position, "x", -50, 50).name("Position X");
      gui.add(model.position, "y", -50, 50).name("Position Y");
      gui.add(model.position, "z", -50, 50).name("Position Z");
    }, undefined, function (e) {
      console.error(e);
    });

    // dat.gui.




    // const positionControls = gui.addFolder('Position');
    // positionControls.add(camera.position, 'x', -300, 300)
    //   .name('Position X')
    //   .step(50)
    //   .onChange(() => camera.updateProjectionMatrix());
    // positionControls.add(camera.position, 'y', -300, 300)
    //   .name('Position Y')
    //   .step(50)
    //   .onChange(() => camera.updateProjectionMatrix());
    // positionControls.add(camera.position, 'z', -300, 300)
    //   .name('Position Z')
    //   .step(50)
    //   .onChange(() => camera.updateProjectionMatrix());

    // stats

    stats = new Stats();
    document.querySelector("#container")?.appendChild(stats.dom);

    // init refs

    sceneRef.current = scene;
    rendererRef.current = renderer;

  }

  const animate = () => {
    renderer.render(scene, camera);
    controls.update();

    scene.children.forEach(item => {
      if (item.name === "NewModel" || item.name === "InitialModel") {
        item.rotation.y += 0.01;
      }
    });

    requestId = requestAnimationFrame(animate);
  }

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

  const clearOldModel = async () => {
    if (!sceneRef.current || !rendererRef.current) return;

    resMgr.dispose();

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


    let mat = new MeshLambertMaterial({
      color: 0xff0000
    });
    let cube = new Mesh(new BoxGeometry(1, 1, 1), mat);
    cube.name = 'newCUBE';
    cube.position.set(3, 1, 0);
    cube.scale.set(1, 1, 1);
    cube.material.fog = false;
    let mainBounds = new Box3().setFromObject(cube);
    console.log('main is >>>>>>>>', mainBounds);

    const loader = new GLTFLoader();
    loader.load(URL.createObjectURL(file), (gltf) => {

      // let helper = new Box3Helper(boundingBox, new Color(0xFF8551));
      // let newBounds = new Box3().setFromObject(gltf.scene);
      // console.log('newBounds is >>>>>>>>', newBounds);

      // let lengthSceneBounds = {
      //   x: Math.abs(mainBounds.max.x - mainBounds.min.x),
      //   y: Math.abs(mainBounds.max.y - mainBounds.min.y),
      //   z: Math.abs(mainBounds.max.z - mainBounds.min.z),
      // };

      // Calculate side lengths of glb-model bounding box
      // let lengthMeshBounds = {
      //   x: Math.abs(newBounds.max.x - newBounds.min.x),
      //   y: Math.abs(newBounds.max.y - newBounds.min.y),
      //   z: Math.abs(newBounds.max.z - newBounds.min.z),
      // };

      // // Calculate length ratios
      // let lengthRatios = [
      //   (lengthSceneBounds.x / lengthMeshBounds.x),
      //   (lengthSceneBounds.y / lengthMeshBounds.y),
      //   (lengthSceneBounds.z / lengthMeshBounds.z),
      // ];

      // Select smallest ratio in order to contain the model within the scene
      // let minRatio = Math.min(...lengthRatios);

      // // If you need some padding on the sides
      // let padding = 0;
      // minRatio -= padding;

      // const size = new Vector3();
      // boundingBox.getSize(size);
      // const boxSize = boundingBox.getSize(new Vector3()).length();
      // const boxCenter = boundingBox.getCenter(new Vector3());

      // set the camera to frame the box
      // frameArea(boxSize * 1.1, boxSize, boxCenter, camera);

      // const scaleFactor = 5 / Math.max(size.x, size.y, size.z);

      model = track(gltf.scene);
      model.name = "NewModel";
      // model.scale.set(scaleFactor, scaleFactor, scaleFactor);
      // console.log('minRatio is >>>>>>>>', minRatio);

      // model.scale.set(minRatio, minRatio, minRatio);

      scene.add(model);
      const bbox = new Box3().setFromObject(gltf.scene);
      const size = bbox.getSize(new Vector3());
      const radius = Math.max(size.x, Math.max(size.y, size.z)) * 0.5;
      controls.target0.copy(bbox.getCenter(new Vector3()));
      controls.position0.set(0, 0, 2).multiplyScalar(radius).add(controls.target0);
      controls.reset();
    }, undefined, (e) => console.error(e));
    rendererRef.current?.render(scene, camera);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    clearOldModel();

    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result as string;
        const loader = new GLTFLoader();
        loader.load(data, (gltf) => {
          model = track(gltf.scene);
          model.name = "NewModel";

          const boundingBox = new Box3().setFromObject(gltf.scene);
          const size = new Vector3();

          const scaleFactor = 1 / Math.max(size.x, size.y, size.z);
          // model.scale.set(scaleFactor, scaleFactor, scaleFactor);

          scene.add(model);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (isMount) {
      initWorld();
      animate();
      window.addEventListener("resize", onWindowResize) // リサイズ処理
    };
    setIsMount(true);
    return () => {
      cancelAnimationFrame(requestId)
      window.removeEventListener("resize", onWindowResize)
      gui?.destroy();
      sceneRef.current?.remove();
      rendererRef.current?.dispose();
    }
  }, [isMount])
  // }, [])

  if (!isMount) return null

  return (
    <div
      id="container"
      className="relative flex justify-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="absolute bottom-[4rem] z-50">
        <input
          type="file"
          accept=".gltf,.glb"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button onClick={() => fileInputRef.current?.click()} className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded">
          GLTFファイルをアップロード
        </button>
      </div>
      <canvas id="glcanvas" className="relative" ref={canvasRef} />
    </div>
  )
}
