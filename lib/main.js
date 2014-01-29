var logger = require('./logger')
    , _ = require('lodash')

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g

function init(options)
{
    options = _.defaults({}, options, { log: { level: 'error', toConsole: true }});
    logger.config({ level: options.log.level, toConsole: options.log.toConsole});
}

var defaults = {
    apiKey: '',
    password: 'x',
    chargifyUrl: 'https://{{sitename}}.chargify.com'
}
module.exports.defaults = function (options)
{
    _.extend(defaults, options);
}

module.exports.set = function (key, value)
{
    switch (key)
    {
        case 'logginglevel':
            logger.setLevel(value);
    }
}

module.exports.connectSite = function (sitename, options)
{
    var Site = require('./entity/site');
    options = options || {};
    options = {
        chargify: _.defaults({}, options.chargify, defaults, { sitename: sitename,
            direct: { apiId: '', apiSecret: '', apiPassword: ''}} ),
        productFamilies: options.productFamilies || []
    }

    var site = new Site({ siteName: sitename },options);
    return site;
}

init();