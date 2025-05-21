import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {IWinRatioConfig, WinRatioType} from "@nolimitcity/slot-game/bin/core/winpresentation/WinRatio";
import {LeprechaunSoundConfig} from "../LeprechaunSoundConfig";


/**
 * Class description
 *
 * Created: 2017-12-06
 * @author jonas
 */
export class SoundPlayer {
    private _currentMusic:string;

    constructor() {}

    public playNormalWinSound(winRatioConfig:IWinRatioConfig) {
        let soundName:string = "";
        switch(winRatioConfig.type) {
            case WinRatioType.TINY:
                soundName = LeprechaunSoundConfig.TINY_WIN;
                break;
            case WinRatioType.SMALL:
                soundName = LeprechaunSoundConfig.SMALL_WIN;
                break;
            case WinRatioType.MEDIUM:
                soundName = LeprechaunSoundConfig.MEDIUM_WIN;
                break;
            case WinRatioType.LARGE:
                soundName = LeprechaunSoundConfig.LARGE_WIN;
                break;
            case WinRatioType.BIG_WIN:
            case WinRatioType.MEGA_WIN:
            case WinRatioType.SUPER_MEGA_WIN:
                SlotGame.sound.fadeAmbience(0, 1000);
                soundName = LeprechaunSoundConfig.BIG_WIN_START;
                break;
            default:
                soundName = "";
                break;
        }
        SlotGame.sound.playEffect(soundName);

    }
}