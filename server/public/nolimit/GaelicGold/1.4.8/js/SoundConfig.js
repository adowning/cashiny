"use strict";
/**
 * Created by Ning Jiang on 11/24/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundConfig = void 0;
class SoundConfig {
    static set soundConfig(value) {
        SoundConfig._soundConfig = value;
    }
    static get instance() {
        return SoundConfig._soundConfig;
    }
}
exports.SoundConfig = SoundConfig;
//# sourceMappingURL=SoundConfig.js.map