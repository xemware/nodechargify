var Entity = require('./entity')
    , logger = require('../logger')

logger.debug('BEGIN entity/credit_card');

var CreditCardSchema = new Entity.SchemaObject({
    firstName: { type: 'alias', index: 'first_name' },
    lastName: { type: 'alias', index: 'last_name' },
    fullNumber: { type: 'alias', index: 'full_number' },
    maskedCardNumber: { type: 'alias', index: 'masked_card_number' },
    expirationMonth: { type: 'alias', index: 'expiration_month' },
    expirationYear: { type: 'alias', index: 'expiration_year' },
    billingAddress: { type: 'alias', index: 'billing_address' },
    billingAddress2: { type: 'alias', index: 'billing_address_2' },
    billingCity: { type: 'alias', index: 'billing_city' },
    billingState: { type: 'alias', index: 'billing_state' },
    billingZip: { type: 'alias', index: 'billing_zip' },
    billingCountry: { type: 'alias', index: 'billing_country' },
    vaultToken: { type: 'alias', index: 'vault_token' },
    customerVaultToken: { type: 'alias', index: 'customer_vault_token' },
    currentVault: { type: 'alias', index: 'current_vault' },
    lastFour: { type: 'alias', index: 'last_four' },
    cardType: { type: 'alias', index: 'card_type' },

    id: { type: Number },
    first_name: { type: String, toObject: 'hasValue' },
    last_name: { type: String, toObject: 'hasValue' },
    full_number: { type: String, toObject: 'hasValue' },
    masked_card_number: { type: String },
    expiration_month: { type: Number, toObject: 'hasValue' },
    expiration_year: { type: Number, toObject: 'hasValue' },
    cvv: { type: String, toObject: 'hasValue' },
    billing_address: { type: String, toObject: 'changed' },
    billing_address_2: { type: String, toObject: 'changed' },
    billing_city: { type: String, toObject: 'changed' },
    billing_state: { type: String, toObject: 'changed' },
    billing_zip: { type: String, toObject: 'changed' },
    billing_country: { type: String, toObject: 'changed' },
    vault_token: { type: String,toObject:'hasValue' },
    customer_vault_token: { type: String,toObject:'hasValue' },
    current_vault: { type: String ,toObject:'hasValue'},
    last_four: { type: String },
    card_type: { type: String,toObject:'hasValue' }
})
var CreditCard = Entity.extend(CreditCardSchema, {
    constructor: function (data, options)
    {
        logger.debug('New CreditCard');
        this.Entity.apply(this, arguments);

    },
    initialize: function (data, options)
    {
        options = options || {};
    }
})

module.exports = CreditCard;
module.exports.Schema = CreditCardSchema;

logger.debug('END entity/credit_card');