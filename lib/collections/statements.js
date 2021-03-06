﻿var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')
    , qs = require('querystring')

logger.debug('BEGIN collections/statements');

var Statement = require('../entity/statement')
var Site, Subscription;

var Statements = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
        Site = require('../entity/site')
        Subscription = require('../entity/subscription')
    },
    new: function(data)
    {
        if (this[data.id])
            return this[data.id];
        else
            return this.add(new Statement(data, { parent: this.parent }));
    },
    getIds: function(options)
    {
        var ids = [];
        options = _.defaults({}, options, {
            page: 1, maxRecords: -1,
            dataCallback: function (collection, response, body)
            {
                var data = _.isString(body) ? JSON.parse(body) : body;
                ids.push.apply(ids, data.statement_ids);
                return data.statement_ids;
            }
        });
        if (this.parent instanceof Subscription)
            options.path = 'subscriptions/' + this.parent.id + '/statements/ids.json';
        else if (this.parent instanceof Site)
            options.path = 'statements/ids.json';

        var o = {};
        if (options.sort)
            o.sort = options.sort;
        if (options.direction)
            o.direction = options.direction;
        options.path += '?' + qs.stringify(o);

        return this.pagedLoad(options)
            .then(function()
            {
                return ids;
            })
    },
    loadById: function(id)
    {
        return this.load({ singlePage: true, path: 'subscriptions/' + this.parent.id + '/statements/' + id + '.json' })
    },
    load: function (options)
    {
        options = _.defaults({}, options, {
            page: 1, perPage: 50, maxRecords: -1,
            path: 'subscriptions/' + this.parent.id + '/statements.json',
            dataCallback: this.parse.bind(null, 'statement', Statement)
        });

        // ??
        if (!options.subscriptionId) options.subscriptionId = this.parent.parent.id;
        if (!options.componentId) options.componentId = this.parent.id;

        var o = {};
        if (options.sort)
            o.sort = options.sort;
        if (options.direction)
            o.direction = options.direction;
        options.path += '?' + qs.stringify(o);

        return this.pagedLoad(options)
    }
})

module.exports = Statements;

logger.debug('END collections/statements');