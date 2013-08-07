var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/coupons');

var Coupon = require('../entity/coupon')


var Coupons = Collection.extend({
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
        return new Coupon(data, { parent: this.parent });
    },
    loadById: function(id)
    {
        var self = this;
        return this.load({ path: 'coupons/' + id + '.json', singlePage: true, maxRecords: 1})
            .then(function()
            {
                return self.find({ id: id });
            })
    },
    loadByCode: function (code, all)
    {
        var self = this;
        return this.load({ path: 'coupons/lookup.json?reference=' + ref, singlePage: true, maxRecords: 1 })
            .then(function ()
            {
                return self.find({ reference: ref });
            })

    },
    load: function (options)
    {
        options = _.defaults({}, options, { path: 'coupons.json', perPage: 50, dataCallback: this.parse.bind(null, 'coupon', Coupon) })
        return this.pagedLoad(options)
    }
})


module.exports = Coupons;

logger.debug('END collections/coupons');
