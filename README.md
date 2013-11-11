Template Managers
=================

Our front-end and back-end for Joomla and Magento demo templates.

## Required

* [ImageMagick CLI](http://www.imagemagick.org)
* [NodeJs](http://nodejs.org)
* [MongoDB](http://mongodb.org)

## Install

* Execute the following command to install node modules which you can see in ```package.json```:

```bash
$ cd <template manager directory>
$ sudo npm install
```

* Run the app:

```bash
$ NODE_ENV=<the environment> PORT=<the listening port> node app.js
```

or run with [forever](https://github.com/nodejitsu/forever):

```bash
$ chmod 755 start.sh
$ nohup start.sh >> /var/log/template_manager.log 2>&1 &
```

## License

Copyright (c) 2013 Nguyen Huu Phuoc

Licensed under the MIT license
