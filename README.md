Template Managers
=================

Our front-end and back-end for Joomla and Magento demo templates.

![Front-end](docs/img/frontend.png)

Other screenshots:

* [Administrator back-end](docs/img/backend-admin.png)
* [Account back-end](docs/img/backend-account.png)

## Vision

The software is used to manage the templates/extensions of Joomla, Magento, Wordpress, Drupal, etc.
If your company sell, provide these kind of templates, extensions, then this software is exactly for you.

The software has been used in [production](http://demo.zootemplate.com) at [ZooTemplate](http://zootemplate.com), one of the top Joomla templates/extensions provider in the world.

## Platform

The software is built on [MEAN stack](http://mean.io) which uses the following software:

* [M - MongoDB](http://mongodb.org)
* [E - Express](http://expressjs.com)
* [A - AngularJS](http://angularjs.org)
* [N - NodeJS](http://nodejs.org)

In the details, the software listed below must be installed on your server:

Software                                        | Purpose
------------------------------------------------|----------
[Amember](http://www.amember.com)               | The membership software. Amember users can use their account name/password to sign in and download the file from our back-end
[MongoDB](http://mongodb.org)                   | Database server
[NodeJS](http://nodejs.org)                     | NodeJS web server
[Nginx](http://nginx.org)                       | A web server. You can use other one such as [Apache HTTP server](http://httpd.apache.org)
[ImageMagick](http://www.imagemagick.org)       | Generating templates/extensions thumbnails
[forever](https://github.com/nodejitsu/forever) | Watching, running the app forever without restarting the NodeJS server when updating the source code
[npm](http://npmjs.org)                         | Installing NodeJS modules

Before going to the next step, please ensure that these software are ready. Refer to their documentation for associating installation guides.

## Installing

* Download [the latest versions](https://github.com/nghuuphuoc/templatemanager/releases)
* Unzip and copy the ```src``` directory to particular directory that you want to store the app

Below is the list of steps to install the app:

### Installing NodeJS modules

From the ```src``` directory, execute the command:

```bash
$ sudo npm install
```

The command will install NodeJS modules which are listed in ```package.json```.

### Preparing the database

From the Mongo shell, run the commands (assume that the app will use ```templatemanager_dev``` as the database):

```bash
> use templatemanager_dev;
> db.user.insert({first_name: 'Administrator', last_name: '', email: 'admin@domain.com', hashed_password: '41d4736be7061d0dd826085dd5c5c773c4703e8a', salt: '1000412025288', username: 'administrator', role: 'root', locked: false });
```

At this moment, you can use the administrator account with username as ```administrator```, password as ```123456``` to manage the data in the back-end.
Of course, when the app is ready to launch, you can sign in and change the password later.

Next, index the database by commands:

```bash
> db.download.ensureIndex({ user_name: 1, downloaded_date: 1 });
> db.file.ensureIndex({ last_download: 1, num_downloads: 1 });
> db.package.ensureIndex({ type: 1 });
> db.package.ensureIndex({ created_date: 1 });
> db.package.ensureIndex({ slug: 1 });
> db.package.ensureIndex({ year: 1 });
> db.package.ensureIndex({ tag: 1, responsive: 1, high_resolution: 1 });
> db.user.ensureIndex({ email: 1 });
> db.user.ensureIndex({ username: 1 });
```

### Preparing the domains

### Creating Amember API key

As mentioned in the [Platform](#platform) section, the app connects with Amember for verifying the account and their subscriptions.
Amember allows third parties to do this via an official module named API.

The following steps show you how to install this module:

- Sign in to your Amember back-end
- Click *Setup / Configuration* on the left
- Click the *Plugins* tab on the right
- Choose *api* module from the *Enabled modules* section
- Click the *Save* button

The next steps will generate an API key:

- Click *Remote API Permissions* on the left
- Click the *New Records* button
- Type a comment in the *Comment* field
- In the *Permissions* section, ensure the following checkboxes are ticked:

Section               | Checkboxes
----------------------|-----------
Products              | **index**
Product Billing Plans | **index**, **get**
Check User Access     | **by-login-pass**

- Click the *Save* button

Amember then generates an API key which is shown in the *Api Key* field. We will use this API key in the [Setting](#setting) section.

### Setting

All the app settings are placed in the ```config/config.js``` file:

```javascript
...
module.exports = {
    development: {
    },
    test: {
        root: rootPath
    },
    production: {
        root: rootPath
    }
};
```

This config file allows you to define settings for different environments such as ```development```, ```test``` and ```production```.
The settings in the ```development``` section should be used in the developing phase.
Meanwhile the production site should use the settings in the ```production``` section.

> You can indicate the environment when running the app via ```NODE_ENV``` variable.
> By default, the app will use the ```development``` settings.

Below table describes all the settings in details:

Setting                | Default               | Description
-----------------------|-----------------------|------------
root                   |                       | The root path. Please **DO NOT** change this
session.domain         | n/a                   | The cookie domain
session.secret         | n/a                   | A secret string to encrypt the session data. There are a few of free online tool for generating random key, such as [RandomKeyGen](http://randomkeygen.com)
session.lifetime       | n/a                   | The session lifetime in milliseconds
db                     | n/a                   | The MongoDB connection string: ```mongodb://<database server>/<database name>```
upload.dir             | n/a                   | The path to directory storing uploaded files
upload.maxSize         | n/a                   | Maximum size of uploaded file in kB. ```1024 * 1024 * 20``` allows user to upload files up to 20 MB in size.
thumbs.dir             | n/a                   | The directory stores the generated thumbnails of templates/extensions
thumbs.url             | n/a                   | Prefix URL of thumbnails
thumbs.versions.square | ```['crop', 150]```   | Define the thumbnail generation method and width of thumbnail for square size. The method can be ```crop``` or ```resize```
thumbs.versions.small  | ```['resize', 240]``` | Thumbnail generation method and width for small size
thumbs.versions.medium | ```['resize', 640]``` | Thumbnail generation method and width for medium size
amember.url            | n/a                   | The URL that runs the Amember software
amember.key            | n/a                   | The Amember API key which is generated in the [Creating Amember API key](#creating-amember-api-key) section
provider.name          | n/a                   | Name of provider
provider.logo          | n/a                   | Provider logo URL
provider.url           | n/a                   | Provider URL
provider.registerUrl   | n/a                   | The register URL
url.frontEnd           | n/a                   | The front-end URL
url.download           | n/a                   | The download URL. In most case, it is the same as ```url.frontEnd```

### Running

After completing all the steps above, the app is ready to launch.

Since the app is written in NodeJS, you can run it like other NodeJS app:

```bash
$ NODE_ENV=<the environment> PORT=<the listening port> node app.js
```

I also provide a shell script (```start.sh```) for running the app forever (the *forever* word means that you don't have to
restart the NodeJS server whenever you update the source code):

```
$ chmod 755 start.sh
$ nohup start.sh >> /var/log/template_manager.log 2>&1 &
```

## License

Copyright (c) 2013 Nguyen Huu Phuoc

Licensed under the MIT license
