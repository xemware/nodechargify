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
    newProductFamily: function (sitename, id, handle)
    {
        return this.add(new ProductFamily({ name: sitename, id: id, handle: handle }, { parent: this.parent }));
    },
    load: function(options)
    {
        return this._super({ path: 'products.json', dataCallback: parseProducts })
    }

})

function parseProducts(productFamilies, response, body)
{
    var productsObj = JSON.parse(body);
    if (!_.isArray(productsObj))
        productsObj = [productsObj];

    _.each(productsObj, function (o)
    {
        var productObj = o.product;
        var productFamily = productFamilies.find({ id: productObj.product_family.id });
        if (!productFamily)
            productFamilies.add((productFamily = new ProductFamily(productObj.product_family, { parent: productFamilies.parent })));
        var product = productFamily.products.new(productObj, { parent: productFamily });
    })
    return productsObj;

}

module.exports = ProductFamilies;

logger.debug('END collections/product_families');
