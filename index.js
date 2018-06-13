'use strict';

const Initializer = require('@and1gio/z-app-core').Initializer;

const RequestHelper = require('./classes/RequestHelper');

class RequestHelperInitializer extends Initializer {

    constructor(app) {
        super(app);
    }

    async init() {
        try {
            this.app.requestHelpers = {};
            for (let key in this.app.configs.requestHelpers) {
                const config = this.app.configs.requestHelpers[key];
                this.app.requestHelpers[key] = new RequestHelper(this.app, key, config.host, config.port, config.path, config.secure, config.debug);
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RequestHelperInitializer;
