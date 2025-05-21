/**
 * Created by Ning Jiang on 6/12/2019.
 */

import {BetLineEvent} from "@nolimitcity/slot-game/bin/core/betline/event/BetLineEvent";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {IScreenConfig} from "@nolimitcity/slot-game/bin/core/screen/ScreenController";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {SpinEvent} from "@nolimitcity/slot-game/bin/core/spin/event/SpinEvent";
import {FreespinOutroController} from "@nolimitcity/slot-game/bin/game/screen/freespinoutro/FreespinOutroController";
import {LeprechaunBetlineEvent} from "../../betline/LeprechaunBetlineEvent";
import {LeprechaunParsedGameData} from "../../server/data/LeprechaunParsedGameData";

export class LeprechaunOutroController extends FreespinOutroController {

    private _hasWin:boolean = false;
    private _toHideExtraBetlineNumber:boolean = false;

    constructor(config:IScreenConfig) {
        super(config);
    }

    protected parseFeatureGameData(data:LeprechaunParsedGameData):void {
        this._hasWin = (data.singleWin > 0);
    }

    protected addFeatureEventHandlers():void {
        EventHandler.addEventListener(this, SpinEvent.START, (event:GameEvent) => this.onSpinStart());
    }

    private onSpinStart():void {
        if(this._toHideExtraBetlineNumber) {
            this._toHideExtraBetlineNumber = false;
            EventHandler.dispatchEvent(new GameEvent(LeprechaunBetlineEvent.HIDE_RAINBOW_NUMBER));
        }
    }

    // Return false if it only does some restore/transition but no need to show. eg: restore in the middle of Freespin.
    protected show():boolean {
        if(this.shouldShow()) {
            this._toHideExtraBetlineNumber = true;
            this._view.show(this._serverData!, () => this.onShowComplete());
            this.hideKeypad();
            EventHandler.dispatchEvent(new GameEvent(BetLineEvent.SET_ENABLED, false));
            EventHandler.dispatchEvent(new GameEvent(BetLineEvent.HIDE_ALL_BET_LINES));
            // EventHandler.dispatchEvent(new GameEvent(StageEvent.WANT_RESIZE));
            this._isShowing = true;
        }

        // When restore in freespin, don't show the intro but we need the intro to init the freespin scene.
        if(this.doTransitions) {
            this.doTransitions();
        }
        SlotGame.keypad.setZeroBetSpinCounter(-1);
        return this._isShowing;
    }

    protected close():void {
        this._toHideExtraBetlineNumber = this._hasWin;
        if(!this._hasWin) {
            EventHandler.dispatchEvent(new GameEvent(LeprechaunBetlineEvent.HIDE_RAINBOW_NUMBER));
        }
        super.close();
    }
}