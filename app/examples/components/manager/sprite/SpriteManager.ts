import { DeviceWithSize } from "@/actions/get-3d-data";
import { Scene, Sprite, SpriteMaterial, TextureLoader } from "three";

const TEXTURE_PATH = "/texture/co2_purple.png";
const SPRITE_SCALE = 30.0;
const PIPE_MODEL_SCALE = 30;
const OFFSET = 25;
const EMIT_RATE = 0.5;

export default class SpriteManager {

    public scene: Scene;
    public sprite: Sprite;
    public sprites: Sprite[];

    public constructor(scene: Scene) {

        this.scene = scene;
        const spriteMaterial = new SpriteMaterial({
            map: new TextureLoader().load(TEXTURE_PATH),
            opacity: 0.8,
        });
        this.sprite = new Sprite(spriteMaterial)
        this.sprite.scale.set(SPRITE_SCALE, SPRITE_SCALE, SPRITE_SCALE);
        this.sprites = [];

    }

    public emitSprites(arr: DeviceWithSize[], states: boolean[]) {

        for (let i = 0; i < arr.length; i++) {

            if (states[i]) {
                const pipe = arr[i];
                const spriteCount = Math.round(PIPE_MODEL_SCALE * pipe.size / OFFSET);
                const spriteLength = PIPE_MODEL_SCALE * pipe.size;

                for (let i = 0; i < spriteCount; i++) {
                    const originPosZ = i * OFFSET - spriteLength / 2;

                    const obj = this.sprite.clone();
                    obj.position.set(pipe.posX, pipe.posY, originPosZ);
                    obj.userData.originPosZ = originPosZ;
                    obj.userData.timeCount = 3600; // 1 min 

                    this.scene.add(obj);
                    this.sprites.push(obj);
                }
            }
        }
    }
    
    public updateSprites() {

        this.sprites.forEach((sprite, idx) => {

            sprite.position.z += EMIT_RATE;
            sprite.userData.timeCount -= 1;

            if (sprite.position.z > sprite.userData.originPosZ + OFFSET) {
                sprite.position.z = sprite.userData.originPosZ;
            }

            if (sprite.userData.timeCount === 0) {
                this.scene.remove(sprite);
                this.sprites.splice(idx, 1);
            }
        })
    }

    public emitSpritesFor400(arr: DeviceWithSize[]) {

        arr.forEach(p => {
            const spriteCount = Math.round(PIPE_MODEL_SCALE * p.size / OFFSET);
            const halfSpriteLength = PIPE_MODEL_SCALE * p.size / 2;

            for (let i = 0; i < spriteCount; i++) {

                const originPosZ = i * OFFSET - halfSpriteLength;

                const obj = this.sprite.clone();
                obj.position.set(p.posX, p.posY, originPosZ);
                obj.userData.originPosZ = originPosZ;

                this.scene.add(obj);
                this.sprites.push(obj);
            }
        })
    }

    public updateSpritesFor400() {

        this.sprites.forEach(sprite => {
            sprite.position.z += EMIT_RATE;

            if (sprite.position.z > sprite.userData.originPosZ + OFFSET) {
                sprite.position.z = sprite.userData.originPosZ;
            }
        })
    }
}