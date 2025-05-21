"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepList = void 0;
/**
 * Created by jonas on 2021-03-08.
 *
 * Utility class for a array that keeps track of a current index.
 * This makes it easy to get the next item on the list and it will wrap around.
 *
 * Optionally it can be randomized at wrap around.
 *
 * On creation the .current() will return the last object in the list. So if randomizeAtWrapAround is set
 * it will randomize the list on the fist use of next().
 *
 */
const ArrayUtils_1 = require("./ArrayUtils");
class StepList {
    /**
     * @param list Non empty array of T
     */
    constructor(list) {
        this._randomizeOnWrapAround = false;
        this._wrapAround = false;
        if (list.length <= 0) {
            throw new Error("List can't be empty.");
        }
        this._list = list;
        this._index = 0;
    }
    get length() {
        return this._list.length;
    }
    ;
    replaceList(list) {
        if (list.length <= 0) {
            throw new Error("List can't be empty.");
        }
        this._list = list;
        this._index = this.wrapIndex(this._index);
    }
    /**
     * Resets index so that .next() will return the first element in the list,
     * .current() would return the last object in the list.
     */
    reset() {
        this._index = this._list.length - 1;
    }
    setIndex(newIndex) {
        this._index = this.wrapIndex(newIndex);
    }
    /**
     * Returns the next item on the list
     */
    next() {
        const index = this.increment();
        return this._list[index];
    }
    /**
     * Returns the prev item on the list
     */
    prev() {
        const index = this.decrement();
        return this._list[index];
    }
    /**
     * Returns the current value of the list.
     */
    current() {
        return this._list[this._index];
    }
    isFirst() {
        return this._index == 0;
    }
    isLast() {
        return this._index == this._list.length - 1;
    }
    /**
     * Sets randomizeOnWrapAround, it also returns it self so the call can be chained with it's creation. Eg.
     *
     * const loopableList<number> = new LoopableList([1,2,3]).setRandomizeAtWrapAround(true);
     *
     * @param randomize
     * @return LoopableList - Self.
     */
    setRandomizeAtWrapAround(randomize) {
        this._randomizeOnWrapAround = randomize;
        return this;
    }
    setWrapAround(wrap) {
        this._wrapAround = wrap;
        return this;
    }
    /**
     * Returns a copy of the array that is the base of the list and optionally shuffles it before returning.
     * @param randomize
     */
    getListClone(randomize) {
        if (randomize) {
            return ArrayUtils_1.ArrayUtils.shuffleArray(this._list);
        }
        return this._list.concat();
    }
    increment() {
        this._index = this.wrapIndex(++this._index);
        return this._index;
    }
    decrement() {
        this._index = this.wrapIndex(--this._index);
        return this._index;
    }
    wrapIndex(index) {
        if (index >= this._list.length) {
            if (this._wrapAround) {
                index = 0;
                if (this._randomizeOnWrapAround) {
                    this._list = ArrayUtils_1.ArrayUtils.shuffleArray(this._list);
                }
            }
            else {
                index = this._list.length - 1;
            }
        }
        else if (index < 0) {
            if (this._wrapAround) {
                index = this._list.length - 1;
            }
            else {
                index = 0;
            }
        }
        return index;
    }
    getFirstValue() {
        return this._list[0];
    }
    getLastValue() {
        return this._list[this._list.length - 1];
    }
}
exports.StepList = StepList;
//# sourceMappingURL=StepList.js.map