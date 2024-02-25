import { Material, Mesh, Object3D } from "three";

export default class ResourceTracker {

    private resources: (Mesh | Object3D)[] = [];

    public constructor() { }

    public track(resource: Mesh | Object3D) {
        if (!this.contains(resource)) {
            this.resources.push(resource);
        }
        return resource;
    }

    public untrack(resource: Mesh | Object3D) {
        const index = this.resources.indexOf(resource);
        if (index !== -1) {
            this.resources.splice(index, 1);
        }
    }

    public dispose() {
        for (const resource of this.resources) {
            if (resource instanceof Object3D) {
                if (resource.parent) {
                    resource.parent.remove(resource);
                }
            }
            if (resource instanceof Mesh) {
                // 释放 Mesh 的材质
                const materials = resource.material instanceof Array ? resource.material : [resource.material];
                materials.forEach(material => {
                    this.disposeMaterial(material);
                });
            }
        }
        this.resources.length = 0;
    }

    private contains(resource: Mesh | Object3D): boolean {
        return this.resources.indexOf(resource) !== -1;
    }

    private disposeMaterial(material: Material) {
        // 检查是否有 dispose 方法
        if (typeof material.dispose === 'function') {
            material.dispose();
        }
    }
}
