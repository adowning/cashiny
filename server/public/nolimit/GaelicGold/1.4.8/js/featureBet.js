/**
 * Created by Jonas Wålekvist on 2020-01-20.
 */



//{name: "FREESPIN", type: "FREESPIN", price: 80}
let storedFeatureData = {};
let storedFeatureDataAll = {};
const featureBet = {
    init(api) {
        api.events.on('init', function(data) {
            if (data.featureBuyTimesBetValue){
                data.featureBuyTimesBetValue.forEach(value => {
                    storedFeatureData[value.name] = value.price;
                });
            }
            if (data.featureBuyTimesBetValueAll){
                for (let modeName in data.featureBuyTimesBetValueAll){
                    const modeData = data.featureBuyTimesBetValueAll[modeName];
                    storedFeatureDataAll[modeName] = {}
                    modeData.forEach(value => {
                        storedFeatureDataAll[modeName][value.name] = value.price;
                    });
                }
            }
        });
    },

    /**
     *
     * @param betData =
     * const bet = {
     *       type: 'featureBet',
     *       bet: this.betLevel.getLevel(),
     *       featureName: featureName
     *   };
     */
    getActualPrice(betData){
        let multiplier = 1;
        if (betData.playerInteraction && betData.playerInteraction.gameMode) {
            const modeData =  storedFeatureDataAll[betData.playerInteraction.gameMode];
            multiplier = modeData[betData.featureName] ? modeData[betData.featureName] : 1;
        } else {
            multiplier = storedFeatureData[betData.featureName] ? storedFeatureData[betData.featureName] : 1;
        }
        return +((parseFloat(betData.bet) * multiplier).toFixed(2));
    },

    getLockedReelPrice(betData){
        if (betData.playerInteraction && betData.playerInteraction.price){
            return betData.playerInteraction.price;
        }else{
            return 0;
        }
    }

};

module.exports = featureBet;

