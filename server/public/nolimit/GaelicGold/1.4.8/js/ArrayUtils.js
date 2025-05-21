"use strict";
/**
 * Created by jonas on 2021-02-02.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtils = void 0;
class ArrayUtils {
    static sum(array) {
        return array.reduce(((previousValue, currentValue) => {
            return previousValue + currentValue;
        }));
    }
    static multiplyAll(array) {
        return array.reduce(((previousValue, currentValue) => {
            return previousValue * currentValue;
        }));
    }
    static isAllTrue(array) {
        return !ArrayUtils.isAnyFalse(array);
    }
    static isAnyFalse(array) {
        for (let value of array) {
            if (!value) {
                return true;
            }
        }
        return false;
    }
    static isAllFalse(array) {
        return !ArrayUtils.isAnyTrue(array);
    }
    static isAnyTrue(array) {
        for (let value of array) {
            if (value) {
                return true;
            }
        }
        return false;
    }
    static shuffleArray(array) {
        let a = array.concat();
        for (let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
        return a;
    }
    /**
     * Removes any duplicates from array.
     * @param a
     */
    static unique(a) {
        return Array.from(new Set(a));
    }
    /**
     * Returns indices for all elements in array where it matches callback condition.
     *
     * @param array Search array
     * @param callback Conditional callback to execute on each element.
     */
    static getIndicesWhere(array, callback) {
        const result = [];
        for (let i = 0; i < array.length; i++) {
            if (callback(array[i], i)) {
                result.push(i);
            }
        }
        return result;
    }
}
exports.ArrayUtils = ArrayUtils;
//# sourceMappingURL=ArrayUtils.js.map