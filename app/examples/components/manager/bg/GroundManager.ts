import { Scene, TextureLoader, Texture, CircleGeometry, MeshStandardMaterial, Mesh, Vector3, DoubleSide } from "three";

const PATH_TEXTURE: string = '/images/ground_01.jpg';
const GROUND_SEGMENT: number = 24;  // 床の分割数
const GROUND_RADIUS: number = 1000; // 床の半径
const BASE_POSITION: Vector3 = new Vector3(0, -0.05, 0);
const BASE_ROTATION_X: number = (-0.5 * Math.PI);

export default class GroundManager {

    private targetScene: Scene;
    private textureLoader: TextureLoader;
    private texture: Texture;
    private geometry: CircleGeometry;
    private material: MeshStandardMaterial;
    private model: Mesh;

    public constructor(scene: Scene) {

        this.targetScene = scene;
        this.textureLoader = new TextureLoader();
        this.texture = new Texture();
        this.geometry = new CircleGeometry(GROUND_RADIUS, GROUND_SEGMENT);
        this.material = new MeshStandardMaterial({ side: DoubleSide });
        this.model = new Mesh();

        this.addGround();
    }

    public addGround() {
        this.texture = this.textureLoader.load(PATH_TEXTURE, () => {
            // console.log("GroundManager : succeeded on loading " + PATH_TEXTURE);
        }, undefined, () => {
            console.log("GroundManager : failed on loading " + PATH_TEXTURE);
            return;
        });

        this.material.map = this.texture;

        this.model.geometry = this.geometry;
        this.model.material = this.material;

        this.model.position.set(BASE_POSITION.x, BASE_POSITION.y, BASE_POSITION.z);
        this.model.rotation.x = BASE_ROTATION_X;

        this.model.name = "ground"
        this.targetScene.add(this.model);

    };

    public terminate() {
        this.texture.dispose();
    }

    public getModel() {
        return this.model;
    }
};