function addHeaders(request, options) {
    const headers = options.headers || {};
    for(let header in headers) {
        request.setRequestHeader(header, headers[header]);
    }
}

function createRequest(url, options) {
    const request = new XMLHttpRequest();
    const method = options.method || 'GET';
    request.open(method, url);
    addHeaders(request, options);
    return request;
}

function addHandlers(request, resolve, reject) {
    request.onload = function() {
        if(request.status >= 200 && request.status < 400) {
            resolve(request.responseText);
        } else {
            const error = Error(request.statusText || 'Unknown failure; possibly CORS');
            error.status = request.status;
            reject(error);
        }
    };
    request.onerror = function(e) {
        reject(e);
    };
}

function makeUrlFromData(data) {
    const urlData = [];

    for(let key in data) {
        const value = data[key];
        urlData.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    return urlData.join('&');
}

function load(url, options) {
    const promise = new Promise((resolve, reject) => {
        const request = createRequest(url, options);
        addHandlers(request, resolve, reject);
        request.send(options.data);
    });

    promise.json = function(executor) {
        if(executor) {
            return promise.then(JSON.parse).then(executor);
        } else {
            return promise.then(JSON.parse);
        }
    };

    return promise;
}

/**
 * XMLHttpRequest to Promise wrapper, with JSON functionality built in.
 */
const ajaxPromise = {
    /**
     * GET url with options.
     */
    get(url, options = {}) {
        options.method = 'GET';
        options.data = null;
        return load(url, options);
    },

    /**
     * POST data to url (with options) as an URL-encoded form. This usually works anywhere, with anything.
     */
    post(url, data, options = {}) {
        options.method = 'POST';
        options.headers = options.headers || {};
        options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        options.data = makeUrlFromData(data);
        return load(url, options);
    },

    /**
     * POST raw JSON to url (with options).
     */
    postJson(url, data, options = {}) {
        options.method = 'POST';
        options.headers = options.headers || {};
        options.headers['Content-Type'] = 'application/json; charset=UTF-8';
        options.data = JSON.stringify(data);
        return load(url, options);
    }
};

module.exports = ajaxPromise;
