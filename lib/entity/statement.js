var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/statement')

var Transaction = require('./transaction')
    , Event = require('./event')


var StatementSchema = new Entity.SchemaObject({
    subscriptionId: { type: 'alias', index: 'subscription_id' },
    createdAt: { type: 'alias', index: 'created_at' },
    updatedAt: { type: 'alias', index: 'updated_at' },
    openedAt: { type: 'alias', index: 'opened_at' },
    closedAt: { type: 'alias', index: 'closed_at' },
    settledAt: { type: 'alias', index: 'settled_at' },
    textView: { type: 'alias', index: 'text_view' },
    basicHtmlView: { type: 'alias', index: 'basic_html_view' },
    htmlView: { type: 'alias', index: 'html_view' },
    startingBalanceInCents: { type: 'alias', index: 'starting_balance_in_cents' },
    endingBalanceInCents: { type: 'alias', index: 'ending_balance_in_cents' },
    customerFirstName: { type: 'alias', index: 'customer_first_name' },
    customerLastName: { type: 'alias', index: 'customer_last_name' },
    customerOrganization: { type: 'alias', index: 'customer_organization' },
    customerShippingAddress: { type: 'alias', index: 'customer_shipping_address' },
    customerShippingAddress2: { type: 'alias', index: 'customer_shipping_address_2' },
    customerShippingCity: { type: 'alias', index: 'customer_shipping_city' },
    customerShippingState: { type: 'alias', index: 'customer_shipping_state' },
    customerShippingCountry: { type: 'alias', index: 'customer_shipping_country' },
    customerShippingZip: { type: 'alias', index: 'customer_shipping_zip' },
    customerBillingAddress: { type: 'alias', index: 'customer_billing_address' },
    customerBillingAddress2: { type: 'alias', index: 'customer_billing_address_2' },
    customerBillingCity: { type: 'alias', index: 'customer_billing_city' },
    customerBillingState: { type: 'alias', index: 'customer_billing_state' },
    customerBillingCountry: { type: 'alias', index: 'customer_billing_country' },
    customerBillingZip: { type: 'alias', index: 'customer_billing_zip' },

    id: { type: Number, toObject: 'always' },
    subscription_id: { type: Number},
    created_at: { type: Date },
    updated_at: { type: Date },
    opened_at: { type: Date },
    closed_at: { type: Date },
    settled_at: { type: Date },
    text_view: { type: String },
    basic_html_view: { type: String },
    html_view: { type: String },
    //future_payments: [{
    //}],
    starting_balance_in_cents: { type: Number },
    ending_balance_in_cents: { type: Number },
    customer_first_name: { type: String },
    customer_last_name: { type: String },
    customer_organization: { type: String },
    customer_shipping_address: { type: String },
    customer_shipping_address_2: { type: String },
    customer_shipping_city: { type: String },
    customer_shipping_state: { type: String },
    customer_shipping_country: { type: String },
    customer_shipping_zip: { type: String },
    customer_billing_address: { type: String },
    customer_billing_address_2: { type: String },
    customer_billing_city: { type: String },
    customer_billing_state: { type: String },
    customer_billing_country: { type: String },
    customer_billing_zip: { type: String },
    transactions: { type: Array, arrayType: Transaction.Schema },
    events: { type: Array, arrayType: Event.Schema }

})
var Statement = Entity.extend(StatementSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Statement');
        this.Entity.apply(this, arguments);
    },
    initialize: function (data, options)
    {
        options = options || {};
    }
})

module.exports = Statement;

logger.debug('END entity/statement')