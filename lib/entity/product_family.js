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
        this.products = new Products({ parent: this })
        this.components = new ProductFamilyComponents({ parent: this })
    },
    initialize: function (data, options)
    {
        options = options || {};
    }
})

module.exports = ProductFamily;
module.exports.Schema = ProductFamilySchema;

var Products = require('../collections/products')
    , ProductFamilyComponents = require('../collections/product_family_components')

logger.debug('END entity/product_family')