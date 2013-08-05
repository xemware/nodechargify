var Collection = require('./collection')
    , util = require('util')
    , _ = require('lodash')
    , logger = require('../logger')

logger.debug('BEGIN collections/product_family_components');

var ProductFamilyComponent = require('../entity/product_family_component')

var ProductFamilyComponents = Collection.extend({
    constructor: function (options)
    {
        Collection.apply(this, arguments);
    },
    load: function ()
    {
        path = 'product_families/' + this.parent.id + '/components.json';
        return this._super({ path: path, dataCallback: this.parse.bind(null, 'component', ProductFamilyComponent) });
    },
    new: function (data)
    {
        return this.add(new ProductFamilyComponent(data));
    },
    wrap: function (id)
    {
        return this.new({ id: id })
    }

})

function parseComponents(components, response, body)
{
    var componentsObj = JSON.parse(body);
    if (!_.isArray(componentsObj))
        componentsObj = [componentsObj];

    _.each(componentsObj, function (o)
    {
        var componentObj = o.component;
        var component = new ProductFamilyComponent(componentObj,{ parent: components.parent});
        components.add(component);
    })
    return componentsObj;

}

module.exports = ProductFamilyComponents;

logger.debug('END collections/product_family_components');