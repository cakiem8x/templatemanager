var url = require('url'),
    qs = require('querystring');

module.exports = function(req, params) {
    var urlParams = qs.parse(url.parse(req.url).query);
    for (var k in params) {
        urlParams[k] = params[k];
    }
    return '?' + qs.stringify(urlParams);
};