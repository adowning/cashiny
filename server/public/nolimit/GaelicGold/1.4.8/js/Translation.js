"use strict";
/**
 * Created by Ning Jiang on 6/15/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translation = void 0;
class Translation {
    constructor(apiAdapter) {
        if (Translation._apiAdapter) {
            debugger;
            throw new Error("Error: Translation.constructor() - Instantiation failed: Singleton.");
        }
        Translation._apiAdapter = apiAdapter;
    }
    static translate(text) {
        return Translation._apiAdapter.translate(text);
    }
}
exports.Translation = Translation;
//# sourceMappingURL=Translation.js.map