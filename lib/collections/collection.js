﻿var logger = require('../logger')
    , extend = require('../misc/extend')
    , _ = require('lodash')
    , q = require('q')
    , util = require('util')
    , qs = require('querystring')
    , ChargifyError = require('../misc/error').ChargifyError

function Collection(options)
{
    wrap(this, options);
    Array.call(this)
}

util.inherits(Collection, Array);

Collection.extend = extend;
Collection.Promise = q;

module.exports = Collection;

_.extend(Collection.prototype, {
    id: function(id)
    {
        return this.find({ id: id });
    },
    clear: function()
    {
        this.splice(0);
    },
    add: function (entity)
    {
        var existingEntity = this.find({ id: entity.id });
        if (existingEntity)
        {
            var index = this.indexOf(existingEntity);
            this[index] = entity;
        }
        else
        {
            this.push(entity);
            entity.parent = this.parent;
        }
        return entity;
    },
    find: function (options)
    {
        return _.find(this, options);
    },
    where: function (options)
    {
        return _.where(this, options);
    },
    load: function(options)
    {
        return this.pagedLoad(_.extend({}, options, { singlePage: true }))
    },
    pagedLoad: function ()
    {
        var options = {};
        if (_.isString(arguments[0]))
        {
            options.path = arguments[0];
            options.startingPage = arguments[1];
            options.maxRecords = arguments[2];
            options.perPage = arguments[3];
            options.dataCallback = arguments[4];
        }
        else if (_.isObject(arguments[0]))
            options = arguments[0];

        options = _.defaults(options, { startingPage: 1, maxRecords: -1 });

        if (options.perPage > 0 && options.maxRecords > 0 && options.maxRecords < options.perPage)
            options.perPage = options.maxRecords;

        var self = this;
        var recordsLoaded = 0, firstPageRecords = -1;
        var deferred = q.defer();

        loadPage(options.startingPage);
        return deferred.promise;

        function loadPage(pageNumber)
        {
            logger.debug(util.format('Retrieving page %d - \'%s\'', pageNumber, options.path));
            var o = { };
            if (!options.singlePage)
            {
                o.page = pageNumber
                if (options.perPage > 0 )
                    o.per_page = options.perPage;
            }

            var pathOptions = qs.stringify(o);
            var currentPath = options.path + (pathOptions.length ? (options.path.indexOf('?') >= 0 ? '&' : '?') + pathOptions : '');
            self.parentSite.request('get', currentPath, _.pick(options,'v2'))
                .spread(function (response,body)
                {
                    if (response.statusCode != 200 )
                        return deferred.reject(new ChargifyError('e' + response.statusCode, response.headers['content-type'].indexOf('json') >= 0 && body));
                    var args = arguments;
                    var q = Collection.Promise.denodeify(function (callback)
                    {
                        Collection.Promise.when(options.dataCallback && options.dataCallback(self, response, body,options))
                            .then(function(data)
                            {
                                recordsLoaded += data.length;
                                /*
                                 if (options.maxRecords > 0 && data.length < options.maxRecords )
                                 options.perPage = data.length;
                                 */
                                if (firstPageRecords == -1)
                                    firstPageRecords = data.length;
                                return Collection.Promise.when(options.pageCallback && options.pageCallback(response, body, pageNumber, data))
                                    .then(function()
                                    {
                                        callback(null, data);
                                    })
                            })
                            .fail(function(err)
                            {
                                callback(err);
                            })
                    });
                    q()
                        .then(function (data)
                        {
                            if (((recordsLoaded < options.maxRecords || options.maxRecords < 1) && firstPageRecords == data.length && !options.singlePage )
                                && !(options.perPage > 0 && data.length < options.perPage) )
                            {
                                if (options.maxRecords > 0)
                                    options.perPage = Math.min(options.maxRecords - recordsLoaded, options.perPage || 1000000000000);
                                loadPage(++pageNumber)
                            }
                            else
                                deferred.resolve(self);
                        })
                        .fail(function(reason)
                        {
                            logger.debug(util.format('Retrieving page %d - \'%s\' - ERROR:', pageNumber, options.path, reason.stack));
                            var ret = { retry: false, pageNumber: pageNumber};
                            if (options.errCallback)
                            {
                                Collection.promise.when(options.errCallback(reason, ret))
                                    .then(function(_ret)
                                    {
                                        _.extend(ret, _ret);
                                        if (ret.retry)
                                            loadPage(ret.pageNumber);
                                        else
                                            deferred.reject(reason);
                                    })
                            }
                            else
                                deferred.reject(reason);
                        })

                })
        }

    },
    parse: function (name, constructor, collection, response, body)
    {
        var data = _.isString(body) ? JSON.parse(body) : body;
        if (!_.isArray(data))
            data = [data];

        _.each(data, function (item)
        {
            var entity = new constructor(item[name], { parent: collection.parent });
            collection.add(entity);
        })
        return data;
    }

})

function wrap(that, options)
{
    options = options || {};
    Object.defineProperties(that, {
        parent: {
            get: function ()
            {
                return options.parent;
            },
            set: function (value)
            {
                options.parent = value
            }
        },
        parentSubscription: {
            get: function ()
            {
                var Subscription = require('../entity/subscription');
                var parent = that;
                while (parent)
                {
                    if (parent instanceof Subscription)
                        return parent;
                    parent = parent.parent;
                }
            }
        },
        parentSite: {
            get: function ()
            {
                var Site = require('../entity/site');
                var parent = that;
                while (parent)
                {
                    if (parent instanceof Site)
                        return parent;
                    parent = parent.parent;
                }
            }
        }
    })
}
