var Entity = require('./entity')
    , logger = require('../logger')

logger.debug('BEGIN entity/product_family')


var ProductFamilySchema = new Entity.SchemaObject({
    name: String,
    handle: String,
    id: Number
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
        return this.parentSite.productFamilies.load({ productFamilyId: this.id });
    }
})

module.exports = ProductFamily;
module.exports.Schema = ProductFamilySchema;

var Products = require('../collections/products')
    , ProductFamilyComponents = require('../collections/product_family_components')
    , Product = require('./product')
    , Coupons = require('../collections/coupons')

logger.debug('END entity/product_family')