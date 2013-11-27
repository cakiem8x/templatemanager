/**
 * Templates/Extensions manager. Powered by MEAN stack
 *
 * @link    http://github.com/nghuuphuoc/templatemanager
 * @author  http://twitter.com/nghuuphuoc
 */

var url = require('url'),
    qs = require('querystring');

module.exports = function(req, params, excludedParams) {
    var urlParams = qs.parse(url.parse(req.url).query);
    for (var k in params) {
        urlParams[k] = params[k];
    }
    if (excludedParams) {
        for (k in excludedParams) {
            delete urlParams[excludedParams[k]];
        }
    }
    return '?' + qs.stringify(urlParams);
};