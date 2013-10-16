var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/coupon')

var CouponUsageSchema = new Entity.SchemaObject({
    name: { type: 'alias', index: 'product_name'},
    product_name: { type: String, toObject: 'hasValue' },
    revenue: { type: Number, toObject: 'hasValue' },
    signups: { type: Number, toObject: 'hasValue' },
    savings: { type: Number, toObject: 'hasValue'}
})

var CouponSchema = new Entity.SchemaObject({
    allowNegativeBalance: { type: 'alias', index: 'allow_negative_balance' },
    durationPeriodCount: { type: 'alias', index: 'duration_period_count' },
    durationInterval: { type: 'alias', index: 'duration_interval' },
    durationIntervalUnit: { type: 'alias', index: 'duration_interval_unit' },
    couponEndDate: { type: 'alias', index: 'coupon_end_date' },
    conversionLimit: { type: 'alias', index: 'conversion_limit' },
    id: { type: 'alias', index: 'coupon_id' },

    coupon_id: { type: Number, toObject: 'never' },
    name: { type: String, toObject: 'hasValue' },
    code: { type: String, toObject: 'hasValue' },
    description: { type: String, toObject: 'hasValue' },
    percentage: { type: Number, toObject: 'hasValue' },
    amount: { type: Number, toObject: 'hasValue' },
    allow_negative_balance: { type: Boolean, toObject: 'hasValue' },
    recurring: { type: Boolean, toObject: 'hasValue', },
    duration_interval: { type: Number, toObject: 'hasValue' },
    duration_interval_unit: { type: String, toObject: 'hasValue' },
    duration_period_count: { type: Number, toObject: 'hasValue' },
    coupon_end_date: { type: Date, toObject: 'hasValue' },
    conversion_limit: { type: Number, toObject: 'hasValue'},
    product_family_id: { type: Number, toObject: 'hasValue' }
})
var Coupon = Entity.extend(CouponSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Coupon');
        this.Entity.apply(this, arguments);

    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    save: function(options)
    {
        var path = this.id
            ? 'coupon/' + this.id + '.json'
            : 'coupons';
        var method = this.id
            ? 'put'
            : 'post';
        return this.action(method, path, this.toObject({ alias: false }), options);

    },
    archive: function(options)
    {
        return this.action('delete', 'coupons/' + this.id + '.json', {}, options);
    },
    getUsage: function()
    {
        var self = this;
        return this.parentSite.wrappedRequest('get', 'coupons/' + this.id + '/usage.json', {}, [200])
        .then(function ()
        {
            var response = arguments[0][0], body = arguments[0][1];
            return _.map(body, function(product)
            {
                return new CouponUsageSchema(product);
            })
        })
    },
    action: function (method,path, data, options)
    {
        var self = this;
        return self.parentSite.wrappedRequest(method, path, data, [200,201])
        .then(function ()
        {
            var response = arguments[0][0], body = arguments[0][1];
            if (body.coupon)
                _.extend(self, body.coupon);
            return self;
        })
    }
})

module.exports = Coupon;

logger.debug('END entity/coupon')