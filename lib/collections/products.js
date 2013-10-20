var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/products');

var Product = require('../entity/product')
var Site;

var Products = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
        Site = require('../entity/site')
    },
    new: function(data)
    {
        if (this[data.id])
            return this[data.id];
        else
            return this.add(new Product(data, { parent: this.parent }));

    },

    wrap: function (id)
    {
        return this.new({ id: id })
    },
    loadById: function(id)
    {
        var self = this;
        var path = 'products/' + id + '.json';
        return this.load({ path: path, singlePage: true, maxRecords: 1})
            .then(function()
            {
                return self.find({ id: id });
            })
    },
    load: function (options)
    {
        var path = options.path;
        if (!path)
        {
        if (this.parent instanceof Site)
            path = 'products.json';
        else
            path = 'product_families/' + this.parent.id + '/products.json';
        }

        return this._super({ path: path, dataCallback: this.parse.bind(null, 'product', Product) })
    }
})

module.exports = Products;


logger.debug('END collections/products');
