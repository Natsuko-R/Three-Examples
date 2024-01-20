"use client";

import { useEffect, useState } from "react";
import { Color, DirectionalLight, Fog, GridHelper, HemisphereLight, Mesh, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, Scene, TorusKnotGeometry, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from 'three/addons/libs/stats.module.js';

export const AmmoRope = () => {
    const [isMount, setIsMount] = useState(false);

    // Graphics variables
    let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer;
    let container, stats;
    let textureLoader;

    function init() {



    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    function animate() {

        requestAnimationFrame(animate);
        renderer.render(scene, camera);

    }



    useEffect(() => {
        if (isMount) {
            init();
            // animate();
            window.addEventListener('resize', onWindowResize);
        };
        setIsMount(true);
        return () => {
            window.removeEventListener('resize', onWindowResize)
        };
    }, [isMount])

    if (!isMount) return null;

    return (
        <>
            <div id="info">Ammo.js physics soft body rope demo<br />Press Q or A to move the arm.</div>
            <div id="container"></div>
        </>
    )
}

