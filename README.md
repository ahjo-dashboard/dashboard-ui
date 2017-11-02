### Ahjo dashboard-ui

Responsive web front-end for accessing certain representative IT services of the City of Helsinki.
Implemented using Javascript, Angular 1 and Bootstrap 3.

#### Building & development

##### Preconditions

* Install node.js: <https://nodejs.org>
* Install bower: `npm i -g bower`
* Install grunt cli: `npm i -g grunt-cli`

##### Configure project

* Clone the repository
* Run `npm install` for installing node modules. Calls also `bower install`.
  * (Optional: Run `bower install` for installing bower components)
* Copy your specific environment settings into following directory. Default configurations are read build-time from `conf/app.env.default.json`. Specific settings for a target env may be overridden in
  * `custom/conf/app.env.tcs.json` TCS
  * `custom/conf/app.env.dev.json` DEV/WV0001121
  * `custom/conf/app.env.test1.json` IT
  * `custom/conf/app.env.test2.json` HYTE
  * `custom/conf/app.env.test3.json` HARJOITTELU
  * `custom/conf/app.env.test4.json` KOULUTUS
  * `custom/conf/app.env.test5.json` HYTE2
  * `custom/conf/app.env.prod.json` PROD
  * `custom/conf/app.env.prod2.json` AHJO2 (PROD)

##### Building

* `grunt` for building for default target
* `grunt build:tcs|dev|test1|test2|test3|test4|test5|prod|prod2` for building for a specific configuration
* `grunt preparedeploy` after building for preparing build output for deployment, if necessary. Calls a postbuild script in `custom/tools`

##### Running on localhost

* `grunt serve` for preview of the development content
* `grunt serve:dist` for preview of the distribution content

##### Testing

* `grunt test` will run the unit tests using karma.

##### Generating documentation

* `grunt build_architecture_graph` Generates dependency diagrams using graphviz. For issues on installing the grap generator tool see https://github.com/carlo-colombo/angular-modules-graph

#### Known issues

* If a local `grunt` is not found in project folder run `npm i grunt` there (`npm i` should have done it)
* If `compass` is not found
  * Install `ruby` <http://rubyinstaller.org/downloads/>, and be sure to check "Add ruby executables to your PATH" !
  * install compass: `gem install compass`
* If on `grunt` run an indirect npm dependency is missing install it, e.g. "npm i serve-static --save-dev", and be sure to commit the `package.json` update
* For `grunt` toolchain issues: on access rights you may have to use node version < 5.7
* Development on Windows environment
  * ruby/compass not installed by default, install separately
  * If using a "git command prompt" check where it installs packages. It's better to do all the package and grunt operations in an "Administrator command prompt".

### Some key files

|File or folder|Description|
|:-------------|:-----|
| `index.html` | HTML file for this Single Page Application (SPA)
| `app.js` | Declaration and initialization of the angular application
| `app.constants.js` | Declarations of constants
| `app.env.js` | Run-time configuration settings generated during build
| `app.env.default.json` | Default values for run-time configuration settings, overwritten by environment-specific configuration files during build
| `app.routes.js` | State definitions and routes
| `custom/` | Folder under which grunt is configured to search for environment-specific configuration files
| `Gruntfile.js` | Build rules and tasks
| `package.json` | Npm module dependencies. See also `npm-shrinkwrap.json` and `bower.json`. Defines also a version number for this application.
| `npm-shrinkwrap.json` | Locks npm dependencies instead of using latest available for `package.json`. Created using `$npm shrinkwrap --dev`. Notice that updating app version number requires also updating `npm-shrinkwrap.json` app version reference!
| `bower.json` |  Bower module dependencies. See also `package.json`. Defines also a version number for this application.
