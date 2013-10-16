var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/product_families');

var ProductFamily = require('../entity/product_family')

var ProductFamilies = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
        this._loaded = false;
    },
    new: function(data)
    {
        return this.add(new ProductFamily(data, { parent: this.parent }));
    },
    wrap: function (id)
    {
        return this.add(new ProductFamily({ id: id}, { parent: this.parent }));
    },
    load: function(options)
    {
        options = options || {};
        var path = 'products.json';
        if (options.productFamilyId)
            path = 'product_families/' + options.productFamilyId + '/products.json';
        return this._super({ path: path, dataCallback: parseProducts.bind(this) })
    }

})

function parseProducts(productFamilies, response, body)
{
    var self = this;
    var productsObj = _.isString(body) ? JSON.parse(body) : body;
    if (!_.isArray(productsObj))
        productsObj = [productsObj];

    _.each(productsObj, function (o)
    {
        var productObj = o.product;
        var productFamily = productFamilies.find({ id: productObj.product_family.id });
        if (!productFamily)
            productFamilies.add((productFamily = new ProductFamily(productObj.product_family, { parent: productFamilies.parent })));
        else if (!productFamily.handle)
            _.extend(productFamily, productObj.product_family);
        var product = productFamily.products.new(productObj, { parent: productFamily });
        // self.parentSite.products.add(product);
    })

    return productsObj;

}

module.exports = ProductFamilies;
module.exports.parse = parseProducts;
logger.debug('END collections/product_families');
