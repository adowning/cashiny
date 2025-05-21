/**
 * Created by Ning Jiang on 5/8/2018.
 */

import {IFontsConfig} from "@nolimitcity/slot-game/bin/core/resource/font/IFontsConfig";
import {FontStyle, FontType, FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";

export class LeprechaunFontConfig {

    public static FONTS:IFontsConfig = {
        OpenSans_Regular : {
            fontFamily : "Open Sans",
            src : [
                {url : "fonts/OpenSans-Regular.woff2", format : FontType.WOFF2},
                {url : "fonts/OpenSans-Regular.woff", format : FontType.WOFF},
                {url : "fonts/OpenSans-Regular.ttf", format : FontType.TTF}
            ],
            fontWeight : FontWeight.NORMAL,
            fontStyle : FontStyle.NORMAL
        },
        OpenSans_Light : {
            fontFamily : "Open Sans",
            src : [
                {url : "fonts/OpenSans-Light.woff2", format : FontType.WOFF2},
                {url : "fonts/OpenSans-Light.woff", format : FontType.WOFF},
                {url : "fonts/OpenSans-Light.ttf", format : FontType.TTF}
            ],
            fontWeight : FontWeight.LIGHT,
            fontStyle : FontStyle.NORMAL
        },
        OpenSans_Bold : {
            fontFamily : "Open Sans",
            src : [
                {url : "fonts/OpenSans-Bold.woff2", format : FontType.WOFF2},
                {url : "fonts/OpenSans-Bold.woff", format : FontType.WOFF},
                {url : "fonts/OpenSans-Bold.ttf", format : FontType.TTF}
            ],
            fontWeight : FontWeight.BOLD,
            fontStyle : FontStyle.NORMAL
        },
        OpenSans_ExtraBold : {
            fontFamily : "Open Sans",
            src : [
                {url : "fonts/OpenSans-ExtraBold.woff2", format : FontType.WOFF2},
                {url : "fonts/OpenSans-ExtraBold.woff", format : FontType.WOFF},
                {url : "fonts/OpenSans-ExtraBold.ttf", format : FontType.TTF}
            ],
            fontWeight : FontWeight.EXTRA_BOLD,
            fontStyle : FontStyle.NORMAL
        },
        OpenSans_ExtraBoldItalic : {
            fontFamily : "Open Sans",
            src : [
                {url : "fonts/OpenSans-ExtraBoldItalic.woff2", format : FontType.WOFF2},
                {url : "fonts/OpenSans-ExtraBoldItalic.woff", format : FontType.WOFF},
                {url : "fonts/OpenSans-ExtraBoldItalic.ttf", format : FontType.TTF}
            ],
            fontWeight : FontWeight.EXTRA_BOLD,
            fontStyle : FontStyle.ITALIC
        }
    };
}