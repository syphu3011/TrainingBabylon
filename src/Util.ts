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
}