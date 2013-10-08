var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError
    , qs = require('querystring')
    , Charge = require('./charge')

logger.debug('BEGIN entity/subscription');

var Customer = require('./customer')
    , CreditCard = require('./credit_card')
    , Product = require('./product')
    , SubscriptionComponents = require('../collections/subscription_components')
    , SubscriptionComponent = require('./subscription_component')

var SubscriptionSchema = new Entity.SchemaObject({

    productHandle: { type: 'alias', index: 'product_handle' },
    productId: { type: 'alias', index: 'product_id' },
    customerId: { type: 'alias', index: 'customer_id' },
    customerReference: { type: 'alias', index: 'customer_reference' },
    balanceInCents: { type: 'alias', index: 'balance_in_cents' },
    totalRevenueInCents: { type: 'alias', index: 'total_revenue_in_cents' },
    currentPeriodStartedAt: { type: 'alias', index: 'current_period_started_at' },
    currentPeriodEndsAt: { type: 'alias', index: 'current_period_ends_at' },
    nextAssessmentAt: { type: 'alias', index: 'next_assessment_at' },
    trialStartedAt: { type: 'alias', index: 'trial_started_at' },
    trialEndedAt: { type: 'alias', index: 'trial_ended_at' },
    activatedAt: { type: 'alias', index: 'activated_at' },
    expiresAt: { type: 'alias', index: 'expires_at' },
    createdAt: { type: 'alias', index: 'created_at' },
    updatedAt: { type: 'alias', index: 'updated_at' },
    cancellationMessage: { type: 'alias', index: 'cancellation_message' },
    nextBillingAt: { type: 'alias', index: 'next_billing_at' },
    vatNumber: { type: 'alias', index: 'vat_number' },
    couponCode: { type: 'alias', index: 'coupon_code' },
    paymentCollectionMethod: { type: 'alias', index: 'payment_collection_method' },
    creditCardId: { type: 'alias', index: 'payment_profile_id' },

    product_handle: { type: String },
    product_id: { type: Number },
    customer_id: { type: Number},
    customer_reference: { type: String },
    payment_profile_id: { type: String },
    id: { type: Number, toObject: 'always' },
    state: { type: String, toObject: 'never' },
    balance_in_cents: { type: Number, toObject: 'never' },
    total_revenue_in_cents: { type: Number, toObject: 'never' },
    current_period_started_at: { type: Date, toObject: 'never' },
    current_period_ends_at: { type: Date, toObject: 'never' },
    next_assessment_at: { type: Date, toObject: 'never' },
    trial_started_at: { type: Date, toObject: 'never' },
    trial_ended_at: { type: Date, toObject: 'never' },
    activated_at: { type: Date, toObject: 'never' },
    expires_at: { type: Date, toObject: 'never' },
    created_at: { type: Date, toObject: 'never' },
    updated_at: { type: Date, toObject: 'never' },
    cancel_at_end_of_period: { type: Boolean },
    cancellation_message: { type: String, readOnly: true },
    next_billing_at: { type: Date },
    vat_number: { type: String },
    coupon_code: { type: String },
    payment_collection_method: { type: String },
    _customer: { type: Customer.Schema, transform: transformCustomer, invisible: true },
    _components: { type: Array, transform: transformComponents, arrayType: SubscriptionComponent.Schema, invisible: true },
    _credit_card: { type: CreditCard.Schema, transform: transformCreditCard, invisible: true },
    _product: { type: Product.Schema, transform: transformProduct, invisible: true }
    
})

function transformComponents(value)
{
    var self = this;

    if (!value)
        return;

    this.components.splice(0);
    value.forEach(function(componentObj)
    {
        self.add(new SubscriptionComponent(componentObj));
    })
}

function transformCustomer(value)
{
    var site = this.parentSite;
    var customer = site.customers.find({ id: value.id });
    if (!customer)
        customer = site.customers.new(value);
    this.customer = customer;
}

function transformCreditCard(value)
{
    var site = this.parentSite;
    if (this.creditCard)
        _.extend(this.creditCard, value);
    else
        this.creditCard = new CreditCard(value, { parent: this });
}

function transformProduct(value)
{
    var site = this.parentSite;
    var productFamily = site.productFamilies.find({ id: value.product_family.id });
    if (!productFamily)
        productFamily = site.productFamilies.new({ name: value.product_family.name, id: value.product_family.id, handle: value.product_family.handle});

    var product = productFamily.products.find({ id: value.id });
    if (!product)
        product = productFamily.products.new(_.omit(value, 'product_family'));

    this.product = product;
}

