/**
 * Created by Jie Gao on 2018-11-02.
 */

import {BaseController} from "@nolimitcity/slot-game/bin/core/base/BaseController";
import {HotZoneView} from "./HotZoneView";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {SpinEvent} from "@nolimitcity/slot-game/bin/core/spin/event/SpinEvent";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";

export class HotZone extends BaseController {

    private _view: HotZoneView;


    constructor() {
        super();
        this._view = new HotZoneView();
        this.addEventListener();
    }

    private addEventListener(): void {
        EventHandler.addEventListener(this, SpinEvent.BEFORE_START, (event: GameEvent) => this.onSpinStart());
    }

    private onSpinStart(): void {
        this._view.show();
    }

    public hide(isAborted:boolean): void {
        this._view.hide(isAborted);
    }

    public playHotZoneWinStar(): void {
        this._view.playHotZoneWinStar();
    }

    public stopHotZoneWinStar(): void {
        this._view.stopHotZoneWinStar();
    }
}