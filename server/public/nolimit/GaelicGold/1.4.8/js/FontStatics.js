"use strict";
/**
 * Created by Jonas Wålekvist on 2020-01-27.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontType = exports.FontStyle = exports.FontWeight = void 0;
// https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
var FontWeight;
(function (FontWeight) {
    FontWeight["THIN"] = "100";
    FontWeight["EXTRA_LIGHT"] = "200";
    FontWeight["ULTRA_LIGHT"] = "200";
    FontWeight["LIGHT"] = "300";
    FontWeight["NORMAL"] = "400";
    FontWeight["REGULAR"] = "400";
    FontWeight["MEDIUM"] = "500";
    FontWeight["SEMI_BOLD"] = "600";
    FontWeight["DEMI_BOLD"] = "600";
    FontWeight["BOLD"] = "700";
    FontWeight["EXTRA_BOLD"] = "800";
    FontWeight["ULTRA_BOLD"] = "800";
    FontWeight["BLACK"] = "900";
    FontWeight["HEAVY"] = "900";
})(FontWeight = exports.FontWeight || (exports.FontWeight = {}));
// https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
var FontStyle;
(function (FontStyle) {
    FontStyle["NORMAL"] = "normal";
    FontStyle["ITALIC"] = "italic";
    FontStyle["OBLIQUE"] = "oblique";
})(FontStyle = exports.FontStyle || (exports.FontStyle = {}));
var FontType;
(function (FontType) {
    FontType["EOT"] = "embedded-opentype";
    FontType["WOFF2"] = "woff2";
    FontType["WOFF"] = "woff";
    FontType["TTF"] = "truetype";
    FontType["SVG"] = "svg";
    FontType["OTF"] = "opentype";
})(FontType = exports.FontType || (exports.FontType = {}));
//# sourceMappingURL=FontStatics.js.map