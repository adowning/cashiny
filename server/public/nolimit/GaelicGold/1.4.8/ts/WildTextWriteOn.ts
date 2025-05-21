/**
 * Created by Jie Gao on 25/01/19.
 */
import {ReelStopPresentationController} from "@nolimitcity/slot-game/bin/core/reelstoppresentation/ReelStopPresentationController";
import {IReelStoppedData} from "@nolimitcity/slot-game/bin/core/reel/reel/ReelController";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";
import {LeprechaunReelSymbolWild} from "../symbols/LeprechaunReelSymbolWild";
import {Reels} from "@nolimitcity/slot-game/bin/core/reel/reelarea/Reels";
import {TimelineLite} from "gsap";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {LeprechaunSoundConfig} from "../LeprechaunSoundConfig";

export class WildTextWriteOn extends ReelStopPresentationController {
    private _hasEntireWilds:boolean[] = [];
    private _hasWilds:boolean[] = [];
    private _hasWin:boolean = false;

    constructor(index:number) {
        super(index, "WildTextWriteOn");
    }

    protected parseFeatureGameData(data:LeprechaunParsedGameData):void {
        this._hasEntireWilds = [];
        this._hasWilds = [];
        this._hasWin = data.singleWin>0;
        data.reels.forEach((reel:string[],i:number) => {
            this._hasEntireWilds.push(reel[2] === "W*0");
            this._hasWilds.push(data.doReelNudge[i]);
        });
    }

    public onReelBounce(data:IReelStoppedData):void {
        if(!this.tryPlayBouncePresentation(data)) {
            this.dispatchCompleteEvent(data.reelId);
        }
    }

    private tryPlayBouncePresentation(data:IReelStoppedData):boolean {
        const reelId:number = data.reelId;
        if(this._hasWilds[reelId]){
            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.NUDGE_START);
        }
        if(this._hasEntireWilds[reelId]) {
            const symbol:LeprechaunReelSymbolWild = <LeprechaunReelSymbolWild>Reels.getSymbol(reelId, 0);
            const tl:TimelineLite = new TimelineLite();
            tl.add(symbol.playWriteOnWild());
            tl.add(()=> this.dispatchCompleteEvent(data.reelId));
            if(!this._hasWin){
                tl.progress(1);
            }
            return true;
        }
        return false;
    }
}
