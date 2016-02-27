# Ahjo dashboard-ui

Responsive web front-end for accessing certain representative IT services of the City of Helsinki.
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

Building

* `grunt` for building for default configuration
* `grunt build:dev|test|prod` for building for a specific configuration
* `grunt preparedeploy` after building for preparing build output for deployment, if necessary. Calls a postbuild script in `custom/tools`

Running on localhost

* `grunt serve` for preview of the development content
* `grunt serve:dist` for preview of the distribution content

## Testing

Running `grunt test` will run the unit tests with karma.

## Additional notes
* For grunt toolchain issues: on access rights you may have to use npm version < 5.7
