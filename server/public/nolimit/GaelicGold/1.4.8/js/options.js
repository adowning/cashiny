function verifyOptions(options) {
    if(options && options.game) {
        return;
    }

    throw new Error('Missing nolimit.options.game: ' + JSON.stringify(options));
}

function getServerHost(options) {
    if(options.serverHost) {
        return options.serverHost.replace(/\/$/, '');
    }

    const environment = options.environment;

    if(environment.indexOf('.') === -1) {
        return 'https://' + environment + '.nolimitcity.com';
    } else {
        return 'https://' + environment.replace('nolimitcdn', 'nolimitcity').replace('-us.nlccdn.com', '.nlcus.com').replace('nlccdn', 'nlcgames').replace('nlcasiacdn', 'nlcasia');
    }
}

function getOptions(options) {
    verifyOptions(options);
    options.device = options.device || 'desktop';

    // https://github.com/nolimitcity/nolimit-slot-translations/issues/56
    if(options.language !== 'verbose' && options.language !== 'succinct' && options.language !== 'zh-Hant' && options.language !== 'zh-hant' && options.language !== 'pt-BR' && options.language !== 'pt-br' && options.language !== 'us-sweepstakes') {
        options.language = (options.language || 'en').substring(0, 2).toLowerCase();
    }

    options.serverHost = getServerHost(options);

    if(options.hideCurrency === true || options.hideCurrency === 'true') {
        options.hideCurrency = true;
    }

    if(options.quality) {
        options.quality = options.quality.toLowerCase();
    }

    options.smartLoading = options.smartLoading && options.smartLoading !== false;

    options.showDialogs = options.showDialogs !== false;

    options.funMode = !options.token;

    options.realityCheck = options.realityCheck || {};

    return options;
}

module.exports = {
    get: getOptions
};
