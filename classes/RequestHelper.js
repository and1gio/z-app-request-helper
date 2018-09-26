'use strict';

const request = require('request');

class RequestHelper {

    constructor(app, name, config) {
        this.app = app;
        this.name = name;

        this.host = config.host;
        this.port = config.port;
        this.path = config.path;
        this.secure = config.secure || false;
        this.debug = config.debug || false;
        this.transform = config.transform;
        this.applicationId = config.applicationId;
    }

    /**
     *
     * @param {*} method
     * @param {*} params
     * @param {*} headers
     */
    async request(method, params, headers) {
        try {
            return await this._makeRequest('post', method, params, headers);
        } catch (error) {
            throw error;
        }
    };

    /**
     * Private Methods
     */
    _makeRequest(type, method, params, options) {
        const protocol = this.secure ? 'https://' : "http://";
        const methodEndpoint = protocol.concat(this.host, ":", this.port, this.path, method);

        if (this.debug) {
            this.app.logger.info(type, methodEndpoint, params);
        }

        params = { url: methodEndpoint, json: params };

        if (options) {
            params = Object.assign(options, params);
        }

        return new Promise((resolve, reject) => {
            if (type !== 'get') {
                request[type](params, (error, response, body) => {
                    this._handleResponse(error, response, body, resolve, reject);
                });
            } else {
                request(apiUrl, (error, response, body) => {
                    this._handleResponse(error, response, body, resolve, reject);
                });
            }
        });
    }

    _handleResponse(fnError, response, body, resolve, reject) {
        if (fnError) {
            return reject(this.app.utils.createError(503, [{
                keyword: 'connection_problem'
            }]));
        }

        if (body && body.error) {
            if (body.error.list) {
                return reject(body.error);
            } else {
                // find & replace .. & remove later
                return reject(this.app.utils.createError(400, body.error));
            }
        } else {
            if (response.statusCode == 200) {
                let result = body.result;
                if (this.transform && typeof this.transform === 'function') {
                    result = this.transform(result);
                }
                resolve({ statusCode: response.statusCode, headers: response.headers, result: result });
            } else {
                return reject(this.app.utils.createError(response.statusCode, [{ keyword: 'bad_response', message: body }]));
            }
        }
    };
}

module.exports = RequestHelper;
