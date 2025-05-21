"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MathHelper = exports.isNumber = void 0;
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
/**
 * Created by Jerker Nord on 2016-04-13.
 */
class MathHelper {
    /**
     * Returns a floored number with the chosen amount of decimals
     * @param value
     * @param decimals
     * @returns {number}
     */
    static floorToDecimals(value, decimals) {
        return Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    /**
     * Returns a ceiled number with the chosen amount of decimals
     * @param value
     * @param decimals
     * @returns {number}
     */
    static ceilToDecimals(value, decimals) {
        return Math.ceil(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    static roundToDecimals(num, noOfDecimals) {
        return Number((num).toFixed(noOfDecimals));
    }
    static randomNumberInRange(min, max, decimals = 0) {
        let randomNumber = min + (max - min) * Math.random();
        return Number(randomNumber.toFixed(decimals));
    }
    static randomIntInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * Constrains a number to be within a range.
     *
     * Returns
     * value: if x is between min and max
     * min: if x is less than min
     * max: if x is greater than max
     *
     * @param value The value you want to constrain
     * @param min the minimum return value
     * @param max the maximum return value
     * @returns {number}
     */
    static constrain(value, min, max) {
        return Math.max(min, Math.min(value, max));
    }
    static isInRange(value, min, max) {
        return value >= min && value <= max;
    }
    /**
     * Maps value x in range inStart -> inEnd to range outStart -> outEnd.
     *
     * @param x Value to map to new range. x is a value in the in range.
     * @param inStart Start value in in range.
     * @param inEnd End value in in range.
     * @param outStart Start value in out range.
     * @param outEnd   End value in out range.
     * @returns {number}
     */
    static map(x, inStart, inEnd, outStart, outEnd) {
        return (x - inStart) * (outEnd - outStart) / (inEnd - inStart) + outStart;
    }
    /**
     * Returns angle between two points in radians.
     * @param p1 first point
     * @param p2 second point
     * @returns {number} Angle
     */
    static angleBetweenPoints(p1, p2) {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }
    /* SH: Please don't use these due to duplication of methods otherwise. */
    static addPoints(p1, p2) { return this.pointAdd(p1, p2); }
    static subPoints(p1, p2) { return this.pointSub(p1, p2); }
    static multiplyPoints(p1, p2) { return this.pointMul(p1, p2); }
    static dividePoints(p1, p2) { return this.pointDiv(p1, p2); }
    /* SH: Updated TypeScript definition for point Calculations. */
    /**
     * Returns new Point depending on math function.
     * @param p1 first point
     * @param p2n Point or number.
     * @returns {number} Angle
    */
    static pointAdd(p1, p2n) {
        if (isNumber(p2n))
            return new PIXI.Point(p1.x + p2n, p1.y + p2n);
        return new PIXI.Point(p1.x + p2n.x, p1.y + p2n.y);
    }
    static pointSub(p1, p2n) {
        if (isNumber(p2n))
            return new PIXI.Point(p1.x - p2n, p1.y - p2n);
        return new PIXI.Point(p1.x - p2n.x, p1.y - p2n.y);
    }
    static pointMul(p1, p2n) {
        if (isNumber(p2n))
            return new PIXI.Point(p1.x * p2n, p1.y * p2n);
        return new PIXI.Point(p1.x * p2n.x, p1.y * p2n.y);
    }
    static pointDiv(p1, p2n) {
        if (isNumber(p2n))
            return new PIXI.Point(p1.x / p2n, p1.y / p2n);
        return new PIXI.Point(p1.x / p2n.x, p1.y / p2n.y);
    }
    /* -------------------------------------------------------- */
    static vectorMagnitude(p1) {
        return Math.sqrt(p1.x * p1.x + p1.y * p1.y);
    }
    static normalizeVector(p1) {
        const m = MathHelper.vectorMagnitude(p1);
        if (m > 0) {
            return MathHelper.pointDiv(p1, m);
        }
        return new PIXI.Point();
    }
    /**
     * A new PIXI.Point along a line defined by it's two end points
     * @param p1 first point
     * @param p2 second point
     * @param ratio The distance ratio from p1 to p2. Negative ratio is on the extended line before p1, ratio > 1 on extended line after p2. ratio > 0 && < 1 is on the line.
     * @returns {number} Distance
     */
    static pointAlongLine(p1, p2, ratio) {
        let t = ratio;
        return new PIXI.Point(((1 - t) * p1.x + t * p2.x), ((1 - t) * p1.y + t * p2.y));
    }
    /**
     * Returns distance between two points.
     * @param p1 first point
     * @param p2 second point
     * @returns {number} Distance
     */
    static distanceBetweenPoints(p1, p2) {
        return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }
    /**
     * Creates a random point within a rectangle.
     *
     * @param rect The rectangle to get random numbers within, including edge values.
     * @param mask A rectangle that functions as mask, masking of the area from the fist rectangle.
     * So random points within the mask will be recalculated and ignored. You can use this to a variety of shapes.
     * @returns {PIXI.Point} Random point
     */
    static randomPosInRect(rect, mask) {
        let randomPos = new PIXI.Point(MathHelper.randomIntInRange(rect.x, rect.width + rect.x), MathHelper.randomIntInRange(rect.y, rect.height + rect.y));
        let missed = 0;
        if (mask) {
            while (mask.contains(randomPos.x, randomPos.y)) {
                randomPos = new PIXI.Point(MathHelper.randomIntInRange(rect.x, rect.width + rect.x), MathHelper.randomIntInRange(rect.y, rect.height + rect.y));
                missed++; //Only used for debugging, to se how many times the function have to recalculate the random point.
            }
        }
        return randomPos;
    }
    /**
     * How much distance is left with the current velocity, time and acceleration.
     * @param v Velocity.
     * @param t Time.
     * @param a Acceleration.
     * @returns {number} Acceleration.
    */
    static DistanceByVTA(v, t, a) { return (v * t) + (a * Math.pow(t, 2)) / 2; }
    /**
     * What is the acceleration from the current velocity on the amount of distance left with the remaining time to reach it.
     * @param v Velocity.
     * @param d Distance.
     * @param t Time.
     * @returns {number} Acceleration.
    */
    static accCalcByVDT(v, d, t) { return 2 * (d - (v * t)) / Math.pow(t, 2); }
    /**
     * What is the acceleration between two velocity with the amount of distance left.
     * @param vT Velocity To.
     * @param vF Velocity From.
     * @param d Distance.
     * @returns {number} Acceleration.
     */
    static accCalcByVVD(vT, vF, d) { return (Math.pow(vT, 2) - Math.pow(vF, 2)) / (d * 2); }
    /**
     * How long will it take to go from one Velocity to another.
     * @param vT Velocity To.
     * @param vF Velocity From.
     * @param a Acceleration.
     * @returns {number} Time in Seconds
    */
    static timeByVVA(vT, vF, a) { return (vT - vF) / a; }
    /**
     * Get the common timeValue.
     * @param val
     * @param fps
    */
    static frameToSeconds(val, fps = 30) { return val / fps; }
    static secondsToFrame(val, fps = 30) { return val * fps; }
    /**
       * Shuffles the array.
       * /This one is obselete, please use the one in ArrayHelper.
       * @param array Any
   */
    static shuffleArray(array) {
        let a = array.concat();
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
        return a;
    }
    /* SH -- Rotation hack for pixi. */
    // 0|1 == 360.  2 = 180 <--> Degree
    static normalizedRotation(rotation) { return (Math.PI * 2) / rotation; }
    // 360/5 = 72 steps of an circle;
    static degreeToAngle(degree) { return this.normalizedRotation(360 / degree); }
}
exports.MathHelper = MathHelper;
//# sourceMappingURL=MathHelper.js.map