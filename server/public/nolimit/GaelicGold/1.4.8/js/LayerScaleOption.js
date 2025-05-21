"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerScaleOption = exports.ScaleTarget = exports.ScaleMethod = void 0;
var ScaleMethod;
(function (ScaleMethod) {
    ScaleMethod["NONE"] = "none";
    ScaleMethod["FIT"] = "fit";
    ScaleMethod["FILL"] = "fill";
})(ScaleMethod = exports.ScaleMethod || (exports.ScaleMethod = {}));
var ScaleTarget;
(function (ScaleTarget) {
    ScaleTarget["NONE"] = "none";
    ScaleTarget["WINDOW"] = "window";
    ScaleTarget["STAGE"] = "stage";
})(ScaleTarget = exports.ScaleTarget || (exports.ScaleTarget = {}));
var LayerScaleOption;
(function (LayerScaleOption) {
    LayerScaleOption["NONE"] = "none";
    LayerScaleOption["FIT_STAGE"] = "fitStage";
    LayerScaleOption["FIT_WINDOW"] = "fitWINDOW";
    LayerScaleOption["FILL_STAGE"] = "fillStage";
    LayerScaleOption["FILL_WINDOW"] = "fillWindow";
    LayerScaleOption["REELS_FIT_WINDOW"] = "reelsFitWindow";
    LayerScaleOption["REELS_FIT_STAGE"] = "reelsFitStage";
})(LayerScaleOption = exports.LayerScaleOption || (exports.LayerScaleOption = {}));
//# sourceMappingURL=LayerScaleOption.js.map