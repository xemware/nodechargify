nodechargify [![Build Status](https://travis-ci.org/xemware/nodechargify.png?branch=master)](https://travis-ci.org/xemware/nodechargify)
============

A Node JS wrapper for the Chargify REST API providing an intuitive hierarchical interface to reading data and performing operations.

The Chargify API documentation can be found at http://docs.chargify.com/api-introduction

Installation:
```
npm install nodechargify
```

Basic usage:

```
var nodechargify = require('nodechargify')
var site = nodechargify.connectSite('mockgentest', {
    chargify: { apiKey: '12345678' }
})

site.load() // Loads site stats and Products
    .then(function ()
    {
        console.log(site.toObject( ));
        site.productFamilies.forEach(function(productFamily)
        {
            console.log('Product family: ' + productFamily.name);
            productFamily.products.forEach(function(product)
            {
                console.log(' - Product: ' + product.name);
            })
            // Required
            process.exit();
        })
    })
    .fail(function(reason)
    {
        console.log(reason);
    })
```
Output:
```
{ sellerName: 'xemware',
  siteName: 'MockGenTest',
  stats:
   { revenueThisMonth: '$123.00',
     totalSubscriptions: 3,
     revenueToday: '$0.00',
     totalRevenue: '$502.77',
     revenueThisYear: '$123.00' } }
Product family: MockGen
 - Product: Casual
 - Product: Regular
 - Product: Premium
 - Product: Ultimate
```

Documentation
=============

nodechargify uses Promises/A+ instead of callbacks for almost all operations as it helps avoid callback hell and the need to use a library like async.

Read the spec: http://promises-aplus.github.com/promises-spec/

The `q` module provides the Promises implementation: http://documentup.com/kriskowal/q/

All site operations are accessed through the Site object, or a child object - nodechargify implements an intuitive hierarchical model:
- Site -> Product Family -> Products
- Site -> Subscriptions
- Site -> Customers -> Customer -> Subscriptions
- Subscription -> Components -> Usages
- and so on.

###Connect to a site
```
var nodechargify = require('nodechargify');
var site = nodechargify.connectSite('<sitename>', { chargify: { apiKey: '<apikey from dashboard>' } };
```
Preload site stats and product families/products:
```
site.load()
  .then(function()
  {
    console.log('Site stats and product definitions loaded');
  })
```

###Product Families
You cannot create a Product Family via the API.  

To quickly perform operations on a Product Family without performing a load you can simply create a ProductFamily wrap using it's id (visible in the Products tab of the dashboard).
```
var productFamily = site.productFamilies.wrap(12144);
productFamily.load()
    .then(function ()
    {
        console.log('Product family: ' + productFamily.name);
        productFamily.products.forEach(function(product)
        {
            console.log(' - Product: ' + product.name);
        })
    })
    .fail(function(reason)
    {
        console.log(reason);
    })
```
###Product Family Components

###Products

###Customers

###Subscriptions

###Subscription Components

###Charges

###Allocations

###Events

###Transactions

###Statements





#Tests
To be provided

---

Copyright 2013 Tim Shnaider @ [xemware](http://www.xemware.com)

Distributed under [MIT license](http://mutedsolutions.mit-license.org/).