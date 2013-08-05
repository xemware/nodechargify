var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')
    , qs = require('querystring')

logger.debug('BEGIN collections/allocations');

var Allocation = require('../entity/allocation')

var Allocations = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    add: function(entity)
    {
        this.push(entity);
        entity.parent = this.parent;
        return entity;
    },
    load: function (options)
    {
        options = _.defaults({}, options, { page: 1, perPage: 50, maxRecords: -1, dataCallback: this.parse.bind(null, 'allocation', Allocation) });
        if (!options.subscriptionId) options.subscriptionId = this.parent.parent.id;
        if (!options.componentId) options.componentId = this.parent.id;
        options.path = 'subscriptions/' + options.subscriptionId + '/components/' + options.componentId + '/allocations.json';

        return this.pagedLoad(options)
    }
})

module.exports = Allocations;

logger.debug('END collections/allocations');