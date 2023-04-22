import { Tools, Vector3 } from "@babylonjs/core";

export class Util {
    public static randomInRangeExcept(min: number, max: number, except: number): number {
        let result = Math.floor(Math.random() * (max - min + 1)) + min;
        if (result === except) {
            return Util.randomInRangeExcept(min, max, except);
        }
        return result;
    }
    // it can be infinite loop. Be careful!
    public static randomInRangeExceptArray(min: number, max: number, array: number[]) {
        let num = Math.floor(Math.random() * (max - min + 1)) + min;
        while (array.includes(num)) {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
        }
        return num;
    }
    public static randomInRange(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // 2D OXZ
    public static calculateDegree(startPoint: Vector3,previousPoint: Vector3, currentPoint: Vector3) {
        const lengthStartToPrevious = this.calculateLength2Point(startPoint, previousPoint)
        const lengthStartToCurrent = this.calculateLength2Point(startPoint, currentPoint)
        try {
            const cornerRadius2Straight = Math.acos(lengthStartToPrevious / lengthStartToCurrent)
            return Tools.ToDegrees(cornerRadius2Straight)
        }
        catch(e) {
            return 0
        }
    }
    public static calculateLength2Point(point1: Vector3, point2: Vector3) {
        return Math.sqrt(Math.pow(point1._x - point2._x, 2) + Math.pow(point1._z - point2._z, 2))
    }
    // public static calculate
}