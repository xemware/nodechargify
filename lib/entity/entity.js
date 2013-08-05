var q = require('q')
    , logger = require('../logger')
    , _ = require('lodash')
    , extend = require('../misc/extend')
    , promise = require('../misc/promise')
    , SchemaObject = require('node-schema-object')

module.exports.SchemaObject = SchemaObject;

module.exports.extend = function(schema, classProps, staticProps)
{
    schema.extend = extend;
    var Entity = schema.extend(
        {
            constructor: function (data, options)
            {
                logger.debug('New Entity');
                options = options || {};
                wrap(this, options);
                this.options = options;
                schema.call(this, data);
                this._schemaToObject = this.toObject;
                this.toObject = this._toObject;
                _.isFunction(this.initialize) && this.initialize(options);
            },
            _toObject: function (options)
            {
                return this._schemaToObject(options);
            },
            makeError: function (code, data)
            {
                return { code: code, data: data };
            },
            changes: function (options)
            {
                return _.clone(this.tracking._changes);
            }
        })

    return Entity.extend(_.extend(classProps, { Entity: Entity }), staticProps);

}

module.exports.Promise = promise;
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
                var Site = require('./site');
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
