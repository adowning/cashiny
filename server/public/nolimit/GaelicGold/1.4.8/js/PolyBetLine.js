"use strict";
/**
 * Created by Ning Jiang on 1/4/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolyBetLine = void 0;
const BetLine_1 = require("../../../core/betline/BetLine");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const StageManager_1 = require("../../../core/stage/StageManager");
const Helper_1 = require("../../../core/utils/Helper");
const gsap_1 = require("gsap");
class PolyBetLine extends BetLine_1.BetLine {
    constructor(index, numberPosition, betLineData, config) {
        super(index, numberPosition, betLineData, config);
    }
    draw(numberPosition, betLineData, config) {
        const symbolWidth = GameConfig_1.GameConfig.instance.SYMBOL_WIDTH;
        const symbolHeight = GameConfig_1.GameConfig.instance.SYMBOL_HEIGHT;
        const linePositions = [];
        // number on the left, use it's position to start.
        if (numberPosition[2] === 0) {
            linePositions.push([numberPosition[0] + config.numberOffsetX, numberPosition[1]]);
        }
        for (let j = 0; j < betLineData.length; j++) {
            const symId = betLineData[j];
            const basePosition = Helper_1.Helper.getSymbolPositions(j, symId);
            // TODO: handle the offset in betline subclasses?
            // if(j > 0 && symId === this._betLinesData[dataIndex][j - 1]){
            //     // if the current point is in the same level as the previous one, use the same y position.
            //     basePosition[1] = linePositions[linePositions.length - 1][1];
            // }else{
            //     basePosition[1] += symbolHeight / 2 + offsetFactor[j][symId] *
            // this._config.linePointOverlapVerticalOffset; } offsetFactor[j][symId] += 1;
            linePositions.push(basePosition);
        }
        // number on the right, use it's position to end the line
        if (numberPosition[2] === 1) {
            linePositions.push([numberPosition[0] - config.numberOffsetX, numberPosition[1]]);
        }
        // Draw the line.
        let line = new PIXI.Graphics();
        let lineWidth = 0;
        for (let i = 0; i < config.styles.length; i++) {
            this.drawPolyline(line, linePositions, config.styles[i]);
            lineWidth = Math.max(lineWidth, config.styles[i].lineWidth);
        }
        // If WebGL we need to render Graphics with the Canvas renderer to get anti-aliasing
        /*
                TODO- Look over, canvas not supported.

                if(StageManager.isWebGLSupported == true && UserAgent.forceCanvas == false) {
                    let resolution:number = StageManager.devicePixelRatio;
                    //Low resolution on mobile
                    if(UserAgent.isMobile) {
                        resolution = 0.5;
                    }
                    const sprite:PIXI.Sprite = new PIXI.Sprite(Helper.generateCanvasTexture(line, resolution));
                    line = null;
                    sprite.x = linePositions[0][0] - lineWidth * 3 / 2;
                    sprite.y = this.getHighestPointY(linePositions) - lineWidth;
                    this.addChild(sprite);
                } else {
                    this.addChild(line);
                }
        */
        this.addChild(line);
        StageManager_1.StageManager.getLayer(config.staticLineLayer).addChild(this);
        this.alpha = 0;
    }
    drawPolyline(line, points, style) {
        line.lineStyle(style.lineWidth, style.color, style.alpha);
        line.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            line.lineTo(points[i][0], points[i][1]);
        }
    }
    getHighestPointY(points) {
        let y = points[0][1];
        for (let i = 1; i < points.length; i++) {
            y = Math.min(y, points[i][1]);
        }
        return y;
    }
    showStatic() {
        this.show();
    }
    showWin() {
        this.show();
    }
    hideAll() {
        this.killTween();
        this._alphaTween = gsap_1.TweenLite.to(this, 0.1, { alpha: 0 });
    }
    show() {
        this.killTween();
        this._alphaTween = gsap_1.TweenLite.to(this, 0.1, { alpha: 1 });
    }
    killTween() {
        if (this._alphaTween && this._alphaTween.isActive()) {
            this._alphaTween.pause();
            this._alphaTween.kill();
        }
    }
}
exports.PolyBetLine = PolyBetLine;
//# sourceMappingURL=PolyBetLine.js.map