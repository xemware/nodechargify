var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')
    , qs = require('querystring')

logger.debug('BEGIN collections/events');

var Event, Site, Subscription;

var Events = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
        Event = require('../entity/event');
        Site = require('../entity/site')
        Subscription = require('../entity/subscription')
    },
    load: function (options)
    {

        options = _.defaults({}, options, { startingPage: 1, maxRecords: -1, perPage: 20, dataCallback: this.parse.bind(null, 'event', Event) })
        if (this.parent instanceof Subscription)
            options.path = 'subscriptions/' + this.parent.id + '/events.json';
        else if (this.parent instanceof Site)
            options.path = 'events.json';

        var o = { };
        if (options.sinceId )
            o.since_id = options.since_id;
        if (options.maxId)
            o.max_id = options.max_id;
        if (options.direction)
            o.direction = options.direction;

        options.path = options.path + '?' + qs.stringify(o);

        return this.pagedLoad(options)
    }
})

module.exports = Events;

logger.debug('END collections/events');