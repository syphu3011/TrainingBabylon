import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Tools, Engine, Scene, Vector3, Mesh, Color3, Color4, ShadowGenerator, GlowLayer, PointLight, FreeCamera, CubeTexture, Sound, PostProcess, Effect, SceneLoader, Matrix, MeshBuilder, Quaternion, AssetsManager, EngineFactory, int, Animation, float, StandardMaterial, KeyboardEventTypes } from "@babylonjs/core";
import { ChessBoard } from "./ChessBoard";
enum KEY {
    w = 'w',
    s = 's',
    a = 'a',
    d = 'd',
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight'
}
export class Chesspiece {
    private position: Vector3
    private mesh: Mesh
    private currentXOnBoard: int
    private currentZOnBoard: int
    private height: float
    private width: float
    private depth: float
    private type: boolean // true is killer, false is runner
    private scene: Scene

    //for action
    private isMoving = false
    private saveInputMoveAction: any
    private saveDetectMoveAction: any
    private saveDetectColission: any
    // private isPressing = false
    private waiting_move_list: (() => void)[] = []
    constructor(currentXOnBoard: int, currentZOnBoard: int, height: float, width: float, depth, type: boolean, scene: Scene) {
        this.currentXOnBoard = currentXOnBoard
        this.currentZOnBoard = currentZOnBoard
        this.height = height
        this.width = width
        this.depth = depth
        this.type = type
        this.scene = scene
        this.position = ChessBoard.position2D[this.currentXOnBoard][this.currentZOnBoard]
        this.mesh = this.createMesh()
        // input move
        this.inputMoveAction()
        this.detectMoveAction()
        this.detectCollision()
    }
    public set setPosition(position: Vector3) {
        this.position = position;
        this.mesh.position = position
    }

    public get getPosition(): Vector3 {
        return this.position
    }
    public get getMesh(): Mesh {
        return this.mesh
    }

    private createMesh(): Mesh {
        try {
            // create a new material with the desired color
            const material = new StandardMaterial("myMaterial", this.scene);
            material.diffuseColor = this.type ? new Color3(0.1, 0.1, 0.1) : new Color3(0.4, 0.4, 0.4)
            // create mesh
            let mesh = MeshBuilder.CreateBox(this.type ? "blackChesspiece" : "whiteChesspiece", { height: this.height, width: this.width, depth: this.depth }, this.scene);
            mesh.material = material
            mesh.position = this.position
            mesh.checkCollisions = true
            return mesh
        }
        catch (e) {
            console.log(e);
        }
        return new Mesh("null_mesh")
    }
    private inputMoveAction() {
        this.saveInputMoveAction = this.scene.onKeyboardObservable.add((kbInfo) => {
            if (this.type) {
                switch (kbInfo.type) {
                    case KeyboardEventTypes.KEYUP:
                        switch (kbInfo.event.key) {
                            case KEY.w:
                                this.moveUp()
                                break;
                            case KEY.s:
                                this.moveDown()
                                break;
                            case KEY.a:
                                this.moveLeft()
                                break
                            case KEY.d:
                                this.moveRight()
                                break
                        }
                        break;
                }
            }
            else {
                switch (kbInfo.type) {
                    case KeyboardEventTypes.KEYUP:
                        switch (kbInfo.event.key) {
                            case KEY.ArrowUp:
                                this.moveUp()
                                break
                            case KEY.ArrowDown:
                                this.moveDown()
                                break
                            case KEY.ArrowLeft:
                                this.moveLeft()
                                break
                            case KEY.ArrowRight:
                                this.moveRight()
                                break
                        }
                }
            }
        });
    }
    private detectMoveAction() {
        this.saveDetectMoveAction = this.scene.onBeforeRenderObservable.add(() => {
            if (!this.isMoving) {
                let current_move = this.waiting_move_list.shift()
                if (current_move != null) {
                    current_move()
                }
            }
        });
    }
    private detectCollision() {
        // let first = true
        this.saveDetectColission = this.scene.onBeforeRenderObservable.add(() => {
            this.scene.meshes.forEach(mesh => {
                // if (!this.type && mesh.name == "blackChesspiece") {
                //     if (!first) {
                //         if (this.mesh.intersectsMesh(mesh, false)) {
                //             this.die()
                //         }
                //     }
                //     else {
                //         first = false
                //     }
                // }
                if (this.mesh !== mesh) {
                    if (!this.type && mesh.name == "blackChesspiece") {
                        if (this.mesh.intersectsMesh(mesh, false)) {
                            this.die()
                        }
                    }
                }
            })
        })
    }
    //private process
    private move(degree: int) {
        this.isMoving = true
        const rad = Tools.ToRadians(degree)
        this.mesh.rotation = new Vector3(0, rad, 0)
        //animation
        let animation = new Animation("moveAnimation", "position", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT)
        let keys = []
        const x = this.currentXOnBoard
        const z = this.currentZOnBoard

        keys.push({ frame: 0, value: this.position });
        keys.push({ frame: 5, value: ChessBoard.position2D[this.currentXOnBoard][this.currentZOnBoard] });
        animation.setKeys(keys);
        this.mesh.animations.push(animation)
        const anim = this.scene.beginAnimation(this.mesh, 0, 5); // Bắt đầu animation

        let observable = this.scene.onBeforeRenderObservable.add(() => {
            //stop
            if (this.mesh.position.x === ChessBoard.position2D[x][z].x && this.mesh.position.z === ChessBoard.position2D[x][z].z) {
                anim.stop()
                this.isMoving = false;
                this.setPosition = ChessBoard.position2D[x][z]
                this.scene.onBeforeRenderObservable.remove(observable);
            }
        });
    }
    private moveUpProcess() {
        this.currentXOnBoard += ChessBoard.position2D.length - 1 != this.currentXOnBoard ? 1 : 0
        this.move(0)
    }
    private moveDownProcess() {
        this.currentXOnBoard -= 0 != this.currentXOnBoard ? 1 : 0
        this.move(180)
    }
    private moveLeftProcess() {
        this.currentZOnBoard -= 0 != this.currentZOnBoard ? 1 : 0
        this.move(-90)
    }
    private moveRightProcess() {
        const maxZ = ChessBoard.position2D.length > 0 ? ChessBoard.position2D[0].length : 0
        this.currentZOnBoard += maxZ - 1 != this.currentZOnBoard ? 1 : 0
        this.move(90)
    }
    //method move
    public moveUp() {
        this.waiting_move_list.push(() => { this.moveUpProcess() })
    }
    public moveDown() {
        this.waiting_move_list.push(() => { this.moveDownProcess() })
    }
    public moveLeft() {
        this.waiting_move_list.push(() => { this.moveLeftProcess() })
    }
    public moveRight() {
        this.waiting_move_list.push(() => { this.moveRightProcess() })
    }
    //die
    public die() {
        this.scene.onBeforeRenderObservable.remove(this.saveInputMoveAction)
        this.scene.onBeforeRenderObservable.remove(this.saveDetectMoveAction)
        this.scene.onBeforeRenderObservable.remove(this.saveDetectColission)
        this.scene.onBeforeRenderObservable.add(() => {
            this.mesh.visibility -= 0.05
            this.setPosition = new Vector3(this.position.x, this.position.y + 0.1, this.position.z)
            if (this.mesh.visibility <= 0) {
                this.mesh.dispose()
            }
        })
    }
}