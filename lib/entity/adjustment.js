var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/adjustment')

var AdjustmentSchema = new Entity.SchemaObject({
    adjustmentMethod: { type: 'alias', index: 'adjustment_method' },
    amountInCents: { type: 'alias', index: 'amount_in_cents' },
    endingBalanceInCents: { type: 'alias', index: 'ending_balance_in_cents' },
    createdAt: { type: 'alias', index: 'created_at' },
    amount_in_cents: { type: Number, toObject: 'always' },
    amount: { type: Number, toObject: 'always' },
    memo: { type: String, toObject: 'always' },
    success: { type: Boolean, toObject: 'never' },
    ending_balance_in_cents: { type: Number, toObject: 'never' },
    created_at: { type: Date, toObject: 'never' },
    adjustment_method: { type: String, toObject: 'hasValue' },
    type: { type: String, toObject: 'never' }
})
var Adjustment = Entity.extend(AdjustmentSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Adjustment');
        this.Entity.apply(this, arguments);

    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    save: function (options)
    {
        var self = this;
        var data = { adjustment: this.toObject() };
        return self.parentSite.wrappedRequest('post', 'subscriptions/' + this.parent.id + '/adjustments.json', data, [200,201])
        .then(function ()
        {
            var response = arguments[0][0], body = arguments[0][1];
            if (body.adjustment)
                _.extend(self, _.omit(body.adjustment, 'ending_balance_in_cents'), { endingBalance: (body.adjustment.ending_balance_in_cents || 0) / 100 });
            return self;
        })
    }
})

module.exports = Adjustment;

logger.debug('END entity/adjustment')