var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/component_usage')

var ComponentUsageSchema = new Entity.SchemaObject(
{
    id: { type: Number },
    quantity: { type: Number },
    memo: { type: String },
    created_at: { type: Date }
})

var ComponentUsage = Entity.extend(ComponentUsageSchema, {
    constructor: function (data, options)
    {
        logger.debug('New ComponentUsage');
        this.Entity.apply(this, arguments);
    },
    initialize: function (data, options)
    {
        options = options || {};
    }
})

module.exports = ComponentUsage;

logger.debug('END entity/component_usage')