var Entity = require('./entity')
    , logger = require('../logger')
    , ChargifyError = require('../misc/error').ChargifyError
    , _ = require('lodash')
logger.debug('BEGIN entity/customer')

var CustomerSchema = new Entity.SchemaObject({
    firstName: { type: 'alias', index: 'first_name', toObject: 'never' },
    lastName: { type: 'alias', index: 'last_name', toObject: 'never' },
    createdAt: { type: 'alias', index: 'created_at', toObject: 'never' },
    updatedAt: { type: 'alias', index: 'updated_at', toObject: 'never' },
    vatNumber: { type: 'alias', index: 'vat_number', toObject: 'never' },

    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    organization: { type: String },
    reference: { type: String },
    id: { type: Number, toObject: 'never' },
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
        return this.parentSite.wrappedRequest(method, path, o, [200,201], options)
            .then(function ()
            {
                var response = arguments[0][0], body = arguments[0][1];
                if (body.customer)
                {
                    _.extend(self, body.customer);
                }
                return self;
            })
    }

})


module.exports = Customer;
module.exports.Schema = CustomerSchema;


var Subscriptions = require('../collections/subscriptions')

logger.debug('END entity/customer')