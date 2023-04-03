import { Color3, Mesh, MeshBuilder, MultiMaterial, Scene, StandardMaterial, SubMesh, Vector3, int } from "@babylonjs/core";

export class ChessBoard {
    public static position2D: Vector3[][] = []
    private xmin: int
    private xmax: int
    private zmin: int
    private zmax: int
    private grid: any
    private scene: Scene
    private mesh: Mesh
    constructor(xmin = -5, xmax = 5, zmin = -5, zmax = 5, grid = { w: 8, h: 8 }, scene: Scene) {
        this.xmin = xmin
        this.xmax = xmax
        this.zmax = zmax
        this.zmin = zmin
        this.grid = grid
        this.scene = scene
        this.mesh = this.createMesh()
    }
    public get getMesh(): Mesh {
        return this.mesh
    }
    private createMesh(): Mesh {
        try {
            const tiledGround = MeshBuilder.CreateTiledGround("Tiled Ground", { xmin: this.xmin, zmin: this.zmin, xmax: this.xmax, zmax: this.zmax, subdivisions: this.grid }, this.scene);
            tiledGround.position.y = 1;
            //Create the multi material
            //Create differents materials
            const whiteMaterial = new StandardMaterial("White");
            whiteMaterial.diffuseColor = new Color3(1, 1, 1);

            const blackMaterial = new StandardMaterial("Black");
            blackMaterial.diffuseColor = new Color3(0, 0, 0);

            // Create Multi Material
            const multimat = new MultiMaterial("multi", this.scene);
            multimat.subMaterials.push(whiteMaterial);
            multimat.subMaterials.push(blackMaterial);


            // Apply the multi material
            // Define multimat as material of the tiled ground
            tiledGround.material = multimat;

            // Needed variables to set subMeshes
            const verticesCount = tiledGround.getTotalVertices();
            const indices = tiledGround.getIndices()
            const tileIndicesLength = (indices == null ? 0 : indices.length) / (this.grid.w * this.grid.h);
            let base = 0
            for (let row = 0; row < this.grid.h; row++) {
                let pos_row_ar: Vector3[] = []
                for (let col = 0; col < this.grid.w; col++) {
                    let submesh = new SubMesh(row % 2 ^ col % 2, 0, verticesCount, base, tileIndicesLength, tiledGround)
                    tiledGround.subMeshes.push(submesh);
                    // let subMeshPosition = Vector3.Zero();
                    let boundingInfo = submesh.getBoundingInfo();
                    const position = boundingInfo.boundingBox.center
                    position.y = 1.5
                    pos_row_ar.push(position);
                    // pos_ar.push(new BABYLON.Vector3(range_x-col, 1,range_z-row));
                    base += tileIndicesLength;
                }
                ChessBoard.position2D.push(pos_row_ar);
            }
            return tiledGround
        }
        catch (e) {
            console.log(e);
        }
        return new Mesh("null_mesh")
    }
}