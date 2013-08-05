var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/customers');

var Customer = require('../entity/customer')


var Customers = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    wrap: function (id)
    {
        return this.new({ id: id })
    },
    new: function(data)
    {
        return new Customer(data, { parent: this.parent });
    },
    loadById: function(id)
    {
        var self = this;
        return this.load({ path: 'customers/' + id + '.json', singlePage: true, maxRecords: 1})
            .then(function()
            {
                return self.find({ id: id });
            })
    },
    loadByRef: function (ref)
    {
        var self = this;
        return this.load({ path: 'customers/lookup.json?reference=' + ref, singlePage: true, maxRecords: 1 })
            .then(function ()
            {
                return self.find({ reference: ref });
            })

    },
    load: function (options)
    {
        options = _.defaults({}, options, { path: 'customers.json', perPage: 50, dataCallback: this.parse.bind(null, 'customer', Customer) })
        return this.pagedLoad(options)
    }
})


module.exports = Customers;

logger.debug('END collections/customers');
