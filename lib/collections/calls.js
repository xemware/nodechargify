var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/calls');

var Call;

var Calls = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
        Call = require('../entity/call');
    },
    loadById: function(callId)
    {
        var self = this;
        return this.load({ path: 'calls/' + callId,singlePage: true, maxRecords: 1 })
            .then(function()
            {
                return self.id(callId);
            })
    },
    load: function (options)
    {

        options = _.defaults({}, options, { v2:true,startingPage: 1, maxRecords: -1, perPage: 20, dataCallback: this.parse.bind(null, 'call', Call) })
        return this.pagedLoad(options)
    }

})

module.exports = Calls;

logger.debug('END collections/calls');