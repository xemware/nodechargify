var Entity = require('./entity')
    , logger = require('../logger')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/customer')

var CustomerSchema = new Entity.SchemaObject({
    firstName: { type: 'alias', index: 'first_name' },
    lastName: { type: 'alias', index: 'last_name' },
    createdAt: { type: 'alias', index: 'created_at' },
    updatedAt: { type: 'alias', index: 'updated_at' },
    vatNumber: { type: 'alias', index: 'vat_number' },

    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    organization: { type: String },
    reference: { type: String },
    id: { type: Number, toObject: 'always' },
    created_at: { type: Date, toObject: 'never' },
    updated_at: { type: Date, toObject: 'never' },
    vat_number: { type: String },
    address: { type: String },
    address_2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    phone: { type: String }
})
var Customer = Entity.extend(CustomerSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Customer');
        this.Entity.apply(this, arguments);
        this.subscriptions = new Subscriptions({ parent: this })
    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    save: function (options)
    {
        var method = this.id ? 'put' : 'post';
        var path = this.id
            ? 'customers/' + this.id + '.json'
            : 'customers.json';

        var self = this;
        var o = { customer: this.toObject() };
        return this.parentSite.request(method, path, { json: o })
            .then(function ()
            {
                var response = arguments[0][0], body = arguments[0][1];
                if (response.statusCode == 201 || response.statusCode == 200)
                {
                    if (body.subscription)
                    {
                        if (!self.id && body.subscription.id)
                            self.id = body.subscription.id;

                        _.extend(self, _.omit(body.subscription, 'product', 'credit_card', 'customer'),
                            { _product: body.subscription.product, _customer: body.subscription.customer, _credit_card: body.subscription.credit_card })

                    }
                    return arguments[0];
                }
                else
                    throw new ChargifyError('e' + response.statusCode, response.headers['content-type'].indexOf('json') >= 0 && body)
            })
    }

})


module.exports = Customer;
module.exports.Schema = CustomerSchema;


var Subscriptions = require('../collections/subscriptions')

logger.debug('END entity/customer')