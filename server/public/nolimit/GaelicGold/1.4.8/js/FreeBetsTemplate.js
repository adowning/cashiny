"use strict";
/**
 * Created by jonas on 2020-04-22.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeBetsTemplate = void 0;
class FreeBetsTemplate {
}
FreeBetsTemplate.START_TEMPLATE = `
<h1>{{header}}</h1>
<p style="color: #7eff00;">{{message}}</p>
<p style="color: #7eff00;">{{spinsToGo}}</p>
<p style="color: #ffffff;">{{#tr}}Total value{{/tr}} {{value}}</p>
{{#operatorFreeBetMessages}}
    <p>{{{.}}}</p>
{{/operatorFreeBetMessages}}
<div>
    <button type="button" class="close">{{#tr}}OK{{/tr}}</button>
</div>
`;
FreeBetsTemplate.END_TEMPLATE = `
{{#aWinnerIsYou}}
<p style="color: #7eff00;">{{#tr}}Your freebets gave you a total win of{{/tr}}</p>
<h2 style="color: #FFFFFF;">{{#formatCurrency}}winnings{{/formatCurrency}}</h2>
{{/aWinnerIsYou}}
<p style="color: #7eff00;">{{#tr}}Your free bets are out!{{/tr}}</p>
<div><button type="button" class="close">{{#tr}}OK{{/tr}}</button></div>
`;
exports.FreeBetsTemplate = FreeBetsTemplate;
//# sourceMappingURL=FreeBetsTemplate.js.map