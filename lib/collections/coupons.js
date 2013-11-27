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
    wrap: function (code)
    {
        return this.new({ code: code})
    },
    new: function(data)
    {
        if (this[data.id])
            return this[data.id];
        else
            return this.add(new Coupon(data, { parent: this.parent }));

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
    loadByCode: function (code, productFamilyId)
    {
        var self = this, reqPath = '';
        if (productFamilyId)
            reqPath = 'product_families/' + productFamilyId + '/' + reqPath;

        reqPath = reqPath + 'coupons/find.json?code=' + code;
        var self = this;
        return this.load({ path: reqPath, singlePage: true, maxRecords: 1 })
            .then(function ()
            {
                return self.find({ code: code});
            })
            .fail(function(err)
            {
                throw new Error(err.body.errors)
            })

    },
    validate: function(code, productFamilyId)
    {
        var self = this;
        var reqPath = 'coupons/validate.json?code=' + code;
        if (productFamilyId)
            reqPath = 'product_families/' + productFamilyId + '/' + reqPath;
        return this.load({ path: reqPath, singlePage: true, maxRecords: 1 })
            .then(function ()
            {
                return self.find({ code: code });
            })
            .fail(function(err)
            {
                throw new Error(JSON.parse(err.body).errors)
            })

    },
    usage: function(code, productFamilyId)
    {
        return this.wrap(code).getUsage();
    },
    load: function (options)
    {
        options = _.defaults({}, options, { path: 'coupons.json', perPage: 50, dataCallback: this.parse.bind(null, 'coupon', Coupon) })
        return this.pagedLoad(options)
    }
})


module.exports = Coupons;

logger.debug('END collections/coupons');
