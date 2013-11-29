Template Managers
=================

Our front-end and back-end for Joomla and Magento demo templates.

## Screenshots

Front-end:

[Front-end](docs/img/frontend.png)

Administrator back-end:

[Administrator back-end](docs/img/backend-admin.png)

Account back-end:

[Account back-end](docs/img/backend-account.png)


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

## Database

### Init administrator user

From the Mongo shell, create one administrator user with username as ```administrator```, password as ```123456```:

```bash
$ mongo
> use templatemanager_dev;
> db.user.insert({email: 'admin@domain.com', hashed_password: '41d4736be7061d0dd826085dd5c5c773c4703e8a', salt: '1000412025288', username: 'administrator'});
```

You should sign in to the administrator area (```http://domain/admin```) and change the password.

### Indexing database

```bash
$ mongo
> use templatemanager_dev;
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

## License

Copyright (c) 2013 Nguyen Huu Phuoc

Licensed under the MIT license
