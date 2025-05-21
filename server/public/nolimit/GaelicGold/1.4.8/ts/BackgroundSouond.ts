/**
 * Created by Jie Gao on 2019-02-12.
 */
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {LeprechaunParsedInitData} from "../server/data/LeprechaunParsedInitData";
import {ScreenEvent} from "@nolimitcity/slot-game/bin/core/screen/event/ScreenEvent";
import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {LeprechaunSoundConfig} from "../LeprechaunSoundConfig";
import {BaseController} from "@nolimitcity/slot-game/bin/core/base/BaseController";

export class BackgroundSound extends BaseController {
    private _mode:string;
    private _isRestore:boolean;

    constructor() {
        super();
        this._mode = GameMode.NORMAL;
        this.addEventListeners();
    }

    private addEventListeners():void {
        EventHandler.addEventListener(this, ServerEvent.INIT_DATA_PARSED, (event:GameEvent) => this.parsedInitData(event.params[0]));
        EventHandler.addEventListener(this, ScreenEvent.GAME_START, (event:GameEvent) => this.onGameReady());
    }

    private parsedInitData(data:LeprechaunParsedInitData):void {
        this._mode = data.mode;
        this._isRestore = data.isRestoreState;
    }

    private onGameReady():void {
        if(this._isRestore){
            const soundConfig:any = LeprechaunSoundConfig.instance;
            const isFreeSpin:boolean = this._mode === GameMode.FREESPIN;
            const soundName:string = (isFreeSpin?soundConfig.FREE_SPIN_AMBIANCE:soundConfig.BONUS_GAME_AMBIANCE);
            SlotGame.sound.fadeAmbience(0, 50);
            SlotGame.sound.playAmbience(soundName);
            SlotGame.sound.fadeAmbience(1, 50);
            this._isRestore = false;
        }
    }
}