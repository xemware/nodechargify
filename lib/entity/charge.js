var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/charge')

var ChargeSchema = new Entity.SchemaObject({
    useNegativeBalance: { type: 'alias', index: 'use_negative_balance' },
    delayCapture: { type: 'alias', index: 'delay_capture' },
    endingBalance: { type: 'alias', index: 'ending_balance' },
    transactionType: { type: 'alias', index: 'transaction_type' },
    createdAt: { type: 'alias', index: 'created_at' },
    amount: { type: Number, toObject: 'always' },
    memo: { type: String, toObject: 'always' },
    use_negative_balance: { type: Boolean, toObject: 'hasValue' },
    delay_capture: { type: Boolean, toObject: 'hasValue' },
    success: { type: Boolean, toObject: 'never' },
    ending_balance: { type: Number, toObject: 'never' },
    created_at: { type: Date, toObject: 'never', },
    payment_id: { type: Number, toObject: 'never' },
    type: { type: String, toObject: 'never' },
    transaction_type: { type: String, toObject: 'never'}
})
var Charge = Entity.extend(ChargeSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Charge');
        this.Entity.apply(this, arguments);

    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    save: function (options)
    {
        var self = this;
        var data = { charge: this.toObject() };
        return self.parentSite.request('post', 'subscriptions/' + this.parent.id + '/charges.json', { json: data })
        .then(function ()
        {
            var response = arguments[0][0], body = arguments[0][1];
            if (response.statusCode == 201 || response.statusCode == 200)
            {
                if (body.charge)
                    _.extend(self, _.omit(body.charge, 'ending_balance_in_cents'), { endingBalance: (body.charge.ending_balance_in_cents || 0) / 100 });
                return arguments[0];
            }
            else
                throw new ChargifyError('e' + response.statusCode, response.headers['content-type'].indexOf('json') >= 0 && body)
        })
    }
})

module.exports = Charge;

logger.debug('END entity/charge')