import { Tools, Scene, Vector3, Mesh, Color3, MeshBuilder, int, Animation, float, StandardMaterial, KeyboardEventTypes, AnimationGroup } from "@babylonjs/core";
import "@babylonjs/loaders";
import { ChessBoard } from "./ChessBoard";
enum KEY {
    //WASD
    W = 'w',
    S = 's',
    A = 'a',
    D = 'd',

    //Arrow direction
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight'
}
enum DIRECTION {
    LEFT = -90,
    RIGHT = 90,
    UP = 0,
    DOWN = 180,
}
export class ChessPiece {
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
    constructor(currentXOnBoard: int, currentZOnBoard: int, height: float, width: float, depth: float, type: boolean, scene: Scene) {
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
            let mesh = MeshBuilder.CreateBox(this.type ? "blackChessPiece" : "whiteChessPiece", { height: this.height, width: this.width, depth: this.depth }, this.scene);
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
                            case KEY.W:
                                this.moveUp()
                                break;
                            case KEY.S:
                                this.moveDown()
                                break;
                            case KEY.A:
                                this.moveLeft()
                                break
                            case KEY.D:
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
        if (!this.type) {
            this.saveDetectColission = this.scene.onAfterRenderObservable.add(() => {
                this.scene.meshes.forEach(mesh => {
                    if (mesh.name == "blackChessPiece") {
                        if (this.mesh.intersectsMesh(mesh, false)) {
                            this.die()
                        }
                    }
                })
            })
        }
    }
    //private process
    private move(degree: int) {
        this.isMoving = true
        const rad = Tools.ToRadians(degree)
        const x = this.currentXOnBoard
        const z = this.currentZOnBoard
        const animationRun = this.animRun()
        const animationRotate = this.animRotate(rad)
        var animationGroup = new AnimationGroup("GroupMoveAction");
        animationGroup.addTargetedAnimation(animationRun, this.mesh);
        animationGroup.addTargetedAnimation(animationRotate, this.mesh);
        animationGroup.normalize(0, 5);
        animationGroup.play(true)

        let observable = this.scene.onBeforeRenderObservable.add(() => {
            if (this.mesh.position.x === ChessBoard.position2D[x][z].x &&
                 this.mesh.position.z === ChessBoard.position2D[x][z].z) {
                animationGroup.stop()

                this.isMoving = false;
                this.setPosition = ChessBoard.position2D[x][z]
                this.scene.onBeforeRenderObservable.remove(observable);
            }
        });
    }
    private animRun(): Animation {
        let animation = new Animation("moveAnimation", "position", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT)

        let keys = []
        keys.push({ frame: 0, value: this.position });
        keys.push({ frame: 5, value: ChessBoard.position2D[this.currentXOnBoard][this.currentZOnBoard] });
        animation.setKeys(keys);

        return animation
    }
    private animRotate(radian: float): Animation {
        let animation = new Animation("rotateAnimation", "rotation", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT)
        //choose nearest radian to rotate
        let normalRad = radian
        let reverseRad = radian >= 0 ? radian - 2 * Math.PI : radian + 2 * Math.PI
        let mainRad = Math.abs(this.mesh.rotation.y - normalRad) <= Math.abs(this.mesh.rotation.y - reverseRad) ? normalRad : reverseRad

        let keys = []
        keys.push({ frame: 0, value: this.mesh.rotation});
        keys.push({ frame: 5, value: new Vector3(0,mainRad,0)});
        animation.setKeys(keys);

        return animation
    }
    private moveUpProcess() {
        this.currentXOnBoard += ChessBoard.position2D.length - 1 != this.currentXOnBoard ? 1 : 0
        this.move(DIRECTION.UP)
    }
    private moveDownProcess() {
        this.currentXOnBoard -= 0 != this.currentXOnBoard ? 1 : 0
        this.move(DIRECTION.DOWN)
    }
    private moveLeftProcess() {
        this.currentZOnBoard -= 0 != this.currentZOnBoard ? 1 : 0
        this.move(DIRECTION.LEFT)
    }
    private moveRightProcess() {
        const maxZ = ChessBoard.position2D.length > 0 ? ChessBoard.position2D[0].length : 0
        this.currentZOnBoard += maxZ - 1 != this.currentZOnBoard ? 1 : 0
        this.move(DIRECTION.RIGHT)
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
    public die() {
        this.scene.onBeforeRenderObservable.remove(this.saveInputMoveAction)
        this.scene.onBeforeRenderObservable.remove(this.saveDetectMoveAction)
        if (this.saveDetectColission !== null) {
            this.scene.onBeforeRenderObservable.remove(this.saveDetectColission)
        }
        this.scene.onBeforeRenderObservable.add(() => {
            this.mesh.visibility -= 0.05
            this.setPosition = new Vector3(this.position.x, this.position.y + 0.1, this.position.z)
            if (this.mesh.visibility <= 0) {
                this.mesh.dispose()
            }
        })
    }
}