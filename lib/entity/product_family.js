var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
logger.debug('BEGIN entity/product_family')


var ProductFamilySchema = new Entity.SchemaObject({
    name: {type:String, toObject:'always'},
    handle: {type:String,toObject:'hasValue'},
    id: {type:Number, toObject:'hasValue'}
})
var ProductFamily = Entity.extend(ProductFamilySchema, {
    constructor: function (data, options)
    {
        logger.debug('New ProductFamily');
        this.Entity.call(this, data, options);
        this.products = new Products({ parent: this });
        this.components = new ProductFamilyComponents({ parent: this });
        this.coupons = new Coupons({ parent: this });
    },
    initialize: function (data, options)
    {
        options = options || {};
    },
    load: function (options)
    {
        return this.parentSite.productFamilies.loadByProducts({ productFamilyId: this.id });
    },
    save: function (options)
    {
        var method = this.id ? 'put' : 'post';
        var path = this.id
            ? 'product_families/' + this.id + '.json'
            : 'product_families.json';

        var self = this;
        var o = { product_family: this.toObject() };
        return this.parentSite.wrappedRequest(method, path, o, [200,201], options)
            .spread(function (response,body)
            {
                if (body.product_family)
                {
                    _.extend(self, body.product_family);
                }
                return self;
            })
    }

})

module.exports = ProductFamily;
module.exports.Schema = ProductFamilySchema;

var Products = require('../collections/products')
    , ProductFamilyComponents = require('../collections/product_family_components')
    , Product = require('./product')
    , Coupons = require('../collections/coupons')

logger.debug('END entity/product_family')