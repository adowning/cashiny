import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";

/**
 * Created by Jie Gao on 2019-11-04.
 */

export class ParticleConfigs {
    public static splashRingUpper:any = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 0.25,
            "end": 1.5,
            "minimumScaleMultiplier": 0.5
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 0,
            "end": 0,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": true,
        "rotationSpeed": {
            "min": 0,
            "max": 10
        },
        "lifetime": {
            "min": 1,
            "max": 1.8
        },
        "blendMode": "add",
        "frequency": 0.8,
        "emitterLifetime": -1,
        "maxParticles": 3,
        "pos": {
            "x": 0,
            "y": 620
        },
        "addAtBack": false,
        "spawnType": "ring",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 13,
            "minR": 5
        }
    };
    public static splashRingMid:any = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 0.2,
            "end": 1.5,
            "minimumScaleMultiplier": 0.5
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 0,
            "end": 0,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": true,
        "rotationSpeed": {
            "min": 0,
            "max": 10
        },
        "lifetime": {
            "min": .7,
            "max": 1.5
        },
        "blendMode": "add",
        "frequency": 1,
        "emitterLifetime": -1,
        "maxParticles": 2,
        "pos": {
            "x": 250,
            "y": 710
        },
        "addAtBack": false,
        "spawnType": "ring",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 16,
            "minR": 5
        }
    };
    public static splashRingLower:any = {
        "alpha" : {
            "start" : 1,
            "end" : 0
        },
        "scale" : {
            "start" : 0.25,
            "end" : 2,
            "minimumScaleMultiplier" : 0.5
        },
        "color" : {
            "start" : "#ffffff",
            "end" : "#ffffff"
        },
        "speed" : {
            "start" : 0,
            "end" : 0,
            "minimumSpeedMultiplier" : 1
        },
        "acceleration" : {
            "x" : 0,
            "y" : 0
        },
        "maxSpeed" : 0,
        "startRotation" : {
            "min" : 0,
            "max" : 360
        },
        "noRotation" : true,
        "rotationSpeed" : {
            "min" : 0,
            "max" : 10
        },
        "lifetime" : {
            "min" : 1,
            "max" : 1.4
        },
        "blendMode" : "add",
        "frequency" : 0.5,
        "emitterLifetime" : -1,
        "maxParticles" : 2,
        "pos" : {
            "x" : 550,
            "y" : 780
        },
        "addAtBack" : false,
        "spawnType" : "ring",
        "spawnCircle" : {
            "x" : 0,
            "y" : 0,
            "r" : 40,
            "minR" : 5
        }
    };
    public static rainDrops:any = {
        "alpha" : {
            "start" : 0,
            "end" : 0.66
        },
        "scale" : {
            "start" : 2.5,
            "end" : 0.01,
            "minimumScaleMultiplier" : 0.5
        },
        "color" : {
            "start" : "#ffffff",
            "end" : "#ffffff"
        },
        "speed" : {
            "start" : 397,
            "end" : 413,
            "minimumSpeedMultiplier" : 1
        },
        "acceleration" : {
            "x" : 0,
            "y" : 0
        },
        "maxSpeed" : 0,
        "startRotation" : {
            "min" : 90,
            "max" : 90
        },
        "noRotation" : true,
        "rotationSpeed" : {
            "min" : 0,
            "max" : 0
        },
        "lifetime" : {
            "min" : 0.47,
            "max" : 2
        },
        "blendMode" : "add",
        "ease" : [
            {
                "s" : 0,
                "cp" : 0.379,
                "e" : 0.548
            },
            {
                "s" : 0.548,
                "cp" : 0.717,
                "e" : 0.676
            },
            {
                "s" : 0.676,
                "cp" : 0.635,
                "e" : 1
            }
        ],
        "frequency" : 0.1,
        "emitterLifetime" : -1,
        "maxParticles" : 20,
        "pos" : {
            "x" :  360,
            "y" : 0
        },
        "addAtBack" : false,
        "spawnType" : "rect",
        "spawnRect" : {
            "x" : -640,
            "y" : -280,
            "w" : 1280,
            "h" : 20
        }
    };
    public static sparkleParticles:any = {
        "alpha" : {
            "start" : 0,
            "end" : 1
        },
        "scale" : {
            "start" : 0.5,
            "end" : 0.01,
            "minimumScaleMultiplier" : 1
        },
        "color" : {
            "start" : "#ffffff",
            "end" : "#ffffff"
        },
        "speed" : {
            "start" : 0,
            "end" : 0,
            "minimumSpeedMultiplier" : 1
        },
        "acceleration" : {
            "x" : 0,
            "y" : 0
        },
        "maxSpeed" : 0,
        "startRotation" : {
            "min" : 0,
            "max" : 50
        },
        "noRotation" : false,
        "rotationSpeed" : {
            "min" : 0,
            "max" : 9
        },
        "lifetime" : {
            "min" : 0.86,
            "max" : 1.5
        },
        "blendMode" : "add",
        "frequency" : 0.8,
        "emitterLifetime" : -1,
        "maxParticles" : 4,
        "pos" : {
            "x" : 360,
            "y" : 0
        },
        "addAtBack" : false,
        "spawnType" : "rect",
        "spawnRect" : {
            "x" : 0,
            "y" : 0,
            "w" : 438,
            "h" : 158
        }
    };
    public static sparkleParticlesSmall:any = {
        "alpha" : {
            "start" : 0,
            "end" : 1
        },
        "scale" : {
            "start" : 0.4,
            "end" : 0.01,
            "minimumScaleMultiplier" : 1
        },
        "color" : {
            "start" : "#ffffff",
            "end" : "#ffffff"
        },
        "speed" : {
            "start" : 0,
            "end" : 0,
            "minimumSpeedMultiplier" : 1
        },
        "acceleration" : {
            "x" : 0,
            "y" : 0
        },
        "maxSpeed" : 0,
        "startRotation" : {
            "min" : 0,
            "max" : 50
        },
        "noRotation" : false,
        "rotationSpeed" : {
            "min" : 0,
            "max" : 9
        },
        "lifetime" : {
            "min" : 0.86,
            "max" : 2.13
        },
        "blendMode" : "add",
        "frequency" : 0.7,
        "emitterLifetime" : -1,
        "maxParticles" : 2,
        "pos" : {
            "x" : 154,
            "y" : 100
        },
        "addAtBack" : false,
        "spawnType" : "rect",
        "spawnRect" : {
            "x" : 0,
            "y" : 0,
            "w" : 160,
            "h" : 96
        }
    };
    public static sparkleParticlesPNC:any = {
        "alpha" : {
            "start" : 0,
            "end" : 1
        },
        "scale" : {
            "start" : 0.4,
            "end" : 0.01,
            "minimumScaleMultiplier" : 1
        },
        "color" : {
            "start" : "#ffffff",
            "end" : "#ffffff"
        },
        "speed" : {
            "start" : 0,
            "end" : 0,
            "minimumSpeedMultiplier" : 1
        },
        "acceleration" : {
            "x" : 0,
            "y" : 0
        },
        "maxSpeed" : 0,
        "startRotation" : {
            "min" : 0,
            "max" : 50
        },
        "noRotation" : false,
        "rotationSpeed" : {
            "min" : 0,
            "max" : 9
        },
        "lifetime" : {
            "min" : 0.86,
            "max" : 2.13
        },
        "blendMode" : "add",
        "frequency" : 0.5,
        "emitterLifetime" : -1,
        "maxParticles" : 5,
        "pos" : {
            "x" : 360,
            "y" : 360
        },
        "addAtBack" : false,
        "spawnType" : "rect",
        "spawnRect" : {
            "x" : 0,
            "y" : 0,
            "w" : 900,
            "h" : 300
        }
    };
}