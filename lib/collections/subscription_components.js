var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/subscription_components');

var SubscriptionComponent = require('../entity/subscription_component')

var SubscriptionComponents = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    loadById: function (componentId)
    {
        return this.load({ path: 'subscriptions/' + this.parent.id + '/components/' + componentId + '.json', maxRecords: 1  })
    },
    load: function (options)
    {
        return this._super({ path: 'subscriptions/' + this.parent.id + '/components.json', dataCallback: this.parse.bind(null, 'component', SubscriptionComponent) })
    },
    new: function (data)
    {
        if (this[data.id])
            return this[data.id];
        else
            return this.add(new SubscriptionComponent(data, { parent: this.parent }));
    },
    wrap: function (id)
    {
        return this.new({ id: id })
    }
})

module.exports = SubscriptionComponents;

logger.debug('END collections/subscription_components');