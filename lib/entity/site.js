var Entity = require('./entity')
    , logger = require('../logger')
    , _ = require('lodash')
    , request = require('../misc/request_wrapper')

logger.debug('BEGIN entity/site')

var ProductFamilies = require('../collections/product_families')
    , Customers = require('../collections/customers')
    , Subscriptions = require('../collections/subscriptions')
    

var SiteSchema = new Entity.SchemaObject({
    name: { type: String }
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
        this.subscriptions = new Subscriptions({ parent: this });

        var Events = require('../collections/events');
        this.events = new Events({ parent: this });
        var Transactions = require('../collections/transactions');
        this.transactions = new Transactions({ parent: this });
        var Statements = require('../collections/statements');
        this.statements = new Statements({ parent: this });

        defineProperties(this);
    },
    load: function (reload)
    {
        // return this._productFamilies.load(reload);
    },
    request: function (method, path, options)
    {
        return Entity.Promise.nbind(this._request[method], this._request)(path, options)
    }


})

function defineProperties(that)
{
    Object.defineProperties(that, {
        products: {
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
                return products;
            }
        }
    })
}
module.exports = Site;


logger.debug('END entity/site')