var logger = require('../logger')
    , extend = require('../misc/extend')
    , _ = require('lodash')
    , q = require('q')
    , util = require('util')
    , qs = require('querystring')

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
        return loadPage(Collection.Promise(), options.startingPage);

        function loadPage(p, pageNumber)
        {
            logger.debug(util.format('Retrieving page %d - \'%s\'', pageNumber, options.path));
            var o = { };
            if (!options.singlePage)
            {
                o.page = pageNumber
                if (options.perPage > 0 )
                    o.per_page = options.perPage;
            }

            var currentPath = options.path + (qs.stringify(o).length ? (options.path.indexOf('?') >= 0 ? '&' : '?') + qs.stringify(o) : '');
            return self.parentSite.request('get', currentPath, _.pick(options,'v2'))
                .spread(function (response,body)
                {
                    if (response.statusCode != 200 )
                        throw { response: response, body: body};

                    var args = arguments;
                    var q = Collection.Promise.denodeify(function (callback)
                    {
                        var data = options.dataCallback(self, response, body);
                        recordsLoaded += data.length;
                        if (options.maxRecords > 0 && data.length < options.maxRecords )
                            options.perPage = data.length;
                        if (firstPageRecords == -1)
                            firstPageRecords = data.length;
                        callback(null, data);
                        if (options.pageCallback)
                            options.pageCallback(response, body, pageNumber, data)
                    });
                    return q()
                        .then(function (data)
                        {
                            if (((recordsLoaded < options.maxRecords || options.maxRecords < 1) && firstPageRecords == data.length && !options.singlePage )
                                && !(options.perPage > 0 && data.length < options.perPage) )
                            {
                                if (options.maxRecords > 0)
                                    options.perPage = Math.min(options.maxRecords - recordsLoaded, options.perPage || 1000000000000);
                                return loadPage(q, ++pageNumber)
                            }
                            else
                                return self;
                        })
                        .fail(function(reason)
                        {
                            logger.debug(util.format('Retrieving page %d - \'%s\' - ERROR:', pageNumber, options.path, reason.stack));
                            throw reason;
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
