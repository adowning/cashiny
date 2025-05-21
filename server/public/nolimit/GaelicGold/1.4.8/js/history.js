function doRequest(url) {
    return new Promise((resolve, reject) => {

        const request = new XMLHttpRequest();

        request.open('GET', url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader('Accept', 'application/json');

        request.onload = () => {
            try {
                const response = JSON.parse(request.responseText);

                if(request.status >= 200 && request.status < 400) {
                    resolve(response);
                } else if(response.error) {
                    reject(response.error);
                } else {
                    reject(`${request.status} ${request.statusText}`);
                }

            } catch(e) {
                reject(e.message);
            }
        };

        request.onerror = () => {
            reject(`${request.status} ${request.statusText}`);
        };

        request.send();

    });
}


const history = {
    init(url, key) {
        this.url = url;
        this.key = key;
        this.offset = new Date().getTimezoneOffset();
    },

    /**
     *
     * @param date {String} ISO date such as '2018-12-23'
     * @param sortByHeader {String}, sort by TIME, WIN or BET
     * @param sortOrder {String}, sorting order, ASC or DESC
     * @param pageNo {Number} eg '1', page number, starts at 1.
     * @returns {Promise} 100 or less round data objects per page.
     */
    roundsPaginated(date, sortByHeader, sortOrder, pageNo) {
        const url = `${this.url}/rounds_paginated?data=${this.key}&date=${date}&header=${sortByHeader}&sortType=${sortOrder}&pageNo=${pageNo}&offset=${this.offset}`;
        return doRequest(url);
    },

    /**
     *
     * @param year {String|Number} eg '2018'
     * @param month {String|Number} eg '08'
     * @returns {Promise} days in a month with existing game rounds, as an array of {date} objects
     */
    daysNoHour(year, month) {
        month = month.toString().padStart(2, '0');
        const url = `${this.url}/days_nohour?data=${this.key}&month=${year}-${month}&offset=${this.offset}`;
        return doRequest(url);
    },

    /**
     *
     * @param year {String|Number} eg '2018'
     * @param month {String|Number} eg '08'
     * @returns {Promise} days in a month with existing game rounds, as an array of {date: count} objects
     */
    days(year, month) {
        month = month.toString().padStart(2, '0');
        const url = `${this.url}/days?data=${this.key}&month=${year}-${month}&offset=${this.offset}`;
        return doRequest(url);
    },

    /**
     *
     * @param date {String} ISO date such as '2018-12-23'
     * @param hour {String|Number} Local hour of day, such as '02' or 23
     * @return {Promise}
     */
    rounds(date, hour) {
        hour = hour.toString().padStart(2, '0');
        const url = `${this.url}/rounds?data=${this.key}&date=${date}&hour=${hour}&offset=${this.offset}`;
        return doRequest(url);
    },

    /**
     *
     * @param id {String|Number} game round id as given from other history results
     */
    round(id) {
        const url = `${this.url}/round?data=${this.key}&id=${id}`;
        return doRequest(url);
    },

    /**
     *
     * @return {Promise}
     */
    replay(id, debug = false) {
        let url = `${this.url}/replay?data=${this.key}&id=${id}`;
        if(debug) {
            url += '&debug=true';
        }
        return doRequest(url);
    },

    /**
     *
     * @param id {String|Number} game round id as given from other history results
     * @return {Promise}
     */
    replayUrl(id) {
        const url = `${this.url}/replay-url?data=${this.key}&id=${id}`;
        return doRequest(url);
    },

    /**
     *
     * @param type {String} either multiplier or monetary depending on the type of list wanted, defaults to multiplier
     * @return {Promise}
     */
    topListCurrentGame(type = 'multiplier') {
        const url = `${this.url}/top-list-current-game?data=${this.key}&type=${type}`;
        return doRequest(url);
    },

    /**
     *
     * @param type {String} either multiplier or monetary depending on the type of list wanted, defaults to multiplier
     * @return {Promise}
     */
    topListAnyGame(type = 'multiplier') {
        const url = `${this.url}/top-list-any-game?data=${this.key}&type=${type}`;
        return doRequest(url);
    }
};

module.exports = history;
