var path     = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        root: rootPath
    },
    test: {
        root: rootPath
    },
    production: {
        root: rootPath
    }
};