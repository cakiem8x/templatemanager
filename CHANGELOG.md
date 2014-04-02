Changelog
=========

## v1.2.0

Not released yet

* [#78](https://github.com/nghuuphuoc/templatemanager/issues/78): Fix "You is not allowed ..." typo
* [#80](https://github.com/nghuuphuoc/templatemanager/issues/80): Add Publish/Ubpublish function for package.
The ```package``` collection now has a new field named ```publish```:

```
> use templatemanager_dev;
> db.package.update({}, {$set: {'publish': true}}, {multi: true});
> db.package.ensureIndex({ publish: 1 });
```

## v1.1.3 (2014-02-13)

* [#70](https://github.com/nghuuphuoc/templatemanager/issues/70): Upgrade Bootstrap to 3.1.0
* [#72](https://github.com/nghuuphuoc/templatemanager/issues/72): Get the user's IP address correctly
* [#73](https://github.com/nghuuphuoc/templatemanager/issues/73): Use Button component for package type selection, Responsive option
* [#74](https://github.com/nghuuphuoc/templatemanager/issues/74): Package listing page: Link to download log page
* [#75](https://github.com/nghuuphuoc/templatemanager/issues/75): Fix 'chanelog' typo
* [#76](https://github.com/nghuuphuoc/templatemanager/issues/76): URL helper: Does not append URI if there is no params
* [#77](https://github.com/nghuuphuoc/templatemanager/issues/77): Upgrade jQuery to 1.11.0 and 2.1.0

## v1.1.2 (2014-01-26)

* Use default Bootstrap theme
* Some UI improvements
* [#60](https://github.com/nghuuphuoc/templatemanager/issues/60): Show the download's browser agent
* [#62](https://github.com/nghuuphuoc/templatemanager/issues/62): Use Button component
* [#64](https://github.com/nghuuphuoc/templatemanager/issues/64): Add "Include downloads" option for each package file
* [#66](https://github.com/nghuuphuoc/templatemanager/issues/66): Upgrade to Bootstrap v3.0.3
* [#67](https://github.com/nghuuphuoc/templatemanager/issues/67): Set the custom menu for account's backend

## v1.1.1 (2014-01-17)

* [#55](https://github.com/nghuuphuoc/templatemanager/issues/55): In account back-end, show the newest packages first
* [#56](https://github.com/nghuuphuoc/templatemanager/issues/56): Show more template info in the front-end
* [#57](https://github.com/nghuuphuoc/templatemanager/issues/57): Cannot choose other template while loading a template
* [#58](https://github.com/nghuuphuoc/templatemanager/issues/58): Hide the Templates/Filter tabs when clicking the Toggle/Device icons
* [#59](https://github.com/nghuuphuoc/templatemanager/issues/59): Show the current year in footer

## v1.1.0 (2013-12-19)

* Require Redis to cache data (account memberships, tags)
* [#3](https://github.com/nghuuphuoc/templatemanager/issues/3): Auto-complete when adding tags
* [#46](https://github.com/nghuuphuoc/templatemanager/issues/46): Show the account's memberships when hovering the account name
* [#49](https://github.com/nghuuphuoc/templatemanager/issues/49): In the production env, remove debug info
* [#50](https://github.com/nghuuphuoc/templatemanager/issues/50): Custom 404, 500 error pages
* [#51](https://github.com/nghuuphuoc/templatemanager/issues/51): Nothing happen when typing the account name and clicking Enter
* [#52](https://github.com/nghuuphuoc/templatemanager/issues/52): Clear subscriptions from session data after signing out
* [#53](https://github.com/nghuuphuoc/templatemanager/issues/53): On the front-end, sort the templates by publishing year, not uploaded date

## v1.0.0 (2013-12-02)

**Front-end**

* Responsive front-end
* View the demo in various device sizes including mobile, tablet, laptop, desktop
* Provide multiple template filters such as year, tag, responsive, etc.

**Back-end**

* Manage packages including templates and extensions
* Manage files
* Manage memberships taken from Amember
* Manage administrators
* Amember account can sign in and download files from packages
* Statistic the top accounts/files/packages
* Browse download history
