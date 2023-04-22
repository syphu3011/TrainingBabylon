import { Engine, Scene, Vector3, HemisphericLight, ArcFollowCamera, Camera, Light, ArcRotateCamera, Quaternion} from "@babylonjs/core";
import { ChessPiece } from "./ChessPiece";
import { ChessBoard } from "./ChessBoard";
import { Util } from "./Util";
//BLACK CATCH WHITE
export class ChessGame {
    private canvas: HTMLCanvasElement
    private engine: Engine
    private scene: Scene
    private camera: Camera
    private light1: Light
    private light2: Light
    private light3: Light
    private light4: Light
    private savePosHaveInit: any = []
    private grid = { w: 8, h: 8 }
    private chessBoard: ChessBoard
    private chessKiller: ChessPiece
    private chessRunner: ChessPiece

    //TODO: remove it when not use
    private rotation
    constructor() {
        this.init();
    }
    private init() {
        this.createCanvas();
        this.engine = new Engine(this.canvas, true)
        this.scene = new Scene(this.engine);
        this.game()
        this.camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 4, 15, Vector3.Zero(),this.scene)
        this.camera.attachControl(this.canvas, true);
        this.camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        this.light1 = new HemisphericLight("light1", new Vector3(0, 200, -100), this.scene); // light at bottom
        this.light2 = new HemisphericLight("light2", new Vector3(0, 200, 100), this.scene);// light at top
        this.light3 = new HemisphericLight("light3", new Vector3(-100, 200, 0), this.scene); // light at left
        this.light4 = new HemisphericLight("light4", new Vector3(100, 200,0), this.scene);  // light at right
        this.rotation = this.camera.absoluteRotation.clone()
        console.log(this.camera.position)

        this.engine.runRenderLoop(() => {
            this.scene.render()
            if (this.rotation != this.camera.absoluteRotation) {
                console.log(this.camera.position)
                this.rotation = this.camera.absoluteRotation.clone()
            }
        })
    }
    //TODO: doing
    private compare2Quaternion(Quaternion1, Quaternion2) {
        if (Quaternion1._x == Quaternion2._x) {
            if (Quaternion1._y == Quaternion2._y){
                if (Quaternion1._z == Quaternion2._z){
                    if (Quaternion1._w == Quaternion2._w){

                    }
                }
            }

        }
    }
    private createCanvas() {
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);
    }
    private game() {
        this.chessBoard = new ChessBoard(-5, 5, -5, 5, this.grid, this.scene)
        let posKiller = this.randomIndex()
        let posRunner = this.randomIndex()
        this.chessKiller = new ChessPiece(posKiller.x, posKiller.z, 1, 0.75, 0.25, true, this.scene)//black piece
        this.chessRunner = new ChessPiece(posRunner.x, posRunner.z, 1, 0.75, 0.25, false, this.scene)//white piece
    }
    // it can be applied even to the case where there are many black and white chesspieces chasing each other
    private randomIndex() {
        let indexReturn = { x: Util.randomInRange(0, this.grid.w - 1), z: Util.randomInRange(0, this.grid.h - 1) }
        while (this.savePosHaveInit.includes(indexReturn)) {
            indexReturn = this.randomIndex()
        }
        this.savePosHaveInit.push(indexReturn)
        return indexReturn
    }
}