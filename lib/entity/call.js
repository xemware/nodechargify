var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/call')

var CallSchema = new Entity.SchemaObject({

    id: { type: String, toObject: 'always' }
})
var Call = Entity.extend(CallSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Call');
        this.Entity.apply(this, arguments);

    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    _toObject: function (options)
    {
        return _.extend(this._super(options));
    }
})

module.exports = Call;

logger.debug('END entity/call')