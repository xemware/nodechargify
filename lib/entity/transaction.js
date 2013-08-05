var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/transaction')

var TransactionSchema = new Entity.SchemaObject({
    subscriptionId: { type: 'alias', index: 'subscription_id' },
    createdAt: { type: 'alias', index: 'created_at' },
    transactionType: { type: 'alias', index: 'transaction_type' },
    amountInCents: { type: 'alias', index: 'amount_in_cents' },
    startingBalanceInCents: { type: 'alias', index: 'starting_balance_in_cents' },
    endingBalanceInCents: { type: 'alias', index: 'ending_balance_in_cents' },
    paymentId: { type: 'alias', index: 'payment_id' },
    productId: { type: 'alias', index: 'product_id' },
    gatewayTransactionId: { type: 'alias', index: 'gateway_transaction_id' },

    id: { type: Number, toObject: 'always' },
    transaction_type: { type: String, toObject: 'always' },
    amount_in_cents: { type: Number, toObject: 'hasValue' },
    created_at: { type: Date, toObject: 'never' },
    starting_balance_in_cents: { type: Number, toObject: 'hasValue' },
    ending_balance_in_cents: { type: Number, toObject: 'hasValue' },
    memo: { type: String, toObject: 'hasValue' },
    subscription_id: { type: Number },
    product_id: { type: Number },
    success: { type: Boolean },
    payment_id: { type: Number },
    kind: { type: String },
    gateway_transaction_id: { type: String },
})
var Transaction = Entity.extend(TransactionSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Transaction');
        this.Entity.apply(this, arguments);
    },
    initialize: function (data, options)
    {
        options = options || {};
    }
})

module.exports = Transaction;

logger.debug('END entity/transaction')