import { Mesh, Object3D, Scene } from "three";

export default class SceneManager {

    private scene:Scene;

    public constructor(){
     
        this.scene = new Scene();

    }; 
    
    public add(object: Object3D){
        
        this.scene.add(object);

    };

    public remove(object: Object3D){

        this.scene.remove(object);

    };

    private clear(){
        
        this.scene.remove();

    }

    public terminate(){
        this.scene.traverse(child => {

            // 子要素がMeshインスタンスの場合ジオメトリを削除する。
            if(child instanceof Mesh){
                if(child.geometry){
                    child.geometry.dispose();
                }

                // 子要素がマテリアルを持っている場合
                if(child.material){
                    if(Array.isArray(child.material)){
                        child.material.forEach(material => material.dispose());
                    }else{
                        child.material.dispose();
                    }
                }
            }
        });

        // sceneの子要素をすべて破棄する
        this.clear();
    }

    public getScene(){
        return this.scene;
    }
}

