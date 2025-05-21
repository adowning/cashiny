const jurisdiction = {
    jurisdiction: {},
    init(api) {
        this.jurisdiction = api.options.jurisdiction || {};
        api.events.on('jurisdiction', jurisdiction => {
            if(jurisdiction === '[object Object]') {
                console.error('Broken jurisdiction data: [object Object]');
                return;
            }

            const unparsedObject = typeof jurisdiction === 'string' && jurisdiction.trim().startsWith('{');
            jurisdiction = unparsedObject ? JSON.parse(jurisdiction) : jurisdiction;

            if(jurisdiction.name) {
                this.jurisdiction = jurisdiction;
            } else {
                console.error('jurisdiction event had missing name:', jurisdiction);
            }
        });
    },

    get() {
        // FIXME: should always be object but needs platform fix
        return typeof this.jurisdiction === 'string' ? {name: this.jurisdiction} : this.jurisdiction || {};
    },

    name() {
        // FIXME: should always be object but needs platform fix
        return typeof this.jurisdiction === 'string' ? this.jurisdiction : this.jurisdiction.name;
    }
};

module.exports = jurisdiction;
