var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/subscription_components');

var SubscriptionComponent = require('../entity/subscription_component')
var Allocation = require('../entity/allocation');

var SubscriptionComponents = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    loadById: function (componentId)
    {
        return this.load({ path: 'subscriptions/' + this.parent.id + '/components/' + componentId + '.json', maxRecords: 1  })
    },
    load: function (options)
    {
        return this._super({ path: 'subscriptions/' + this.parent.id + '/components.json', dataCallback: this.parse.bind(null, 'component', SubscriptionComponent) })
    },
    new: function (data)
    {
        if (this[data.id])
            return this[data.id];
        else
            return this.add(new SubscriptionComponent(data, { parent: this.parent }));
    },
    setAllocations: function(allocations, upgradeScheme, downgradeScheme)
    {
        var o = { allocations: allocations};
        if (upgradeScheme)
            o.proration_upgrade_scheme = upgradeScheme;
        if (downgradeScheme)
            o.proration_downgrade_scheme = downgradeScheme;
        o.allocations = allocations;

        var path = 'subscriptions/' + this.parentSubscription.id + '/allocations.json';
        var self = this;
        return this.parentSite.wrappedRequest('post', path, o, [200,201])
            .spread(function (response,body)
            {
                var allocations = [];
                _.each(body, function(allocation)
                {
                    var allocationObj  = new Allocation(allocation.allocation);
                    var component = self.id(allocationObj.component_id);
                    if (!component)
                        component = self.new({ id: allocation.allocation.component_id});
                    component.allocations.add(allocationObj);
                    allocations.push(allocationObj);
                })
                return allocations;
            })

    },
    wrap: function (id)
    {
        return this.new({ id: id })
    }
})

module.exports = SubscriptionComponents;

logger.debug('END collections/subscription_components');