var should = require('should'),
    _ = require('lodash'),
    nodechargify = require('..');

process.on('uncaughtException', function(err)
{
})
var RequestWrapperMock = function ()
{
    this.err = undefined;
    this.response = {
        statusCode: 200,
        headers: { 'content-type': 'application/json' }
    },
    this.body = undefined;

    this.setErr = function (err)
    {
        this.err = err;
    },
    this.setBody = function (body)
    {
        this.body = body;
    },
    this.setBodyCallback = function (callback)
    {
        this.bodyCallback = callback;
    }

    this.setResponse = function (response)
    {
        _.extend(this.response, response);
    },

    this.setAll = function (err, response, body)
    {
        this.setErr(err);
        this.setResponse(response);
        this.setBody(body);
    };

    this.req = function (method, path, options, callback)
    {
        var body = this.body;
        var response = this.response;
        if (this.bodyCallback)
            body = this.bodyCallback(method, path);
        if (this.responseCallback)
            response = this.responseCallback(method, path);

        callback(this.err, response, body);
    }
    this.get = function (path, options, callback)
    {
        this.req('get', path, options, callback);
    }
    this.post = function (path, options, callback)
    {
        this.req('post', path, options, callback);
    }
    this.put = function (path, options, callback)
    {
        this.req('put', path, options, callback);
    }
    this.delete = function (path, options, callback)
    {
        this.req('delete', path, options, callback);
    }
}

var site;
var requestMock = new RequestWrapperMock();

describe('site operations', function ()
{

    describe('connectSite', function ()
    {
        it('connectSite should return valid site', function (done)
        {
            site = nodechargify.connectSite('sitename', { chargify: { apiKey: '123456' } });
            site.siteName.should.equal('sitename');
            site._request = requestMock;
            done();
        })
    })

    describe('site.load populates site data', function ()
    {
        it('site.load updates site data', function (done)
        {
            requestMock.setBodyCallback(function(method, path)
            {
                console.log(method, path);
                if (path.indexOf('products') >= 0)
                {
                    return {
                        "product": {
                            "price_in_cents": 4900,
                            "name": "Basic",
                            "handle": "basic",
                            "product_family": {
                                "name": 'Family',
                                "handle": 'family',
                                "description": 'family desc',
                                "accounting_code": 'accounting_code'
                            },
                            "description": 'product',
                            "accounting_code": 'code',
                            "interval_unit": "month",
                            "interval": 1
                        }

                    }
                }
                else if (path.indexOf('stats') >= 0)
                {
                    return {
                        "seller_name":"Acme, Inc.",
                        "site_name":"Production",
                        "stats":{
                            "revenue_this_month":"$10,000.00",
                            "total_subscriptions":120,
                            "subscriptions_today":4,
                            "revenue_today":"$1,405.12",
                            "total_revenue":"$45,978.81",
                            "revenue_this_year":"$27,935.24"
                        }
                    }
                }
            });
            site.load()
                .then(function ()
                {
                    site.sellerName.should.equal('Acme, Inc.');
                    done();
                })
                .fail(function(reason)
                {
                    done(reason);
                })

        })
    })    

});
