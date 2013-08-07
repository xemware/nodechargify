var should = require('should'),
    _ = require('lodash'),
    nodechargify = require('..');

var requestWrapperMock = function ()
{

}

describe('site operations', function ()
{
    var site;
    describe('connectSite', function ()
    {
        it('should have set object properties', function()
        {
            site = nodechargify.connectSite('sitename', { chargify: { apiKey: '123456' } });
            site.siteName.should.equal('sitename');
        })
    }
    );
});
   