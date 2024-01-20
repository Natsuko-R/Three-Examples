"use client";

import { useEffect, useState } from "react";
import { MeshLambertMaterial, Mesh, BoxGeometry, Color, AmbientLight, PerspectiveCamera, SpotLight, Raycaster, Scene, Group, Vector2, WebGLRenderer, Object3D } from "three";
import { DragControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export const DragControlCanvas = () => {
    const [isMount, setIsMount] = useState(false);

    // Graphics variables
    let container: HTMLElement;
    let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;
    let controls: DragControls, group: Group, stats: Stats, gui: GUI;
    let enableSelection = false;

    const objects: Object3D[] = [];

    // for GUI
    const params = {
        count: 15,
    };

    const mouse = new Vector2(), raycaster = new Raycaster();

    function init() {
        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500);
        camera.position.z = 25;

        scene = new Scene();
        scene.background = new Color(0xf0f0f0);

        scene.add(new AmbientLight(0xaaaaaa));

        const light = new SpotLight(0xffffff, 10000);
        light.position.set(0, 25, 50);
        light.angle = Math.PI / 9;

        light.castShadow = true;
        light.shadow.camera.near = 10;
        light.shadow.camera.far = 100;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        scene.add(light);

        group = new Group();
        scene.add(group);

        renderer = new WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        createObject(params.count)

        controls = new DragControls([...objects], camera, renderer.domElement);

        stats = new Stats();
        container.appendChild(stats.dom);

        gui = new GUI({ width: 240 });
        gui.add(params, "count")
            .min(1).max(100).step(5)
            .onChange(() => { createObject(params.count) })
            .name('COUNT');

        render();

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        render();

    }

    function render() {
        renderer.render(scene, camera);
    }

    function onClick(event: MouseEvent) {
        event.preventDefault();

        if (enableSelection === true) {
            const draggableObjects = controls.getObjects(); // array for selected objects
            draggableObjects.length = 0; // ensure draggableObjects is empty before adding new objects to it.

            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersections = raycaster.intersectObjects(objects);

            if (intersections.length > 0) {

                const object = intersections[0].object;

                // .attach ( object : Object3D ) : this
                // Adds object as a child of this, while maintaining the object's world transform.
                // Note: This method does not support scene graphs having non-uniformly-scaled nodes(s).

                // 检查 object 是否已经是 group 的子物体。如果 group 的子物体中已经包含了被点击的物体 object
                if (group.children.includes(object) && object instanceof Mesh) {
                    object.material.emissive.set(0x000000); // 设置被点击物体的发光材质为黑色。
                    scene.attach(object); // 将被点击的物体从 group 中移除，并添加到整个场景中。
                } else if (object instanceof Mesh) {
                    object.material.emissive.set(0xaaaaaa); // 设置被点击物体的发光材质为灰色。
                    group.attach(object); // 将被点击的物体添加到 group 中。
                }

                controls.transformGroup = true; // works if the DragControls.objects array contains a single draggable group object.
                draggableObjects.push(group); // 将 group 添加到可拖动物体的数组中。

            }

            if (group.children.length === 0) {

                controls.transformGroup = false; // If set to true, DragControls does not transform individual objects but the entire group. Default is false.
                draggableObjects.push(...objects);

            }
        };

        render();
    }

    function createObject(count: number) {

        // clear old items

        for (let i = 0; i < scene.children.length; i++) {
            const child = scene.children[i];
            if (child instanceof Mesh) {
                child.geometry.dispose();
                scene.remove(child);
                i--;
            }
        }

        // create new items

        const geometry = new BoxGeometry();

        for (let i = 0; i < count; i++) {
            const object = new Mesh(geometry, new MeshLambertMaterial({ color: Math.random() * 0xffffff }));
            object.name = `Mesh${i}`;

            object.position.x = Math.random() * 30 - 15;
            object.position.y = Math.random() * 15 - 7.5;
            object.position.z = Math.random() * 20 - 10;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.x = Math.random() * 2 + 1;
            object.scale.y = Math.random() * 2 + 1;
            object.scale.z = Math.random() * 2 + 1;

            object.castShadow = true;
            object.receiveShadow = true;

            scene.add(object);
            objects.push(object);
        };

        render();
    }

    function onKeyDown(event: KeyboardEvent) {

        enableSelection = (event.key === 'Shift') ? true : false;

    }

    function onKeyUp() {

        enableSelection = false;

    }

    useEffect(() => {
        if (isMount) {
            init();

            controls.addEventListener('drag', render);
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            document.addEventListener('click', onClick);
        };

        setIsMount(true);

        return () => {
            controls?.removeEventListener('drag', render);
            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            document.removeEventListener('click', onClick);
            scene?.remove();
            renderer?.dispose();
        };
    }, [isMount])

    if (!isMount) return null;

    return (<></>)
}

