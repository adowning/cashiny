"use strict";
/**
 * Created by Jonas Wålekvist on 2019-09-24.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiUtils = void 0;
class GuiUtils {
    /**
     * @param argb ARGB number E.g 0x80FF0000, (red with 50% alpha)
     * @return number Alpha fromm 0 to 1.
     */
    static getAlphaFromARGB(argb) {
        return ((argb >> 24) & 0xFF) / 0xFF;
    }
    /**
     * Strips A from ARGB.
     *
     * @param argb ARGB number E.g 0x80FF0000, (red with 50% alpha)
     * @return Color RGB as number E.g 0xFF0000 (red)
     */
    static getColorFromARGB(argb) {
        return argb & 0xffffff;
    }
    /**
     * Converts normal 0xrrggbb color to argb
     *
     * @return ARGB as number E.g 0xFF000000 (alpha 1 black)
     * @param color
     * @param alpha
     */
    static getARGB(color, alpha = 1) {
        return alpha * 0xFF << 24 | color;
    }
    /**
     * Converts a PIXI.Matrix to a string formatted as matrix used as a parameter to css transform
     * @param m PIXI.Matrix
     */
    static pixiMatrixToCSSMatrix(m) {
        return 'matrix(' + [m.a, m.b, m.c, m.d, m.tx, m.ty].join(',') + ')';
    }
    static getDOMRelativeWorldTransform(renderer, parent, bounds) {
        //bounds = renderer.view.getBoundingClientRect(); //Might need this if scrollCrap is making it not work for some reason.
        let matrix = parent.worldTransform.clone();
        matrix.scale(renderer.resolution, renderer.resolution);
        matrix.scale(bounds.width / renderer.width, bounds.height / renderer.height);
        return matrix;
    }
}
exports.GuiUtils = GuiUtils;
//# sourceMappingURL=GuiUtils.js.map