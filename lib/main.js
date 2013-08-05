﻿var logger = require('./logger')
    , _ = require('lodash')

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g

function init()
{
    logger.config({ level: 'debug', toConsole: true });
}

var defaults = {
    apiKey: '',
    password: '',
    sitename: '',
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
        chargify: _.defaults({}, options.chargify, defaults),
        productFamilies: options.productFamilies || []
    }

    var site = new Site({ name: sitename },options);
    return site;
}

init();