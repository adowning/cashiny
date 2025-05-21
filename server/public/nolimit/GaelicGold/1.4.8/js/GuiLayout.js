"use strict";
/**
 * Created by jonas on 2019-10-23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiLayout = exports.Direction = exports.Align = void 0;
var Align;
(function (Align) {
    Align[Align["LEFT"] = 0] = "LEFT";
    Align[Align["TOP"] = 0] = "TOP";
    Align[Align["CENTER"] = 0.5] = "CENTER";
    Align[Align["RIGHT"] = 1] = "RIGHT";
    Align[Align["BOTTOM"] = 1] = "BOTTOM";
})(Align = exports.Align || (exports.Align = {}));
var Direction;
(function (Direction) {
    Direction[Direction["VERTICAL"] = 0] = "VERTICAL";
    Direction[Direction["HORIZONTAL"] = 1] = "HORIZONTAL";
})(Direction = exports.Direction || (exports.Direction = {}));
class GuiLayout {
    static justify(objects, length, align, direction) {
        align = align != undefined ? align : 0;
        direction = direction != undefined ? direction : Direction.HORIZONTAL;
        let objTotalLength = 0;
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            const bounds = obj.getLocalBounds();
            if (direction == Direction.VERTICAL) {
                objTotalLength += bounds.bottom;
            }
            else {
                objTotalLength += bounds.right;
            }
        }
        const margin = (length - objTotalLength) / (objects.length - 1);
        GuiLayout.align(objects, margin, align, direction);
    }
    /**
     *
     * @param objects Object to justify, will start at 0,0. (So place them in a contaier if you want to meve then as a group.
     * @param margin Margin betwqeen items
     * @param align Aligns the object relative to each other if they are different sizes.
     * @param direction Default JustificationDirection.HORIZONTAL
     */
    static align(objects, margin, align, direction) {
        margin = margin != undefined ? margin : 0;
        align = align != undefined ? align : 0;
        direction = direction != undefined ? direction : Direction.HORIZONTAL;
        let advance = 0;
        let largestSize = 0;
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            const bounds = obj.getLocalBounds();
            if (direction == Direction.VERTICAL) {
                obj.position.y = advance;
                advance += bounds.bottom + margin;
                largestSize = bounds.right > largestSize ? bounds.right : largestSize;
            }
            else {
                obj.position.x = advance;
                advance += bounds.right + margin;
                largestSize = bounds.bottom > largestSize ? bounds.bottom : largestSize;
            }
        }
        for (let obj of objects) {
            const bounds = obj.getLocalBounds();
            if (direction == Direction.VERTICAL) {
                obj.position.x = (largestSize - bounds.right) * align;
            }
            else {
                obj.position.y = (largestSize - bounds.bottom) * align;
            }
        }
    }
    static modifyMargin(object, margin, direction, relativeToObject) {
        margin = margin != undefined ? margin : 0;
        //align = align != undefined ? align : 0;
        direction = direction != undefined ? direction : Direction.HORIZONTAL;
        let advance = 0;
        const bounds = object.getLocalBounds();
        let relativeBounds;
        let relativeGlobals;
        let relativeBottom = 0;
        let relativeRight = 0;
        if (relativeToObject) {
            relativeBounds = relativeToObject.getLocalBounds();
            relativeGlobals = relativeToObject.getGlobalPosition();
            relativeBottom = relativeBounds.bottom + relativeGlobals.y;
            relativeRight = relativeBounds.right + relativeGlobals.x;
        }
        if (direction == Direction.VERTICAL) {
            advance = (relativeToObject) ? relativeBottom : 0; // TODO: probably bounds.bottom
            advance += bounds.bottom + margin;
            object.position.y = advance;
        }
        else {
            advance = (relativeToObject) ? relativeRight : 0;
            advance += bounds.right + margin;
            object.position.x = advance;
        }
    }
    static getLargestSize(objects) {
        const size = new PIXI.Point(0, 0);
        for (let obj of objects) {
            const bounds = obj.getBounds();
            size.x = bounds.right > size.x ? bounds.right : size.x;
            size.y = bounds.bottom > size.y ? bounds.bottom : size.y;
        }
        return size;
    }
    static gridLayout(objects, maxWidth) {
        //Find largest size
        let largestWidth = 0;
        let largestHeight = 0;
        for (let obj of objects) {
            const bounds = obj.getBounds();
            largestWidth = bounds.width > largestWidth ? bounds.width : largestWidth;
            largestHeight = bounds.height > largestHeight ? bounds.height : largestHeight;
        }
        const buttonsWillFit = Math.floor(maxWidth / largestWidth);
        const maxButtonsInRow = buttonsWillFit; // Math.min(buttonsWillFit, BetLevelsView.DEFAULT_ROW_MAX);
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            obj.x = Math.floor(i % maxButtonsInRow) * largestWidth;
            obj.y = Math.floor(i / maxButtonsInRow) * largestHeight;
        }
    }
    static offset(objects, xOffset = 0, yOffset = 0) {
        for (let obj of objects) {
            obj.x += xOffset;
            obj.y += yOffset;
        }
    }
}
exports.GuiLayout = GuiLayout;
//# sourceMappingURL=GuiLayout.js.map