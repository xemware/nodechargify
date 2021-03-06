﻿var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , qs = require('querystring')
    , ChargifyError = require('../misc/error').ChargifyError
    , util = require('util')
    
logger.debug('BEGIN entity/subscription_component')
 
var ComponentUsages = require('../collections/component_usages');
var ComponentUsage = require('./component_usage');
var Allocations = require('../collections/allocations');
var Allocation = require('./allocation');

var SubscriptionComponentSchema = new Entity.SchemaObject({
    id: { type: 'alias', index: 'component_id' },
    allocatedQuantity: { type: 'alias', index: 'allocated_quantity' },
    pricingScheme: { type: 'alias', index: 'pricing_scheme' },

    name: { type: String, toObject: 'never' },
    component_id: { type: Number, toObject: 'hasValue' },
    unit_name: { type: String, toObject: 'never' },
    kind: { type: String, toObject: 'never' },
    allocated_quantity: { type: Number, toObject: 'hasValue' },
    pricing_scheme: { type: String },
    enabled: { type: Boolean }
})
var SubscriptionComponent = Entity.extend(SubscriptionComponentSchema, {
    constructor: function (data, options)
    {
        logger.debug('New SubscriptionComponent');
        this.Entity.apply(this, arguments);
        this.meteredUsage = new ComponentUsages({ parent: this });
        this.allocations = new Allocations({ parent: this });
    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    recordUsage: function(quantity, memo, options)
    {
        var path = 'subscriptions/' + this.parent.id + '/components/' + this.id + '/usages.json';

        var self = this;
        var o = { usage: { quantity: quantity } };
        if (memo) o.usage.memo = memo;

        return this.parentSite.wrappedRequest('post', path, o, [200,201], options)
            .then(function ()
            {
                var response = arguments[0][0], body = arguments[0][1];
                return self.meteredUsage.add(new ComponentUsage(body.usage));
            })
    },
    setEnabled: function(enabled, options)
    {
        var o = { component: { enabled: enabled } };
        return this.set(o, options);
    },
    setQuantity: function (quantity,options)
    {
        var o = { component: { allocated_quantity: quantity } };
        return this.set(o, options);
    },
    setAllocation: function (quantity,memo,upgradeProration, downgradeProration)
    {
        return this.allocations.set(quantity,memo,upgradeProration, downgradeProration)
    }
})

function defineProperties(that)
{
}

module.exports = SubscriptionComponent;
module.exports.Schema = SubscriptionComponentSchema;

var Subscription = require('./subscription');

logger.debug('END entity/subscription_component')
