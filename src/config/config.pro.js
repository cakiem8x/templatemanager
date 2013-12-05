var path     = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        root: rootPath,
        session: {
            domain: '.templatemanager.dev',
            secret: 'XrQ2Vsw2tESughz71l1B80NwqxA7z499',
            lifetime: 3600 * 1000 * 1       // 1 hour
        },
        db: 'mongodb://localhost/templatemanager_dev',
        upload: {
            dir: '/Volumes/data/projects_workspace/templatemanager',
            maxSize: 1024 * 1024 * 1024 * 2     // 2 GB
        },
        thumbs: {
            dir: '/Volumes/data/projects_workspace/templatemanager/thumbs',
            url: 'http://thumbs.templatemanager.dev',
            versions: {
                square: ['crop', 150],
                small: ['resize', 240],
                medium: ['resize', 640]
            }
        },
        amember: {
            url: 'http://amember.dev',
            key: 'CM1ttnc4YlVEf8QhlXxS'
        },
        provider: {
            name: 'ZooTemplate',
            logo: '/asset/img/logo.png',
            url: 'http://www.zootemplate.com',
            registerUrl: 'http://www.zootemplate.com/member/signup.php'
        },
        url: {
            frontEnd: 'http://templatemanager.dev',
            download: 'http://download.templatemanager.dev'
        },
        redis: {
            host: 'localhost',
            port: 6379,
            prefix: 'templatemanager'
        }
    },
    test: {
        root: rootPath
    },
    production: {
        root: rootPath,
        session: {
            domain: '.zootemplate.com',
            secret: '@Lc:E0:vAm5?kV+70vv4&Wo40@TloZ',
            lifetime: 3600 * 1000 * 24       // 1 day
        },
        db: 'mongodb://localhost/demo_zootemplate',
        upload: {
            dir: '/var/www/html/zootemplate.com/files',
            maxSize: 1024 * 1024 * 1024 * 2     // 2 GB
        },
        thumbs: {
            dir: '/var/www/html/thumbs.zootemplate.com',
            url: 'http://thumbs.zootemplate.com',
            versions: {
                square: ['crop', 150],
                small: ['resize', 240],
                medium: ['resize', 640]
            }
        },
        amember: {
            url: 'http://zootemplate.com/member',
            key: 'DchIUqroGHx5laBZnxEy'
        },
        provider: {
            name: 'ZooTemplate',
            logo: '/asset/img/logo.png',
            url: 'http://www.zootemplate.com',
            registerUrl: 'http://www.zootemplate.com/member/signup.php'
        },
        url: {
            frontEnd: 'http://demo.zootemplate.com',
            download: 'http://download.zootemplate.com'
        },
        redis: {
            host: 'localhost',
            port: 6379,
            prefix: 'zoodemo'
        }
    }
};