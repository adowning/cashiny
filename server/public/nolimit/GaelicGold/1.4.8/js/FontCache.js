"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontCache = void 0;
/**
 * Keeps track of loaded fonts. It does not in fact store any font data. It only remembers if the font is loaded with the FontLoader.
 *
 * Created: 2020-01-27
 * @author jonas
 */
const NolimitLauncher_1 = require("../../NolimitLauncher");
const FontFaceObserver = require("fontfaceobserver");
class FontCache {
    static get styleElement() {
        if (this._styleElement == undefined) {
            this._styleElement = document.createElement("style");
            document.head.append(this._styleElement);
        }
        return this._styleElement;
    }
    static get instance() {
        if (this._instance == undefined) {
            this._instance = new FontCache();
        }
        return this._instance;
    }
    constructor() { }
    static addFontFace(font, baseUrl) {
        if (!FontCache.instance.isFontAdded(font)) {
            //We need a new style element for each font because of firefox. It won't load fonts added to an existing style element.
            const newStyle = document.createElement("style");
            const styleString = FontCache.instance.createStyleString(font, baseUrl);
            newStyle.appendChild(document.createTextNode(styleString));
            document.head.appendChild(newStyle);
            FontCache.addedFonts.push(FontCache.createSummery(font));
        }
        const observer = new FontFaceObserver(font.family, { weight: font.weight, style: font.style });
        return observer.load(null, 10000).catch((reason) => {
            NolimitLauncher_1.NolimitLauncher.apiPlugin.warn(reason);
        });
    }
    isFontAdded(font) {
        return FontCache.addedFonts.indexOf(FontCache.createSummery(font)) >= 0;
    }
    static createSummery(font) {
        return `${font.family},${font.weight},${font.style}`;
    }
    createStyleString(font, baseUrl) {
        let weight = font.weight;
        if (isNaN(parseInt(font.weight))) {
            weight = parseInt(font.weight);
        }
        return `
@font-face {
    font-family: '${font.family}';
    src: url('${baseUrl + font.url}') format('woff');
    font-weight: ${weight};
    font-style: ${font.style};
}`;
    }
}
FontCache.addedFonts = [];
exports.FontCache = FontCache;
//# sourceMappingURL=FontCache.js.map