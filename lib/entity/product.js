

var Entity = require('./entity')
    , logger = require('../logger')

logger.debug('BEGIN entity/product');

var ProductFamily = require('./product_family')
var ProductSchema = new Entity.SchemaObject({
    
    accountingCode: { type: 'alias', index: 'accounting_code' },
    archivedAt: { type: 'alias', index: 'archived_at' },
    createdAt: { type: 'alias', index: 'created_at' },
    initialChargeInCents: { type: 'alias', index: 'initial_charge_in_cents' },
    intervalUnit: { type: 'alias', index: 'interval_unit' },
    priceInCents: { type: 'alias', index: 'price_in_cents' },
    requestCreditCard: { type: 'alias', index: 'request_credit_card' },
    requireCreditCard: { type: 'alias', index: 'require_credit_card' }, 
    returnParams: { type: 'alias', index: 'return_params' }, 
    returnUrl: { type: 'alias', index: 'return_url' },
    trialInterval: { type: 'alia    s', index: 'trial_interval' },
    trialIntervalUnit: { type: 'alias', index: 'trial_interval_unit' },
    trialPriceInCents: { type: 'alias', index: 'trial_price_in_cents' },
    updateReturnUrl: { type: 'alias', index: 'update_return_url' },

    _product_family: { type: ProductFamily.Schema, invisible: true, transform: transformProductFamily },
    accounting_code: String,
    archived_at: Date,
    created_at: Date,
    description: String,
    expiration: Date,
    handle: String,
    id: Number,
    initial_charge_in_cents: Number,
    interval: Number,
    interval_unit: String,
    name: String,
    price_in_cents: Number,
    request_credit_card: Boolean,
    require_credit_card: Boolean, 
    return_params: String, 
    return_url: String,
    trial_interval: Number,
    trial_interval_unit: String,
    trial_price_in_cents: Number,
    update_return_url: String

})

function transformProductFamily(value)
{
    var site = this.parentSite;
    var productFamily = site.productFamilies.find({ id: value.id });
    if (!productFamily)
        productFamily = site.productFamilies.new(value.name, value.id, value.handle);
    this.productFamily = productFamily;

}

var Product = Entity.extend(ProductSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Product');
        this.Entity.apply(this, arguments);
        defineProperties(this);

    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    _toObject: function (options)
    {
        var o = this._super(options);
        o.product_family = this.productFamily.toObject(options);
        return o;
    }

})

function defineProperties(that)
{
    Object.defineProperties(that, {
        productFamily: {
            get: function ()
            {
                return this.parent;
            }
        }
    })
}

module.exports = Product;
module.exports.Schema = ProductSchema;



logger.debug('END entity/product');