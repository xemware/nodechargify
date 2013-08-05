var nodechargify = require('..')
    , util = require('util')
    , _ = require('lodash')

process.on('uncaughtException', function(err)
{
    console.log(err.stack);
})
nodechargify.set('logginglevel', 'debug');

var site = nodechargify.connectSite('mockgentest', {
    chargify: { sitename: 'mockgentest', apiKey: 'jD86B7e6Atzc1ZmWxrsA', password: 'x' }
})
site.productFamilies.load()
    .then(function()
    {
        _.each(site.products,function(product)
        {
            console.log(product.name);
            console.log(product.productFamily.name);
        })
    })
    .then(function ()
    {
        return site.productFamilies[0].components.load()
            .then(function ()
            {
            })

    })
    .then(function()
    {
        return site.customers.loadByRef('762e6cd4-7cc5-4812-815a-0ac584a7bf06')
            .then(function()
            {
                console.log('Total customers loaded', site.customers.length);
                //console.log('Modifying customer 0');
                //// console.log(site.customers[1].toObject());
                //var customer = site.customers[0];
                //customer.firstName = 'Smithy';
                //customer.vatNumber = '123456';
                //console.log(customer.changes({ recurse: true }))
                //return customer.save()
                //    .then(function()
                //    {
                //        process.exit();
                //    })
                var sub = site.subscriptions.wrap(1923756);
                return sub.statements.load()
                    .then(function()
                    {
                        console.log(sub.statements.length);
                        process.exit();
                    })
                return sub.components.load()
                    .then(function()
                    {
                        sub.components.forEach(function (component)
                        {
                            console.log(component.toObject({ all: true }));
                        });
                        // process.exit()
                    })
                    .then(function ()
                    {
                        var component = sub.components.id(21231);
                        return component
                            .setQuantity(5)
                            .then(function()
                            {
                                console.log('errrr');
                                return component.allocations.load({
                                    pageCallback: function (response, body, pageNumber, data)
                                    {
                                        console.log(data[0]);
                                    }
                                });
                            })
                            .then(function()
                            {
                                console.log(component.allocations.length);
                                console.log(component.allocations[0].toObject({ all: true }));
                                process.exit();

                            })
                    })
                    .then(function()
                    {
                        return sub.components.id(21230).meteredUsage.load({ perPage: 2, maxRecords: 5 })
                            .then(function()
                            {
                                return site.events.load({ maxRecords: 1, direction: 'desc' })
                                    .then(function()
                                    {
                                        console.log(site.events[0].toObject({ alias: false }));
                                        process.exit();
                                    })
                                
                            })
                        
                    })
                    
                var metered = subscription.components.new({ id: 21230 });
                return metered.recordUsage(5, 'Smoo')
                    .then(function(usage)
                    {
                        console.log('usage',usage);
                    })
                    .then(function()
                    {
                        return metered.meteredUsage.load();
                    })
                    .then(function()
                    {
                        metered.meteredUsage.forEach(function (usage)
                        {
                            console.log(usage.toObject({ all: true }));
                        });
                    })
                    .then(function()
                    {
                        var onOff = subscription.components.new({ id: 21147 })
                        return onOff.setQuantity(1)
                            .then(function ()
                            {
                                process.exit();
                            });
                    })
                return subscription.postCharge(-100, 'Test charge')
                    .then(function ()
                    {
                        process.exit();
                    })
                return subscription.reactivate()
                    .then(function ()
                    {
                        console.log(subscription);
                        
                    });

                return site.customers[0].subscriptions.load()
                    .then(function(subscriptions)
                    {
                        _.extend(subscriptions[0].creditCard, {
                            firstName: 'Smoo',
                            lastName: 'Smee',
                            fullNumber: '1',
                            expirationMonth: 12,
                            expirationYear: 2013,
                            cvv: '239'
                        })
                        subscriptions[0].creditCard.firstName = 'smoo';

                        console.log(util.inspect(subscriptions[0].toObject({ hasValues: true }), null, null));
                        return subscriptions[0].save()
                            .then(function (o)
                            {
                                return 
                                process.exit(0);
                            });
                        
                    })
            })
    })
    .then(function()
    {
        var component = site.productFamilies[0].components.newComponent({
            name: 'Test7',
            unitName: 'sms', unitPrice: 1, kind: 'on_off_component'
        });
        return component.save()
            .then(function()
            {
                console.log(component.tracking._changes)
                console.log('Saving existing component')
                return component.save();
            })
    })
    .fail(function(reason)
    {
        console.log('e',reason, reason.stack)
    })
// console.log(site.productFamilies[0].parentSite);
