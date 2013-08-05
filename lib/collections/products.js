var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/products');

var Product = require('../entity/product')

var Products = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    new: function(data)
    {
        return this.add(new Product(data, { parent: this }));
    },
    wrap: function (id)
    {
        return this.new({ id: id })
    },
    load: function (options)
    {
        return this._super({ path: 'product_families/' + this.parent.id + '/products.json', dataCallback: this.parse.bind(null, 'product', Product) })
    }
})

module.exports = Products;


logger.debug('END collections/products');
