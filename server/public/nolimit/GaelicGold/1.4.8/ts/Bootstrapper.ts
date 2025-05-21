/**
 * Created by Ning Jiang on 11/17/2016.
 */



import ("pixi.js");
declare global {
    interface Window {
        PIXI:any;
    }
}
import * as PIXI from "pixi.js";
window.PIXI = PIXI;
require ("pixi-spine");
import {NolimitLauncher} from "@nolimitcity/slot-launcher/bin/NolimitLauncher";
import {SlotKeypad} from "@nolimitcity/slot-keypad/bin/SlotKeypad";
import {NolimitPromotionPlugin} from "@nolimitcity/promo-panel/bin/NolimitPromotionPlugin";
import {Leprechaun} from "./game/Leprechaun";
import {NolimitGameIntroPlugin} from "@nolimitcity/slot-launcher/bin/plugins/concreteplugins/NolimitGameIntroPlugin";
import {LeprechaunIntroConfig} from "./game/intro/LeprechaunIntroConfig";
import {NolimitSlotAudio} from "@nolimitcity/slot-audio/bin/NolimitSlotAudio";

declare global {
    interface Window { NolimitLauncher: NolimitLauncher;}
}
window.NolimitLauncher = NolimitLauncher.instance;
import {GaelicGoldPromoPanelConfig} from "./game/GaelicGoldPromoPanelConfig";
NolimitLauncher.instance.launch([
    new Leprechaun(),
    new SlotKeypad(),
    new NolimitPromotionPlugin(new GaelicGoldPromoPanelConfig()),
    new NolimitGameIntroPlugin(new LeprechaunIntroConfig),
    new NolimitSlotAudio(),
]);
