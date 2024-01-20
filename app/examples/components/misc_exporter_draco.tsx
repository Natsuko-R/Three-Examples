"use client";

import { useEffect, useState } from "react";
import { Color, DirectionalLight, Fog, GridHelper, HemisphereLight, Mesh, MeshPhongMaterial, PerspectiveCamera, PlaneGeometry, Scene, TorusKnotGeometry, WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { DRACOExporter } from 'three/addons/exporters/DRACOExporter.js';

export const ExporterDRACO = () => {
    const [isMount, setIsMount] = useState(false);

    let scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, exporter: DRACOExporter, mesh: Mesh;

    const params = {
        export: exportFile
    };

    function init() {

        camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(4, 2, 4);

        scene = new Scene();
        scene.background = new Color(0xa0a0a0);
        scene.fog = new Fog(0xa0a0a0, 4, 20);

        exporter = new DRACOExporter();

        //

        const hemiLight = new HemisphereLight(0xffffff, 0x444444, 3);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const directionalLight = new DirectionalLight(0xffffff, 3);
        directionalLight.position.set(0, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.top = 2;
        directionalLight.shadow.camera.bottom = - 2;
        directionalLight.shadow.camera.left = - 2;
        directionalLight.shadow.camera.right = 2;
        scene.add(directionalLight);

        // ground

        const ground = new Mesh(new PlaneGeometry(40, 40), new MeshPhongMaterial({ color: 0xbbbbbb, depthWrite: false }));
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        const grid = new GridHelper(40, 20, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);

        // export mesh

        const geometry = new TorusKnotGeometry(0.75, 0.2, 200, 30);
        const material = new MeshPhongMaterial({ color: 0x00ff00 });
        mesh = new Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.position.y = 1.5;
        scene.add(mesh);

        //

        renderer = new WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        //

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.5, 0);
        controls.update();

        //

        const gui = new GUI();

        gui.add(params, 'export').name('Export DRC');
        gui.open();


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

    function exportFile() {

        // Unhandled Runtime Error
        // ReferenceError: DracoEncoderModule is not defined
        const result = exporter.parse(mesh);
        saveArrayBuffer(result, 'file.drc');

    }

    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);

    function save(blob: Blob, filename: string) {

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

    }

    function saveArrayBuffer(buffer: ArrayBuffer, filename: string) {

        save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

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

