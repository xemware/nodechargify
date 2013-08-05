var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')
    , qs = require('querystring')

logger.debug('BEGIN collections/transactions');

var Transaction, Site, Subscription;

var Transactions = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
        Transaction = require('../entity/transaction');
        Site = require('../entity/site')
        Subscription = require('../entity/subscription')
    },
    load: function (options)
    {
        options = _.defaults({}, options, { startingPage: 1, maxRecords: -1, perPage: 20, dataCallback: this.parse.bind(null, 'transaction', Transaction) })
        if (this.parent instanceof Subscription)
            options.path = 'subscriptions/' + this.parent.id + '/transactions.json';
        else if (this.parent instanceof Site)
            options.path = 'transactions.json';

        var o = { };
        if (options.kinds )
            o['kinds[]'] = options.kinds;
        if (options.sinceId)
            o.since_id = options.since_id;
        if (options.sinceDate)
            o.since_date = DateString(options.sinceDate);
        if (options.untilDate)
            o.until_date = DateString(options.untilDate);
        if (options.maxId)
            o.max_id = options.max_id;
        if (options.direction)
            o.direction = options.direction;

        options.path = options.path + '?' + qs.stringify(o);

        return this.pagedLoad(options)
    }
})

function DateString(d)
{
    function pad(n) { return n < 10 ? '0' + n : n }
    return d.getUTCFullYear() + '-'
        + pad(d.getUTCMonth() + 1) + '-'
        + pad(d.getUTCDate())
}
module.exports = Transactions;

logger.debug('END collections/transactions');