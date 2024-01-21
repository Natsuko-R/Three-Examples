"use client";

import { useEffect, useState } from "react";
import { AnimationMixer, AnimationAction, Clock, Color, DirectionalLight, Fog, GridHelper, HemisphereLight, Mesh, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer, AnimationClip, Object3D, SkinnedMesh } from "three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js';

export const AnimationSkinningMorph = () => {
    const [isMount, setIsMount] = useState(false);

    let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;
    let container, stats: Stats, clock: Clock, mixer: AnimationMixer, actions: { [key: string]: AnimationAction }, activeAction: AnimationAction, previousAction;
    let model: Object3D;

    const apiStates: { state: string } = { state: 'Walking' };
    const apiEmotes: { [key: string]: () => void } = {}

    function init() {

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
        camera.position.set(- 5, 3, 10);
        camera.lookAt(0, 2, 0);

        scene = new Scene();
        scene.background = new Color(0xe0e0e0);
        scene.fog = new Fog(0xe0e0e0, 20, 100);

        clock = new Clock();

        // lights

        const hemiLight = new HemisphereLight(0xffffff, 0x8d8d8d, 3);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const dirLight = new DirectionalLight(0xffffff, 3);
        dirLight.position.set(0, 20, 10);
        scene.add(dirLight);

        // ground

        const mesh = new Mesh(new PlaneGeometry(2000, 2000), new MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }));
        mesh.rotation.x = - Math.PI / 2;
        scene.add(mesh);

        const grid = new GridHelper(200, 40, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);

        // model

        const loader = new GLTFLoader();
        loader.load('models/gltf/RobotExpressive/RobotExpressive.glb', function (gltf) {

            model = gltf.scene;
            scene.add(model);

            createGUI(model, gltf.animations);

        }, undefined, function (e) {

            console.error(e);

        });

        renderer = new WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // stats
        stats = new Stats();
        container.appendChild(stats.dom);

    }

    function createGUI(model: Object3D, animations: AnimationClip[]) {

        const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
        const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];

        mixer = new AnimationMixer(model);
        const gui = new GUI()
        actions = {}

        for (let i = 0; i < animations.length; i++) {

            const clip = animations[i];
            const action = mixer.clipAction(clip);
            actions[clip.name] = action;

            if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {

                action.clampWhenFinished = true; // 播放完成后会保持在最后一帧的状态，而不会自动循环
                action.setLoop(THREE.LoopOnce, 1)  // LoopOnce; // LoopRepeat // LoopPingPong
            }

        }

        // states

        const statesFolder = gui.addFolder('States');
        statesFolder.add(apiStates, 'state', states).onChange(() => fadeToAction(apiStates.state, 0.5));

        const emoteFolder = gui.addFolder('Emotes');

        function createEmoteCallback(name: typeof emotes[number]) {

            apiEmotes[name] = function () {

                fadeToAction(name, 0.2);

                // 一旦动画完成，就会调用 restoreState 方法
                mixer.addEventListener('finished', restoreState);

            };
            emoteFolder.add(apiEmotes, name);

        }

        function restoreState() {

            // 移除之前添加的监听器，并将动画恢复到之前的状态。
            mixer.removeEventListener('finished', restoreState);

            // 恢复默认状态
            fadeToAction(apiStates.state, 0.2);

        }

        for (let i = 0; i < emotes.length; i++) {

            createEmoteCallback(emotes[i]);

        }

        // expressions

        let face = model.getObjectByName('Head_4') as Mesh;
        const expressions = Object.keys(face?.morphTargetDictionary!);
        const expressionFolder = gui.addFolder('Expressions');

        for (let i = 0; i < expressions.length; i++) {
            const values = face.morphTargetInfluences as number[]; // 明确指定数组类型
            expressionFolder.add(values, i, 0, 1, 0.01).name(expressions[i]);
        }

        activeAction = actions["Walking"]
        activeAction.play()
    }


    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function fadeToAction(name: string, duration: number) {

        previousAction = activeAction;
        activeAction = actions[name];

        // 先将 activeAction 赋值给 previousAction，然后对 previousAction 进行淡出，
        // 确保在切换到新动作时，前一个动作先进行淡出，再让新的动作淡入。保持过渡的平滑性，避免在切换时出现突然的变化。
        if (previousAction !== activeAction) {

            previousAction.fadeOut(duration);

        }

        activeAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();

    }

    function animate() {

        const dt = clock.getDelta();
        if (mixer) mixer.update(dt);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        stats.update();

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

    return (
        <></>
    )
}