var Subscription = Entity.extend(SubscriptionSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Subscription');
        this.Entity.apply(this, arguments);
        this.components = new SubscriptionComponents({ parent: this });
        this.events = new Events({ parent: this });
        this.transactions = new Transactions({ parent: this });
        this.statements = new Statements({ parent: this });
    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    changes: function(options)
    {
        options = options || {};
        return this._super(options);
        if (options.recurse)
        {
        }
    },
    _toObject: function (options)
    {
        var o = this._super(options);
        o.product = this.product.toObject(options);
        o.customer = this.customer.toObject(options);
        o.credit_card_attributes = this.creditCard.toObject(options);
        return o;
    },
    postCharge: function(amount, memo, useNegativeBalance, delayCapture)
    {
        var charge = new Charge({ amount: amount, memo: memo, useNegativeBalance: useNegativeBalance, delayCapture: delayCapture }, { parent: this });
        return charge.save()
            .then(function()
            {
                return charge;
            })
    },
    addCoupon: function(couponCode)
    {

    },
    removeCoupon: function(couponCode)
    {

    },
    cancel: function(message,delayed, options)
    {
        var method = delayed === true ? 'put' : 'delete';
        var o = { subscription: {} }
        if (message)
            o.subscription.cancellation_message = message;
        if (delayed)
            o.subscription.cancel_at_end_of_period = 1;
        return this.action(method, 'subscriptions/' + this.id + '.json', o);
    },
    reactivate: function(includeTrial, preserveBalance, couponCode, options)
    {
        var self = this;
        var path = 'subscriptions/' + this.id + '/reactivate.json';
        var o = {};
        if (includeTrial)
            o.include_trial = 1;
        if (preserveBalance)
            o.preserveBalance = 1;
        if (couponCode)
            o.coupon_code = couponCode;

        if (qs.stringify(o).length)
            path += '?' + qs.stringify(o)

        return this.action('put', path, {});
    },
    resetBalance: function()
    {

    },
    save: function(options)
    {
        var method = this.id ? 'put' : 'post';
        var path = this.id
            ? 'subscriptions/' + this.id + '.json'
            : 'subscriptions.json';

        var self = this;
        return Entity.Promise()
            .then(function ()
            {
                var errors = self.validate();
                if (errors.length)
                    throw new ChargifyError('e1', { errors: errors });
            })
            .then(function ()
            {
                var o = { subscription: _.omit(self.toObject({ hasValue: true }), 'product', 'customer', 'credit_card_attributes') };
                var sub = o.subscription;
                if (!sub.payment_profile_id)
                {
                    var creditCardChanges = self.creditCard.changes();
                    if (creditCardChanges.length)
                        sub.credit_card_attributes = _.omit(self.creditCard.toObject(), 'id','masked_card_number');
                    else
                        if (self.creditCard.id)
                            sub.payment_profile_id = self.creditCard.id;
                }

                if (self.components.length)
                {
                    sub.components = [];
                    self.components.forEach(function(component)
                    {
                        sub.components.push(component.toObject());
                    })
                }

                if (!sub.product_handle || !sub.product_id)
                {
                    sub.product_handle = self.product.handle;
                    if (!sub.product_handle)
                        sub.product_id = self.product.id;
                }

                if (!self.id)
                    if (!sub.customer_id && !sub.customer_reference)
                    {
                        if (self.customer.id)
                            sub.customer_id = self.customer.id;
                        else
                            sub.customer_attributes = self.customer.toObject({ display: 'hasValue' });
                    }
                return self.action(method, path, o)
                    .then(function()
                    {
                        var response = arguments[0][0], body = arguments[0][1];
                        return body;
                    })
            });

    },
    action: function (method, path, data, options)
    {

        var self = this;
        return self.parentSite.wrappedRequest(method, path, data, [200,201], options)
        .then(function ()
        {
            var response = arguments[0][0], body = arguments[0][1];
            if (body.subscription)
            {
                _.extend(self, _.omit(body.subscription, 'product', 'credit_card', 'customer'), 
                    { _product: body.subscription.product, _customer: body.subscription.customer, _credit_card: body.subscription.credit_card })
                    
            }
            return arguments[0];
        })
    },
    validate: function ()
    {
        var errors = [];
        if (!this.productHandleId && !this.productId && !this.product.id && !this.product.handle)
            errors.push(this.makeError('e100'));
        if (!this.customerId && !this.customerReference && !this.customer.id && !this.customer.reference)
            errors.push(this.makeError('e101'));

        return errors;
    }
})
module.exports = Subscription;

var Events = require('../collections/events')
    , Transactions = require('../collections/transactions')
    , Statements = require('../collections/statements')
logger.debug('END entity/subscription');