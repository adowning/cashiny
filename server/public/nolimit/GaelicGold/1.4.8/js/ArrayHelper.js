"use strict";
/**
 * Created by Ning Jiang on 1/31/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayHelper = void 0;
class ArrayHelper {
    static initArrayWithValues(length, creator) {
        const array = [];
        for (let i = 0; i < length; i++) {
            array.push(creator(i));
        }
        return array;
    }
    static getRandomElementFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    static arraySum(array) {
        return array.reduce((a, b) => {
            return a + b;
        }, 0);
    }
    /**
     * Check if a value is out of reach of the supplied range.
     * Returns the "flipped" index of the range.
     * @param length the range start from index 0.
     * @param index
     * @returns {number}
     */
    static reviseIndexInLoopRange(length, index) {
        if (length <= 0) {
            debugger;
            throw new Error(`Error: ArrayHelper.getValueInLoopRange(): length must bigger than zero!`);
        }
        if (index > (length - 1)) {
            return index % length;
        }
        if (index < 0) {
            return length - (Math.abs(index) % length);
        }
        return index;
    }
    static removeFirstMatchElement(array, element) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] === element) {
                array.splice(i, 1);
                return;
            }
        }
    }
    static removeFirstMatchElementWithCondition(array, condition) {
        for (let i = 0; i < array.length; i++) {
            if (condition(array[i])) {
                array.splice(i, 1);
                return;
            }
        }
    }
    static getFirstElement(array) { return array[0]; }
    static getLastElement(array) { return array[array.length - 1]; }
    static shuffle(array) {
        let a = array.concat();
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
        return a;
    }
}
exports.ArrayHelper = ArrayHelper;
//# sourceMappingURL=ArrayHelper.js.map