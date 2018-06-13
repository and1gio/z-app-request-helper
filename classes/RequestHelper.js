'use strict';

const request = require('request');

class RequestHelper {

    constructor (app, name, host, port, path, secure, debug) {
        this.name = name;
        this.host = host;
        this.port = port;
        this.path = path;
        this.secure = secure || false;
        this.debug = debug || false;

        this.app = app;
    }

    /**
     *
     * @param {*} method
     * @param {*} params
     * @param {*} headers
     */
    async request (method, params, headers) {
        try {
            return await this._makeRequest('post', method, params, headers);
        } catch (error) {
            throw error;
        }
    };

    /**
     * Private Methods
     */
    _makeRequest (type, method, params, options) {
        const protocol = this.secure ? 'https://' : "http://";
        const methodEndpoint = protocol.concat(this.host, ":", this.port, this.path, method);

        if (this.debug) {
            this.app.logger.info(type, methodEndpoint, params);
        }

        params = { url: methodEndpoint, json: params };

        if(options){
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
            const error = this.app.utils.generateError('business', this.name, 'service', null, 'connection_error');
            return reject({
                status: 400,
                errors: [error]
            });
        }

        if(body && body.error) {
            const errors = [];
            for(let error of body.error){
                const errorItem = this.app.utils.generateError('business', this.name, 'service', null, error.keyword);
                errors.push(errorItem);
            }

            return reject({
                status: 400,
                errors: errors
            });
        } else {
            resolve({ headers: response.headers, result: body.result});
        }
    };
}

module.exports = RequestHelper;
