"use strict";
/**
 * Created by Jerker Nord on 2022-02-09.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeFeatureBetTemplate = void 0;
class FreeFeatureBetTemplate {
}
FreeFeatureBetTemplate.START_TEMPLATE = `
<h1>{{header}}</h1>
<p style="color: #7eff00;">{{message}}</p>
{{#operatorFreeBetMessages}}
    <p>{{{.}}}</p>
{{/operatorFreeBetMessages}}
<div>
    <button type="button" class="close">{{#tr}}OK{{/tr}}</button>
</div>
`;
FreeFeatureBetTemplate.END_TEMPLATE = `
{{#aWinnerIsYou}}
<p style="color: #7eff00;">{{#tr}}Your Nolimit Bonus gave you a total win of{{/tr}}</p>
<h2 style="color: #FFFFFF;">{{#formatCurrency}}winnings{{/formatCurrency}}</h2>
{{/aWinnerIsYou}}
<p style="color: #7eff00;">{{#tr}}Your Nolimit Bonus has ended!{{/tr}}</p>
<p style="color: #7eff00;">{{#tr}}From now on you play with your own money.{{/tr}}</p>
<div><button type="button" class="close">{{#tr}}OK{{/tr}}</button></div>
`;
exports.FreeFeatureBetTemplate = FreeFeatureBetTemplate;
//# sourceMappingURL=FreeFeatureBetTemplate.js.map