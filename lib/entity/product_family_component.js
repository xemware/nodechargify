var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , ChargifyError = require('../misc/error').ChargifyError
    , util = require('util')
logger.debug('BEGIN entity/product_family_component')
   
var PriceSchema = new Entity.SchemaObject({
    starting_quantity: { type: Number },
    ending_quantity: { type: Number },
    unit_price: { type: Number }
})

var ProductFamilyComponentSchema = new Entity.SchemaObject({
    unitName: { type: 'alias', index: 'unit_name' },
    unitPrice: { type: 'alias', index: 'unit_price' },
    pricingScheme: { type: 'alias', index: 'pricing_scheme' },

    name: { type: String },
    id: { type: Number, toObject: 'always' },
    unit_name: { type: String },
    unit_price: { type: Number },
    pricing_scheme: { type: String },
    prices: { type: Array, arrayType: PriceSchema},
    kind: { type: String },
    archived: { type: Boolean },
    taxable: { type: Boolean }
})
var ProductFamilyComponent = Entity.extend(ProductFamilyComponentSchema, {
    constructor: function (data, options)
    {
        logger.debug('New ProductFamilyComponent');
        this.Entity.apply(this, arguments);

    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    save: function (options)
    {
        var method = this.id ? 'put' : 'post';
        var path = this.id
            ? 'product_families/' + this.parent.id + '/components/' + this.id  + '.json'
            : 'product_families/' + this.parent.id + '/' + this.kind + 's' + '.json';

        var self = this;
        var o = {};
        switch (this.kind)
        {
            case 'on_off_component':
                o[this.kind] = _.pick(this, 'name', 'unit_price');
                break;
            case 'metered_component':
            case 'quantity_based_component':
                o[this.kind] = _.pick(this, 'name', 'unit_price', 'unit_name', 'pricing_scheme');
                if (this.pricingScheme != 'per_unit')
                    o[this.kind] = this.prices.toObject();
                break;
        }
        
        return this.parentSite.wrappedRequest(method, path, o, [200,201], options)
            .then(function ()
            {
                var response = arguments[0][0], body = arguments[0][1];
                self.id = body.component.id;
                return self;
            })
    }
})

module.exports = ProductFamilyComponent;
module.exports.Schema = ProductFamilyComponentSchema;

var ProductFamily = require('./product_family');

logger.debug('END entity/product_family_component')
