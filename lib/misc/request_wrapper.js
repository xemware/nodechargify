var request = require('request')
    , _ = require('lodash')
    , logger = require('../logger')
    , util = require('util')
function RequestWrapper(options)
{
    this._baseUrl = _.template(options.chargifyUrl, options);
    this._apiKey = options.apiKey;
    this._password = options.password;
}

_.extend(RequestWrapper.prototype,
    {
        req: function(method, path, options,callback)
        {
            var url = this._baseUrl + '/' + path;
            logger.debug(util.format('Request - %s - %s', method,url));
            
            request[method](_.extend({
                url: url,
                auth: {
                    user: this._apiKey,
                    pass: this._password,
                    sendImmediately: true
                },
                forever: true
            }, options), function (err,response,body)
            {
                if (err)
                    logger.debug(util.format('Error - %s - %s - %s', response.statusCode, method, err));
                else
                    logger.debug(util.format('Response %d - %s - %s', response.statusCode, method,url));
                callback.apply(callback, arguments);
            })

        },
        get: function (path, options,callback)
        {
            this.req('get', path, options, callback);
        },
        post: function (path, options,callback)
        {
            this.req('post', path, options, callback);
        },
        put: function (path, options, callback)
        {
            this.req('put', path, options, callback);
        }

    })
module.exports = RequestWrapper