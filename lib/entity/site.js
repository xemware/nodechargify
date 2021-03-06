﻿var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , request = require('../misc/request_wrapper')
    , ChargifyError = require('../misc/error').ChargifyError

logger.debug('BEGIN entity/site')
   
var SiteSchema = new Entity.SchemaObject({
    sellerName: { type: 'alias', index: 'seller_name', toObject: 'hasValue' },
    siteName: { type: 'alias', index: 'site_name', toObject: 'hasValue' },
    seller_name: { type: String, toObject: 'never' },
    site_name: { type: String, toObject: 'never' },
    stats: { 
        revenueThisMonth: { type: 'alias', index: 'revenue_this_month', toObject: 'hasValue' },
        totalSubscriptions: { type: 'alias', index: 'total_subscriptions', toObject: 'hasValue' },
        subscriptions_today: { type: 'alias', index: 'subscriptions_today', toObject: 'hasValue' },
        revenueToday: { type: 'alias', index: 'revenue_today', toObject: 'hasValue' },
        totalRevenue: { type: 'alias', index: 'total_revenue', toObject: 'hasValue' },
        revenueThisYear: { type: 'alias', index: 'revenue_this_year', toObject: 'hasValue' },

        revenue_this_month: { type: String, toObject: 'never' },
        total_subscriptions: { type: Number, toObject: 'never' },
        subscriptions_today: { type: Number, toObject: 'never' },
        revenue_today: { type: String, toObject: 'never' },
        total_revenue: { type: String, toObject: 'never' },
        revenue_this_year: { type: String, toObject: 'never' }
    }
    
})
var Site = Entity.extend(SiteSchema, {
    constructor: function (data, options)
    {
        logger.debug('New Site');
        this.Entity.call(this, data, options);
        this._request = new request(options.chargify);
        this._loaded = false;
        this.productFamilies = new ProductFamilies({ parent: this });
        this.customers = new Customers({ parent: this });
        this.products = new Products({ parent: this });
        this.subscriptions = new Subscriptions({ parent: this });
        this.calls = new Calls({parent: this});
        var Events = require('../collections/events');
        this.events = new Events({ parent: this });
        var Transactions = require('../collections/transactions');
        this.transactions = new Transactions({ parent: this });
        var Statements = require('../collections/statements');
        this.statements = new Statements({ parent: this });
        this.coupons = new Coupons({parent: this});
        // this.products = new Products({parent: this });
        defineProperties(this);
    },
    load: function ()
    {
        var self = this;
        return this.productFamilies.load()
            .then(function()
            {
                return self.wrappedRequest('get', 'stats.json', {}, [200])
                    .then(function()
                    {
                        var response = arguments[0][0], body = arguments[0][1];
                        var data = _.isObject(body) ? body : JSON.parse(body);
                        self.sellerName = data.seller_name;
                        self.siteName = data.site_name;
                        _.extend(self.stats, data.stats);
                    })
            })
    },
    request: function (method, path, options)
    {
        return Entity.Promise.nbind(this._request[method], this._request)(path, options)
    },
	formatDataForPost: function(data)
	{
		var dataClone = _.cloneDeep(data);
		var self = this;
		_.each(dataClone, function(value,key)
		{
			if (_.isDate(value) )
				dataClone[key] = value.toISOString();
			else if (_.isObject(value) )
				self.formatDataForPost(value);
		});
		return dataClone;
	},
    wrappedRequest: function (method, path, data, okStatusCodes)
    {
        if (_.isNumber(okStatusCodes))
            okStatusCodes = [okStatusCodes];
        else if (!_.isArray(okStatusCodes))
            okStatusCodes = [];

        return this.parentSite.request(method, path, { json: this.formatDataForPost(data) })
        .then(function ()
        {
            var response = arguments[0][0], body = arguments[0][1];
            if (okStatusCodes.indexOf(response.statusCode) < 0  )
                throw new ChargifyError('e' + response.statusCode, response.headers['content-type'].indexOf('json') >= 0 && body);
            return arguments[0];
        })

    }


})

function defineProperties(that)
{
    Object.defineProperties(that, {
        loadedProducts: {
            get: function ()
            {
                var products = [];
                this.productFamilies.forEach(function (productFamily)
                {
                    productFamily.products.forEach(function (product)
                    {
                        products.push(product);
                    })
                });
                this.products.forEach(function(product)
                {
                    if (!_.find(products, { id: product.id }))
                    {
                        products.push(product);
                    }
                });

                return products;
            }
        }
    })
}
module.exports = Site;

var ProductFamilies = require('../collections/product_families')
    , Products = require('../collections/products')
    , Customers = require('../collections/customers')
    , Subscriptions = require('../collections/subscriptions')
    , Calls = require('../collections/calls')
    , Coupons = require('../collections/coupons')
logger.debug('END entity/site')