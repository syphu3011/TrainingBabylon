import { Engine, Scene, Vector3, HemisphericLight, ArcFollowCamera} from "@babylonjs/core";
import { ChessPiece } from "./ChessPiece";
import { ChessBoard } from "./ChessBoard";
import { Util } from "./Util";
//BLACK CATCH WHITE
export class ChessGame {
    private canvas: any
    private engine: any
    private scene: any
    private camera: any
    private light1: any
    private light2: any
    private light3: any
    private light4: any
    private savePosHaveInit: any = []
    private grid = { w: 8, h: 8 }
    private chessBoard: ChessBoard
    constructor() {
        this.init();
    }
    private init() {
        this.createCanvas();
        this.engine = new Engine(this.canvas, true)
        this.scene = new Scene(this.engine);
        this.game()
        this.camera = new ArcFollowCamera('camera', -Math.PI / 2, Math.PI / 4, 15, this.chessBoard.getMesh, this.scene);
        this.camera.attachControl(this.canvas, true);
        this.light1 = new HemisphericLight("light1", new Vector3(0, 6, 1), this.scene); // light at bottom
        this.light2 = new HemisphericLight("light2", new Vector3(0, 6, 16), this.scene);// light at top
        this.light3 = new HemisphericLight("light3", new Vector3(1, 6, 0), this.scene); // light at left
        this.light4 = new HemisphericLight("light4", new Vector3(16, 6,), this.scene);  // light at right
        this.engine.runRenderLoop(() => {
            this.scene.render()
        })
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
        let chessKiller = new ChessPiece(posKiller.x, posKiller.z, 1, 0.75, 0.25, true, this.scene)//black piece
        let chessRunner = new ChessPiece(posRunner.x, posRunner.z, 1, 0.75, 0.25, false, this.scene)//white piece
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