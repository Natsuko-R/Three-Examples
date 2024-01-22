"use client";

import { useEffect, useState } from "react";
import { AmbientLight, ArrayCamera, CylinderGeometry, DirectionalLight, Mesh, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector4, WebGLRenderer } from "three";

class CustomPerspectiveCamera extends PerspectiveCamera {
    viewport = new Vector4();
}

// BUG : 使用笔记本和外接显示器，onWindowResize方法在同一个显示器上resize生效，但是当从笔记本屏幕拖动到外接显示器上后就不resize，为什么？

export const CameraArray = () => {
    const [isMount, setIsMount] = useState(false);

    let scene: Scene, arrayCamera: PerspectiveCamera, renderer: WebGLRenderer;
    let mesh: Mesh;

    const AMOUNT = 5;
    const cameras: CustomPerspectiveCamera[] = [];

    function init() {

        const ASPECT_RATIO = window.innerWidth / window.innerHeight;

        const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
        const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;


        for (let y = 0; y < AMOUNT; y++) {

            for (let x = 0; x < AMOUNT; x++) {

                const subcamera = new CustomPerspectiveCamera(40, ASPECT_RATIO, 0.1, 10);
                subcamera.viewport = new Vector4(Math.floor(x * WIDTH), Math.floor(y * HEIGHT), Math.ceil(WIDTH), Math.ceil(HEIGHT));
                subcamera.position.x = (x / AMOUNT) - 0.5;
                subcamera.position.y = 0.5 - (y / AMOUNT);
                subcamera.position.z = 1.5;
                subcamera.position.multiplyScalar(2);
                subcamera.lookAt(0, 0, 0);
                subcamera.updateMatrixWorld();
                cameras.push(subcamera);

            }

        }

        arrayCamera = new ArrayCamera(cameras);
        arrayCamera.position.z = 3;

        scene = new Scene();

        scene.add(new AmbientLight(0x999999));

        const light = new DirectionalLight(0xffffff, 3);
        light.position.set(0.5, 0.5, 1);
        light.castShadow = true;
        light.shadow.camera.zoom = 4; // tighter shadow map
        scene.add(light);

        const geometryBackground = new PlaneGeometry(100, 100);
        const materialBackground = new MeshPhongMaterial({ color: 0x000066 });

        const background = new Mesh(geometryBackground, materialBackground);
        background.receiveShadow = true;
        background.position.set(0, 0, - 1);
        scene.add(background);

        const geometryCylinder = new CylinderGeometry(0.5, 0.5, 1, 32);
        const materialCylinder = new MeshPhongMaterial({ color: 0xff0000 });

        mesh = new Mesh(geometryCylinder, materialCylinder);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        renderer = new WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);
    }

    function onWindowResize() {
        const ASPECT_RATIO = window.innerWidth / window.innerHeight;
        const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio;
        const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio;

        arrayCamera.aspect = ASPECT_RATIO;
        arrayCamera.updateProjectionMatrix();

        for (let y = 0; y < AMOUNT; y++) {

            for (let x = 0; x < AMOUNT; x++) {

                const subcamera = cameras[AMOUNT * y + x];

                subcamera.viewport.set(
                    Math.floor(x * WIDTH),
                    Math.floor(y * HEIGHT),
                    Math.ceil(WIDTH),
                    Math.ceil(HEIGHT));

                subcamera.aspect = ASPECT_RATIO;
                subcamera.updateProjectionMatrix();

            }

        }

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function animate() {

        mesh.rotation.x += 0.005;
        mesh.rotation.z += 0.01;

        renderer.render(scene, arrayCamera);

        requestAnimationFrame(animate);

    }

    useEffect(() => {
        if (isMount) {
            init();
            animate();
            window.addEventListener('resize', onWindowResize);
        };
        setIsMount(true);
        return () => {
            window.removeEventListener('resize', onWindowResize)
        };
    }, [isMount])

    if (!isMount) return null;

    return <></>
}

