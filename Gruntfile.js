'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates',
        cdnify: 'grunt-google-cdn',
        ngconstant: 'grunt-ng-constant'
    });

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'dist',
        customPath: 'custom/', // Path to custom configs project
        customtoolsPath: 'custom/tools/', // Path to custom configs tools
        postbuild: 'postbuild.sh' // Filename of custom cofigs postbuild script
    };

    var serveStatic = require('serve-static');

    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-compress');
    //grunt.loadNpmTasks('grunt-angular-architecture-graph'); Commented out to remove the dev dependency, not needed unless you want to generate diagrams again

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        pkg: grunt.file.readJSON('bower.json'),

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            compass: {
                files: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer:server']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.app %>/loc/{,*/}*.json'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            serveStatic('.tmp'),
                            connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
                            ),
                            connect().use(
                                '/app/styles',
                                serveStatic('./app/styles')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    middleware: function (connect) {
                        return [
                            serveStatic('.tmp'),
                            serveStatic('test'),
                            connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/{,*/}*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/{,*/}*',
                        '!<%= yeoman.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            server: {
                options: {
                    map: true,
                },
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= yeoman.app %>/index.html'],
                ignorePath:  /\.\.\//
            },
            test: {
                devDependencies: true,
                src: '<%= karma.unit.configFile %>',
                ignorePath:  /\.\.\//,
                fileTypes:{
                    js: {
                        block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            },
            sass: {
                src: ['<%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                ignorePath: /(\.\.\/){1,2}bower_components\//
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/styles',
                cssDir: '.tmp/styles',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: './bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n'
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= yeoman.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    sourcemap: true
                }
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/scripts/{,*/}*.js',
                    '<%= yeoman.dist %>/styles/{,*/}*.css',
                    //'<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}', Renamed files not found under dist so disable renaming for now
                    '<%= yeoman.dist %>/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: [
                '<%= yeoman.dist %>/{,*/}*.html'
            ],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
            js: [
                '<%= yeoman.dist %>/scripts/{,*/}*.js'
            ],
            options: {
                assetsDirs: [
                    '<%= yeoman.dist %>',
                    '<%= yeoman.dist %>/images',
                    '<%= yeoman.dist %>/styles'
                ],
                patterns: {
                    js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
                }
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/styles/main.css': [
        //         '.tmp/styles/{,*/}*.css'
        //       ]
        //     }
        //   }
        // },
        // uglify: {
        //   dist: {
        //     files: {
        //       '<%= yeoman.dist %>/scripts/scripts.js': [
        //         '<%= yeoman.dist %>/scripts/scripts.js'
        //       ]
        //     }
        //   }
        // },
        // concat: {
        //   dist: {}
        // },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        ngtemplates: {
            dist: {
                options: {
                    module: 'dashboard',
                    htmlmin: '<%= htmlmin.dist.options %>',
                    usemin: 'scripts/scripts.js'
                },
                cwd: '<%= yeoman.app %>',
                src: 'views/{,*/}*.html',
                dest: '.tmp/templateCache.js'
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'images/{,*/}*.{webp}',
                        'styles/fonts/{,*/}*.*'
                    ]
                },{
                    expand: true,
                    cwd: '<%= yeoman.app %>/loc',
                    src: '**/*.json',
                    dest: '<%= yeoman.dist %>/loc'
                },{
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= yeoman.dist %>/images',
                    src: ['generated/*']
                },{
                    expand: true,
                    cwd: '.',
                    src: 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap/*',
                    dest: '<%= yeoman.dist %>'
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            },
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'compass:server'
            ],
            test: [
                'compass'
            ],
            dist: [
                'compass:dist',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        },

        ngconstant: {
            options: {
                name: '<%= pkg.name %>',
                deps: false,
                dest: '<%= yeoman.app %>/scripts/app.env.js',
                wrap: '"use strict";\n/**\n * (c) Tieto Finland Oy\n * Licensed under the MIT license.\n */\n// *** DO NOT EDIT THIS FILE MANUALLY ***\n// Instead edit Gruntfile.json task which generates this file.\n{%= __ngModule %}\n// *** DO NOT EDIT THIS FILE MANUALLY ***',
                constants: {
                    ENV: grunt.file.readJSON('conf/app.env.default.json'),
                    G_APP: {
                        app_version: '<%= pkg.version %>',
                    }
                }
                //values: here global 'values' written to the ENV module. Currently none.
            },
            tcs: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.tcs.json'),
                }
            },
            dev: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.dev.json'),
                }
            },
            test1: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.test1.json'),
                }
            },
            test2: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.test2.json'),
                }
            },
            test3: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.test3.json'),
                }
            },
            test4: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.test4.json'),
                }
            },
            test5: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.test5.json'),
                }
            },
            prod: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.prod.json'),
                }
            },
            prod2: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.prod2.json'),
                }
            },
            harj2: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.harj2.json'),
                }
            },
            it2: {
                constants: {
                    ENV: grunt.file.readJSON('custom/conf/app.env.it2.json'),
                }
            },
        },

        postcss: {
            options: {
                map: true,
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 2 versions']
                    })
                ]
            },
            dist: {
                src: '.tmp/styles/*.css'
            }
        },

        exec: {
          postbuild_custom: {
            cmd: function() {
              var res = '';
              if (grunt.file.exists(appConfig.customtoolsPath+appConfig.postbuild)) {
                // Shell script and arguments to execute
                res = appConfig.customtoolsPath+appConfig.postbuild +' ' +appConfig.dist +' ' +appConfig.customPath;
                grunt.log.writeln(' * Executing: ' +res);
              } else {
                grunt.log.subhead(' * No postbuild script to execute');
              }
              return res;
            },
            callback: function (error /*, stdout, stderr*/) {
                if (error !== null) {
                    grunt.log.error('exec error: ' + error);
                }
            }
          }
        },
        compress: {
          project: {
            options: {
              archive:  appConfig.dist+'.zip'
            },
            files: [
              {cwd: appConfig.dist, src: ['**/*'], expand: true, dest: '', dot: 'true'}
            ]
          }
        },
        angular_architecture_graph: {
            diagram: {
                files: {
                    //NOTICE: install grunt-angular-architecture-graph to use this
                    // "PATH/TO/OUTPUT/FILES": ["PATH/TO/YOUR/FILES/*.js"]
                    "architecture": [
                        "<%= yeoman.app %>/scripts/{,*/}*.js"
                    ]
                }
            }
        }

    });

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'wiredep',
            'concurrent:server',
            'autoprefixer:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'wiredep',
        'concurrent:test',
        'autoprefixer',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'ngtemplates',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'postcss:dist',
        'cdnify',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('preparedeploy', [
        'exec:postbuild_custom',
        'compress'
    ]);

    grunt.registerTask('build:tcs', [
        'ngconstant:tcs',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:dev', [
        'ngconstant:dev',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:test1', [
        'ngconstant:test1',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:test2', [
        'ngconstant:test2',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:test3', [
        'ngconstant:test3',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:test4', [
        'ngconstant:test4',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:test5', [
        'ngconstant:test5',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:prod', [
        'ngconstant:prod',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:prod2', [
        'ngconstant:prod2',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('default', [
        'ngconstant:dev',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:harj2', [
        'ngconstant:harj2',
        'newer:jshint',
        'test',
        'build'
    ]);

    grunt.registerTask('build:it2', [
        'ngconstant:it2',
        'newer:jshint',
        'test',
        'build'
    ]);
};
