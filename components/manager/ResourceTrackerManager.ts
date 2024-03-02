import { Material, Mesh, Object3D } from "three";

export default class ResourceTracker {

    private resources: (Mesh | Object3D)[] = [];

    public constructor() { }

    // リソースを追跡する 
    public track(resource: Mesh | Object3D) {
        if (!this.contains(resource)) {
            this.resources.push(resource);
        }
        return resource;
    }

    // リソースの追跡をやめる 
    public untrack(resource: Mesh | Object3D) {
        const index = this.resources.indexOf(resource);
        if (index !== -1) {
            this.resources.splice(index, 1);
        }
    }

    // リソースを破棄する 
    public dispose() {
        for (const resource of this.resources) {
            if (resource instanceof Object3D) {
                if (resource.parent) {
                    resource.parent.remove(resource);
                }
            }
            if (resource instanceof Mesh) {
                const materials = resource.material instanceof Array ? resource.material : [resource.material];
                materials.forEach(material => {
                    this.disposeMaterial(material);
                });
            }
        }
        this.resources.length = 0;
    }

    // リソースが含まれているかを確認する 
    private contains(resource: Mesh | Object3D): boolean {
        return this.resources.indexOf(resource) !== -1;
    }

    // マテリアルを破棄する 
    private disposeMaterial(material: Material) {
        if (typeof material.dispose === 'function') {
            material.dispose();
        }
    }
}
