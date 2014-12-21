var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/subscriptions');

var Subscription = require('../entity/subscription') 
    , Product = require('../entity/product')
    , Customer = require('../entity/customer')
    , Site = require('../entity/site')

var Subscriptions = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    new: function(data)
    {
        if (this[data.id])
            return this[data.id];
        else
            return this.add(new Subscription(data, { parent: this.parent }));
    },
    wrap: function (id)
    {
        return this.new({ id: id })
    },
    loadById: function(subscriptionId,options)
    {
        var self = this;
        return this.load(_.extend({}, options, { path: 'subscriptions/' + subscriptionId + '.json', maxRecords: 1 }))
            .then(function()
            {
                return self.id(Number(subscriptionId));
            })
    },
    load: function (options)
    {
        options = _.defaults({}, options,
            { dataCallback: function()
            {
                var subs = parseSubscriptions.apply(parseSubscriptions,arguments);
                return Collection.Promise.when(options.subscriptionsCallback && options.subscriptionsCallback(subs))
                    .then(function()
                    {
                        return subs;
                    })
            }});

        if (!options.path)
        {
            if (this.parent instanceof Customer)
                options.path = 'customers/' + this.parent.id + '/subscriptions.json';
            else if (this.parent instanceof Site)
                options.path = 'subscriptions.json';
        }
        return this.pagedLoad(options)
    }
})

function parseSubscriptions(subscriptions, response, body,options)
{
    options = _.defaults({},options, {addToCollection:true});
    var subscriptionsObj = _.isString(body) ? JSON.parse(body) : body;
    if (!_.isArray(subscriptionsObj))
        subscriptionsObj = [subscriptionsObj];

    _.each(subscriptionsObj, function (o)
    {
        var subscriptionObj = o.subscription;
        var subscription = new Subscription(_.extend({}, _.omit(subscriptionObj, 'product','customer', 'credit_card'),
            {
                _product: subscriptionObj.product, _customer: subscriptionObj.customer,
                _credit_card: subscriptionObj.credit_card, _components: subscriptionObj.components
            })
            , { parent: subscriptions.parent });
        if (options.addToCollection)
            subscriptions.add(subscription);
        if (_.isFunction(options.entityCallback))
            options.entityCallback(subscription);

    })
    return subscriptionsObj;
}
module.exports = Subscriptions;


logger.debug('END collections/subscriptions');