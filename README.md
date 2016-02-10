# Ahjo dashboard-ui

Responsive web front-end for accessing different certain representative IT services of the City of Helsinki.
Implemented using Javascript, Angular and Bootstrap.

## Building & development

Installing

* Clone the repository
* Run `npm install` for installing node modules. Calls also `bower install`.
  * (Optional: Run `bower install` for installing bower components)
* Copy your specific environment settings into following directory. Default configurations are read build-time from `conf/app.env.default.json`. Specific settings for a target env may be overridden in
  * `custom/conf/app.env.dev.json`
  * `custom/conf/app.env.test.json`
  * `custom/conf/app.env.prod.json`
  * You may implement only relevant overrides and files listed above, not all are mandatory.

Building

* `grunt` for building for default configuration
* `grunt build:dev|test|prod` for building for a specific configuration
* `grunt preparedeploy` after building for preparing build output for deployment, if necessary.

Running on localhost

* `grunt serve` for preview of the development content
* `grunt serve:dist` for preview of the distribution content

## Testing

Running `grunt test` will run the unit tests with karma.
