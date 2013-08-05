var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/allocation')

var AllocationSchema = new Entity.SchemaObject({
    subscriptionId: { type: 'alias', index: 'subscription_id' },
    componentId: { type: 'alias', index: 'component_id' },
    previousQuantity: { type: 'alias', index: 'previous_quantity' },

    quantity: { type: Number, toObject: 'always' },
    memo: { type: String, toObject: 'hasValue' },
    subscription_id: { type: Number, toObject: 'never' },
    component_id: { type: Number, toObject: 'never' },
    timestamp: { type: Date, toObject: 'never' },
    previous_quantity: { type: Number, toObject: 'never' },
})
var Allocation = Entity.extend(AllocationSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Allocation');
        this.Entity.apply(this, arguments);
    },
    initialize: function (data, options)
    {
        options = options || {};
    }
})

module.exports = Allocation;

logger.debug('END entity/allocation')