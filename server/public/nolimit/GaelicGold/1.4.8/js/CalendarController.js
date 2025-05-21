"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = exports.GameHistorySortType = exports.GameHistorySortHeader = void 0;
const luxon_1 = require("luxon");
const SlotKeypad_1 = require("../../../../../SlotKeypad");
const HistoryPage_1 = require("../HistoryPage");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
/**
 * Created by jonas on 2023-11-08.
 */
var GameHistorySortHeader;
(function (GameHistorySortHeader) {
    GameHistorySortHeader["TIME"] = "TIME";
    GameHistorySortHeader["BET"] = "BET";
    GameHistorySortHeader["WIN"] = "WIN";
})(GameHistorySortHeader = exports.GameHistorySortHeader || (exports.GameHistorySortHeader = {}));
var GameHistorySortType;
(function (GameHistorySortType) {
    GameHistorySortType["ASC"] = "ASC";
    GameHistorySortType["DESC"] = "DESC";
})(GameHistorySortType = exports.GameHistorySortType || (exports.GameHistorySortType = {}));
class CalendarController {
    constructor(screen) {
        this.onDaySelectNew = (e) => {
            const clicked = e.target;
            const history = this.menuDiv.querySelector('.history');
            HistoryPage_1.HistoryPage.scrollTo(history, 0, 50);
            setTimeout(() => {
                this.backToSearchBtn.classList.add('animate');
                this.calendarContainer.classList.add('animate');
                this.resultContainer.classList.add('animate');
            }, 100);
            const date = clicked.dataset.date;
            this.clearResult();
            this.currentSort = {
                date: date,
                head: GameHistorySortHeader.TIME,
                type: GameHistorySortType.DESC,
                page: 1
            };
            this.loadPage(this.currentSort);
        };
        this.screen = screen;
        this.selectedMonth = luxon_1.DateTime.local();
        this.menuDiv = this.screen.find('#gameHistoryContainer')[0];
        this.calendarContainer = this.menuDiv.querySelector('.calendar-container');
        this.calendarTimeContainer = this.menuDiv.querySelector('.calendar-time-container');
        this.calendarTimeContainer.style.display = 'none';
        this.calendarTime = this.calendarTimeContainer.querySelector('.calendar-time');
        this.monthHeader = this.calendarContainer.querySelector('.month .header');
        this.calendarDays = this.calendarContainer.querySelector('.days');
        this.prevMonthBtn = this.calendarContainer.querySelector('.month .prev');
        this.nextMonthBtn = this.calendarContainer.querySelector('.month .next');
        this.prevMonthBtn.addEventListener('click', (event) => this.changeMonth(event));
        this.nextMonthBtn.addEventListener('click', (event) => this.changeMonth(event));
        this.loadingCalendarIcon = this.calendarContainer.querySelector('.loading');
        this.backToSearchBtn = this.menuDiv.querySelector('.back-to-search-btn');
        this.resultContainer = this.menuDiv.querySelector('.result-container');
        this.resultInfo = this.resultContainer.querySelector('.result-info');
        this.resultInfoDate = this.resultInfo.querySelector('.date');
        this.resultDiv = this.resultContainer.querySelector('.result');
        this.resultHead = this.resultContainer.querySelector('.result table thead');
        this.resultBody = this.resultContainer.querySelector('.result table tbody');
        this.sortTimeBtn = this.resultContainer.querySelector('.result table thead .sort .sortTime');
        this.sortTimeBtn.addEventListener("click", () => {
            this.onSort(GameHistorySortHeader.TIME);
        });
        this.sortWinBtn = this.resultContainer.querySelector('.result table thead .sort .sortWin');
        this.sortWinBtn.addEventListener("click", () => {
            this.onSort(GameHistorySortHeader.WIN);
        });
        this.amounts = this.resultInfo.querySelectorAll('tr.amount th');
        this.loadMoreBtn = this.resultContainer.querySelector('.result .loadMore');
        this.loadMoreBtn.addEventListener('click', () => {
            this.currentSort.page += 1;
            this.loadPage(this.currentSort);
        });
        this.loadingIcon = this.resultContainer.querySelector('.result .loading');
        this.backToSearchBtn = this.screen.find('.back-to-search-btn')[0];
        this.backToSearchBtn.addEventListener('click', () => {
            this.resetView();
        });
    }
    goBackToCalendarView() {
        this.backToSearchBtn.classList.remove('animate');
        this.calendarContainer.classList.remove('animate');
        this.resultContainer.classList.remove('animate');
        this.clearResult();
    }
    resetView() {
        const history = this.screen.find('.history')[0];
        HistoryPage_1.HistoryPage.scrollTo(history, 0, 50);
        setTimeout(() => {
            this.goBackToCalendarView();
        }, 100);
    }
    onSort(sortHead) {
        if (sortHead == this.currentSort.head) {
            return;
        }
        this.clearResult();
        this.currentSort.head = sortHead;
        this.currentSort.page = 1;
        this.loadPage(this.currentSort);
    }
    changeMonth(e) {
        const clicked = e.target;
        if (clicked.classList.contains('disabled')) {
            return;
        }
        if (clicked.classList.contains('prev')) {
            this.selectedMonth = this.selectedMonth.minus({ month: 1 });
        }
        else if (clicked.classList.contains('next')) {
            this.selectedMonth = this.selectedMonth.plus({ month: 1 });
        }
        this.update();
    }
    update(date = this.selectedMonth) {
        // https://github.com/nolimitcity/nolimit-game-api/issues/101
        try {
            this.monthHeader.textContent = date.toLocaleString({ month: 'long', year: 'numeric' }).toUpperCase();
        }
        catch (e) {
            this.monthHeader.textContent = date.toLocaleString({ month: 'long', year: 'numeric' }, {
                locale: "en"
            }).toUpperCase();
        }
        this.prevMonthBtn.classList.add('disabled');
        this.nextMonthBtn.classList.add('disabled');
        const now = luxon_1.DateTime.local();
        const oneYearBack = now.minus({ year: 1 });
        this.calendarDays.innerHTML = '';
        this.loadingCalendarIcon.style.display = "inline-block";
        SlotKeypad_1.SlotKeypad.apiPlugIn.communication.history.daysNoHour(date.year, date.month)
            .then((days) => {
            this.generateCalendarDays(date, days);
            this.loadingCalendarIcon.style.display = "none";
            if (oneYearBack.hasSame(date, 'year') && oneYearBack.hasSame(date, 'month')) {
                this.prevMonthBtn.classList.add('disabled');
            }
            else {
                this.prevMonthBtn.classList.remove('disabled');
            }
            if (now.hasSame(date, 'year') && now.hasSame(date, 'month')) {
                this.nextMonthBtn.classList.add('disabled');
            }
            else {
                this.nextMonthBtn.classList.remove('disabled');
            }
        })
            .catch(console.error);
    }
    generateCalendarDays(date, days) {
        const now = luxon_1.DateTime.local();
        const first = date.startOf('month');
        for (let i = 2 - first.weekday; i <= first.daysInMonth; i++) {
            const dayLi = document.createElement('li');
            if (i > 0) {
                dayLi.textContent = i.toString();
                const currentDate = first.plus({ days: i - 1 });
                const isoDate = currentDate.toISODate();
                if (days[isoDate]) {
                    dayLi.classList.add('played');
                    dayLi.addEventListener('click', this.onDaySelectNew);
                    dayLi.dataset.date = isoDate;
                    dayLi.dataset.hours = days[isoDate].join(',');
                }
                if (now.hasSame(currentDate, 'day')) {
                    dayLi.classList.add('today');
                }
            }
            this.calendarDays.appendChild(dayLi);
        }
    }
    clearResult() {
        this.totalBet = 0;
        this.totalWin = 0;
        this.resultBody.innerHTML = "";
    }
    loadPage(sortOptions) {
        this.loadingIcon.style.display = "inline-block";
        this.loadMoreBtn.style.display = "none";
        if (sortOptions.head == GameHistorySortHeader.TIME) {
            this.sortTimeBtn.querySelector(".down").style.display = "inline";
            this.sortTimeBtn.querySelector(".right").style.display = "none";
            this.sortWinBtn.querySelector(".down").style.display = "none";
            this.sortWinBtn.querySelector(".right").style.display = "inline";
        }
        else {
            this.sortTimeBtn.querySelector(".down").style.display = "none";
            this.sortTimeBtn.querySelector(".right").style.display = "inline";
            this.sortWinBtn.querySelector(".down").style.display = "inline";
            this.sortWinBtn.querySelector(".right").style.display = "none";
        }
        SlotKeypad_1.SlotKeypad.apiPlugIn.communication.history.roundsPaginated(sortOptions.date, sortOptions.head, sortOptions.type, sortOptions.page)
            .then((rounds) => {
            this.addRoundsToResult(sortOptions, rounds);
            if (rounds.length < 100) {
                this.loadMoreBtn.style.display = "none";
            }
            else {
                this.loadMoreBtn.style.display = "inline-block";
            }
            this.loadingIcon.style.display = "none";
        })
            .catch(console.error);
    }
    addRoundsToResult(sortOptions, rounds) {
        for (let round of rounds) {
            this.resultBody.appendChild(this.generateRoundTableRow(round));
        }
        const totalRounds = (sortOptions.page * 100) - 100 + rounds.length;
        this.resultInfoDate.textContent = `${sortOptions.date} (${SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Round")} 1-${totalRounds})`;
        const totalDiff = this.totalWin - this.totalBet;
        this.amounts[0].textContent = NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(this.totalBet);
        this.amounts[1].textContent = NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(this.totalWin);
        this.amounts[2].textContent = NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(totalDiff);
    }
    generateRoundTableRow(round) {
        this.totalBet += round.totalBet;
        this.totalWin += round.totalWin;
        const tr = HistoryPage_1.HistoryPage.makeElement('tr');
        let displayBet = NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(round.totalBet);
        if (round.promoName) {
            tr.classList.add('freebets');
            displayBet = `0.00 (${NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(round.totalFreeBet || 0)})`;
        }
        const startTime = round.startTime.split(' ')[1];
        const startTimeEl = HistoryPage_1.HistoryPage.makeElement('td', startTime);
        if (round.actionSpin) {
            const url = SlotKeypad_1.SlotKeypad.apiPlugIn.resources.getStaticRoot() + "/node_modules/@nolimitcity/slot-keypad/resources/default/templates/actionSpinsIcon.svg";
            const img = document.createElement("img");
            img.src = url;
            img.style.marginLeft = "0.5em";
            img.style.height = "1em";
            startTimeEl.append(img);
        }
        if (round.requestType == "FEATURE_BET" && (round.requestInformation != undefined && round.requestInformation.indexOf("BOOSTED_BET") === -1)) {
            const url = SlotKeypad_1.SlotKeypad.apiPlugIn.resources.getStaticRoot() + "/node_modules/@nolimitcity/slot-keypad/resources/default/templates/nolimitBonusIcon.svg";
            const img = document.createElement("img");
            img.src = url;
            img.style.marginLeft = "0.5em";
            img.style.height = "1em";
            startTimeEl.append(img);
        }
        tr.appendChild(startTimeEl);
        tr.appendChild(HistoryPage_1.HistoryPage.makeElement('td', displayBet));
        tr.appendChild(HistoryPage_1.HistoryPage.makeElement('td', NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(round.totalWin)));
        //We need to display 0 as "-", because of evo freebets.
        const closingBalance = round.balanceAfter == 0 ? '-' : NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(round.balanceAfter);
        tr.appendChild(HistoryPage_1.HistoryPage.makeElement('td', closingBalance));
        if (round.evicted != true) {
            const replay = document.createElement('td');
            replay.classList.add('right');
            replay.classList.add('replay');
            replay.innerHTML = '<a target="_blank"></a>';
            replay.querySelector('a').addEventListener('click', e => {
                SlotKeypad_1.SlotKeypad.apiPlugIn.openReplay(round.gameRoundId);
                e.preventDefault();
            });
            tr.appendChild(replay);
        }
        return tr;
    }
    resize(bounds) {
        //  this.resultDiv.style.height = (bounds.height - 299)+"px";
    }
}
exports.CalendarController = CalendarController;
//# sourceMappingURL=CalendarController.js.map