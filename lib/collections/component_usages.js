var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/component_usages');

var ComponentUsage = require('../entity/component_usage')


var ComponentUsages = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    new: function(data)
    {
        return new ComponentUsage(data, { parent: this.parent });
    },
    wrap: function (id)
    {
        return this.new({ id: id })
    },
    load: function (options)
    {
        options = _.defaults({}, options, { page: 1, perPage: 20, maxRecords: -1, dataCallback: this.parse.bind(null, 'usage', ComponentUsage) });
        if (!options.subscriptionId) options.subscriptionId = this.parent.parent.id;
        if (!options.componentId) options.componentId = this.parent.id;
        options.path = 'subscriptions/' + options.subscriptionId + '/components/' + options.componentId + '/usages.json';

        return this.pagedLoad(options)
    }
})

module.exports = ComponentUsages;

logger.debug('END collections/component_usages');
