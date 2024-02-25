"use client"

import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
import { LDrawUtils } from 'three/addons/utils/LDrawUtils.js';
import { useEffect, useState } from 'react';

export const GLTFViewer = () => {
  const [isMount, setIsMount] = useState(false)


  let container, progressBarDiv;

  let camera, scene, renderer, controls, gui, guiData;

  let model;

  // const ldrawPath = 'models/Idraw/ldraw/officialLibrary/';

  const modelFileList = {
    '1': 'models/gltf/Flamingo.glb',
    '2': 'models/gltf/AnisotropyBarnLamp.glb',
    '3': 'models/gltf/Horse.glb',
    '4': 'models/gltf/Nefertiti.glb',
    '5': 'models/gltf/Stork.glb',
    '6': 'models/gltf/SheenChair.glb',
  };

  function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(150, 200, 250);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // 色调映射是一种调整图像颜色和亮度的技术，用于提高图像的视觉质量。
    container.appendChild(renderer.domElement);

    // scene

    const pmremGenerator = new THREE.PMREMGenerator(renderer); // 通常用于提高渲染场景中反射和折射效果的质量。

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdeebed);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer)).texture;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    //

    guiData = {
      modelFileName: modelFileList['1'],
    };

    window.addEventListener('resize', onWindowResize);

    progressBarDiv = document.createElement('div');
    progressBarDiv.innerText = 'Loading...';
    progressBarDiv.style.fontSize = '3em';
    progressBarDiv.style.color = '#888';
    progressBarDiv.style.display = 'block';
    progressBarDiv.style.position = 'absolute';
    progressBarDiv.style.top = '50%';
    progressBarDiv.style.width = '100%';
    progressBarDiv.style.textAlign = 'center';

    // load materials and then the model

    reloadObject(true);

  }

  function reloadObject(resetCamera) {

    if (model) {

      scene.remove(model);

    }

    model = null; // 确保不再引用之前加载的模型。

    // updateProgressBar(0);
    // showProgressBar();

    // only smooth when not rendering with flat colors to improve processing time
    const lDrawLoader = new LDrawLoader();
    const loader = new GLTFLoader();

    // 平滑法线true且不使用flatColor时为true，否则false
    // lDrawLoader.smoothNormals = guiData.smoothNormals && !guiData.flatColors;
    // lDrawLoader
    // .setPath(ldrawPath)
    loader
      .load(guiData.modelFileName, function (group2) {

        // if (model) {

        //   scene.remove(model);

        // }

        model = group2.scene;

        // Convert from LDraw coordinates: rotate 180 degrees around OX
        // model.rotation.x = Math.PI;

        scene.add(model);

        // Adjust camera and light

        //  创建一个 Box3 类型的边界框对象 bbox，并通过 setFromObject 方法将其设置为包围整个模型 (model) 的边界框
        const bbox = new THREE.Box3().setFromObject(model);
        const size = bbox.getSize(new THREE.Vector3());
        const radius = Math.max(size.x, Math.max(size.y, size.z)) * 0.5; // Math.max(size.x, size.y, size.z) same ？
        // 取模型包围盒在三个轴（x、y、z）上的尺寸的最大值。
        // 乘以 0.5 得到半径值，因为一个包围球的半径是其包围盒最大尺寸的一半。
        // 这种调整相机位置的方式有助于确保用户在加载新模型时能够看到整个模型，而不需要手动调整视角。
        // 在加载不同尺寸的模型时尤为有用，因为它可以根据模型的实际大小自适应相机的位置。

        if (resetCamera) {

          controls.target0.copy(bbox.getCenter(new THREE.Vector3()));	// 将相机控制器 (controls) 的目标点 (target0) 设置为边界框的中心点，以确保相机对准模型的中心。
          controls.position0.set(- 2.3, 1, 2).multiplyScalar(radius).add(controls.target0); // 初始位置 (position0)  // 初始位置的坐标乘以 radius 再加上 target0 ， 确保了相机的初始位置相对于目标点的一个相对偏移，使得相机始终对准模型的中心。
          controls.reset(); // 调用相机控制器的 reset 方法，将相机的当前位置和目标点重置为之前设置的 position0 和 target0。
          console.log("target0", controls.target0);
          console.log("position0", controls.position0);

        }

        createGUI();

        // hideProgressBar();

        // }, onProgress, onError);
      }, () => { }, () => { });

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function createGUI() {

    if (gui) {

      gui.destroy();

    }

    gui = new GUI();

    gui.add(guiData, 'modelFileName', modelFileList).name('Model').onFinishChange(function () {

      reloadObject(true);

    });

  }

  //

  function animate() {

    requestAnimationFrame(animate);
    controls.update();
    render();

  }

  function render() {

    renderer.render(scene, camera);

  }

  // function onProgress(xhr) {

  //   // lengthComputable 是 XMLHttpRequest 对象的一个属性，如果 true，表示能够获取到资源的总大小。如果为 false，表示无法获取资源的总大小，进度信息可能无法准确显示。
  //   if (xhr.lengthComputable) {

  //     updateProgressBar(xhr.loaded / xhr.total);

  //   }

  // }

  // function onError(error) {

  //   const message = 'Error loading model';
  //   progressBarDiv.innerText = message;
  //   console.log(message);
  //   console.error(error);

  // }

  // function showProgressBar() {

  //   document.body.appendChild(progressBarDiv);

  // }

  // function hideProgressBar() {

  //   // document.body.removeChild(progressBarDiv);
  //   progressBarDiv.style.display = 'none';
  // }

  // function updateProgressBar(fraction) {
  //   // 参数 fraction，表示加载的完成程度（通常是一个介于 0 到 1 之间的小数，表示加载的百分比）
  //   progressBarDiv.innerText = 'Loading... ' + Math.round(fraction * 100, 2) + '%'; // Math.round(x, n) 将 x 四舍五入到小数点后 n 位。

  // }

  useEffect(() => {
    if (isMount) {

      init();
      animate();
      window.addEventListener("resize", onWindowResize) // リサイズ処理
    };
    setIsMount(true);
    return () => {
      window.removeEventListener("resize", onWindowResize)
    }
  }, [isMount])

  if (!isMount) return null

  return (
    <div></div>
  )
}
