var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/event')

var EventSchema = new Entity.SchemaObject({
    subscriptionId: { type: 'alias', index: 'subscription_id' },
    createdAt: { type: 'alias', index: 'created_at' },

    id: { type: Number, toObject: 'always' },
    key: { type: String, toObject: 'always' },
    message: { type: String, toObject: 'hasValue' },
    subscription_id: { type: Number, toObject: 'hasValue' },
    created_at: { type: Date, toObject: 'never' },
})
var Event = Entity.extend(EventSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Event');
        this.Entity.apply(this, arguments);
        this.eventSpecificData = {};

    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    _toObject: function (options)
    {
        return _.extend(this._super(options), { event_specific_data: this.eventSpecificData });
    }
})

module.exports = Event;

logger.debug('END entity/event')