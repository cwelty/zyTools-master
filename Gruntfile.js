'use strict';

/**
    Make the options object for a wrap build.
    @method makeWrapOptions
    @param {String} name The name of the module to build.
    @return {Object} The options object.
*/
function makeWrapOptions(name) {
    return {
        wrapper: [
            `define("${name}", ["exports"], function(exports) {\nvar module = {};`,
            '\nexports.default = module.exports;\n});'
        ]
    };
}

/**
    Make the configuration to wrap a zyWeb module.
    @method makeZyWebWrap
    @param {String} name The name of the zyWeb module.
    @return {Object} The configuration to wrap the zyWeb module.
*/
function makeZyWebWrap(name) {
    return {
        cwd: 'zyWeb',
        expand: true,
        src: `${name}.js`,
        dest: 'public/vendor/',
        options: makeWrapOptions(name),
    };
}

module.exports = function(grunt) {
    grunt.initConfig({
        babel: {
            dist: {
                files: [
                    {
                        expand:  true,
                        flatten: true,
                        src:     ['tools/.tmp/<%= grunt.option("tool") %>/js/**/*.js'],
                        dest:    'tools/.tmp/<%= grunt.option("tool") %>/js/'
                    }
                ]
            }
        },

        clean: {
            all: ['tools/.tmp',
                  'public/<%= grunt.option("tool") %>/*',
                  'tools/<%= grunt.option("tool") %>/js/<%= grunt.option("tool") %>_tests.js'
            ],

            tests: ['tools/<%= grunt.option("tool") %>/tests/<%= grunt.option("tool") %>_tests.js'],
        },

        wrap: {
            ResourceManager: makeZyWebWrap('zyWebResourceManager'),
            EventManager: makeZyWebWrap('zyWebEventManager'),
            ErrorManager: makeZyWebWrap('zyWebErrorManager'),
            ParentResource: makeZyWebWrap('zyWebParentResource'),
            ZyWebUtilities: makeZyWebWrap('zyWebUtilities'),
            tool: {
                cwd: 'tools/.tmp/<%= grunt.option("tool") %>/js',
                expand: true,
                src: '**/*.js',
                dest: 'tools/.tmp/<%= grunt.option("tool") %>/js/',
                options: makeWrapOptions('<%= grunt.option("tool") %>'),
            }
        },

        coffee: {
            compile: {
                expand:  true,
                flatten: true,
                cwd:     'tools/<%= grunt.option("tool") %>/js/',
                src:     '*.coffee',
                dest:    'tools/<%= grunt.option("tool") %>/js/',
                ext:     '.js'
            }
        },

        concat: {
            js: {
                src:  ['tools/.tmp/<%= grunt.option("tool") %>/js/*.js'],
                dest: 'public/<%= grunt.option("tool") %>/js/<%= grunt.option("tool") %>.js'
            },

            styles: {
                src: [
                    'vendor/css/normalize.css',
                    'tools/.tmp/css/*.css'
                ],
                dest: 'public/css/application.css'
            },

            tests: {
                src: [
                    'tools/<%= grunt.option("tool") %>/tests/**/*.js'
                ],
                dest: 'tools/<%= grunt.option("tool") %>/tests/<%= grunt.option("tool") %>_tests.js'
            },

            blank_tests: {
                src:  [],
                dest: 'tools/<%= grunt.option("tool") %>/tests/<%= grunt.option("tool") %>_tests.js'
            }
        },

        copy: {
            fallback: {
                files: [
                    {
                        src: 'zyWeb/fallbackResources/application.css',
                        dest: 'public/css/application.css'
                    },
                    {
                        src: 'zyWeb/fallbackResources/favicon.ico',
                        dest: 'public/assets/favicon.ico'
                    },
                    {
                        src: 'zyWeb/fallbackResources/logo.svg',
                        dest: 'public/assets/logo.svg'
                    }
                ]
            },
            styles: {
                files: [
                    {
                        src: '../zybooks-platform/zybooks-web/dist/assets/zybooks-web-*.css',
                        dest: 'public/css/application.css'
                    },
                    {
                        src: '../zybooks-platform/zycommon-web/public/assets/favicon.ico',
                        dest: 'public/assets/favicon.ico'
                    },
                    {
                        src: '../zybooks-platform/zycommon-web/public/assets/logo.svg',
                        dest: 'public/assets/logo.svg'
                    }
                ]
            },
            vendor: {
                files: [
                    {
                        expand: true,
                        src:    ['vendor/**'],
                        dest:   'public/'
                    },
                    {
                        expand: true,
                        src:    ['zyWebResourceManager.js'],
                        dest:   'public/'
                    },
                    {
                        expand: true,
                        src:    ['zyWebEventManager.js'],
                        dest:   'public/'
                    },
                    {
                        expand: true,
                        src:    ['zyWebErrorManager.js'],
                        dest:   'public/'
                    },
                    {
                        expand: true,
                        src:    ['zyWebParentResource.js'],
                        dest:   'public/'
                    },
                    {
                        expand:  true,
                        flatten: true,
                        src:     ['tools/<%= grunt.option("tool") %>/resource/*'],
                        dest:    'public/<%= grunt.option("tool") %>/resource'
                    }
                ]
            }
        },

        cssmin: {
            compress: {
                src:  'tools/.tmp/<%= grunt.option("tool") %>/css/style.css',
                dest: 'tools/.tmp/<%= grunt.option("tool") %>/css/style.css'
            }
        },

        eslint: {
            options: {
                config: 'tools/.eslintrc',
                reset: true
            },
            target: ['tools/<%= grunt.option("tool") %>/js/**/*.js', 'tools/<%= grunt.option("tool") %>/tests/**/*.js']
        },

        handlebars: {
            compile: {
                options: {
                    namespace: '<%= grunt.option("tool") %>',

                    // Don't use file path as index. Use name of hbs file as defined by user (minus the hbs extension).
                    processName: function(filePath) {
                        var pieces     = filePath.split('/');
                        var fileName   = pieces[pieces.length - 1];
                        var filePieces = fileName.split('.');

                        // Filename without extension
                        return filePieces[0];
                    }
                },
                files: {
                    'tools/.tmp/<%= grunt.option("tool") %>/hbs/templates.js': ['tools/<%= grunt.option("tool") %>/templates/*.hbs']
                }
            }
        },

        less: {
            default: {
                files: {
                    'tools/.tmp/<%= grunt.option("tool") %>/css/style.css' : 'tools/<%= grunt.option("tool") %>/less/*'
                }
            }
        },

        template: {
            html: {
                options: {
                    data: {
                        toolName: '<%= grunt.option("tool") %>',
                        optionsDict: '<%= grunt.option("optionsDict") %>'
                    }
                },
                files: {
                    'public/<%= grunt.option("tool") %>/index.html': ['support_files/index.html.template']
                }
            },
            css_hbs_dependencies_tests_insertion: {
                options: {
                    data: {
                        css_filename: 'tools/.tmp/<%= grunt.option("tool") %>/css/style.css',
                        hbs_output:   'tools/.tmp/<%= grunt.option("tool") %>/hbs/templates.js',
                        dependencies: 'tools/<%= grunt.option("tool") %>/dependencies.js',
                        tests:        'tools/<%= grunt.option("tool") %>/tests/<%= grunt.option("tool") %>_tests.js'
                    }
                },
                files: {
                    'tools/.tmp/<%= grunt.option("tool") %>/js/<%= grunt.option("tool") %>.js': ['tools/<%= grunt.option("tool") %>/js/**/*.js']
                }
            }
        },

        uglify: {
            precompile: {
                src:  'public/<%= grunt.option("tool") %>/js/<%= grunt.option("tool") %>.js',
                dest: 'public/<%= grunt.option("tool") %>/js/<%= grunt.option("tool") %>.js'
            }
        },
    });

    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-wrap');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var toolName = grunt.option('tool');
    if (!toolName) {
        grunt.fail.fatal('Please specify a tool name with --tool=toolName');
    }

    var optionsPath = grunt.option('options');
    if (!optionsPath) {
        grunt.option('optionsDict', 'null');
    }
    else {
        grunt.option('optionsDict', grunt.file.read(optionsPath));
    }

    grunt.registerTask('remove_js_if_is_cs', 'Remove CoffeeScript output js', function() {
        var tool = grunt.option('tool');
        var path = 'tools/' + tool + '/js/' + tool;
        grunt.log.write('Checking ' + path + '/ for coffeeScript output to delete.\n');
        if (grunt.file.exists(path + '.coffee')) {
            grunt.file.delete(path + '.js');
        }
    });

    var gruntTasksStep1 = [
        'clean',
        'coffee',
        'less',
        'cssmin',
        'handlebars'
    ]

    var gruntTasksStep2 = [
        'template:css_hbs_dependencies_tests_insertion',
        'babel',
        'wrap',
        'concat:js',
        'concat:styles'
    ]

    var gruntTasksStep3 = [
        'template:html',
        'remove_js_if_is_cs',
        'copy:vendor',
        'copy:fallback',
        'copy:styles',
        'clean:tests'
    ]

    if (grunt.file.exists('../zybooks-platform')) {
        if (!grunt.file.exists('../zybooks-platform/zybooks-web/dist/assets')) {
            grunt.log.error(`Expected files in zybooks-web/dist/assets. Run 'ember build' on zybooks-web to solve this. Using fallback files meanwhile.`);
        }
        if (!grunt.file.exists('../zybooks-platform/zycommon-web/public/assets')) {
            grunt.log.error(`Expected files in zycommon-web/public/assets. Using fallback files meanwhile.`);
        }
    }
    else {
        grunt.log.error(`Expected to find zybooks-platform folder in the same root folder as zyTools folder but didn't. Using fallback files meanwhile.`);
    }

    // Print a link to the tool
    grunt.registerTask('Tool link', () => grunt.log.writeln(`file://${process.cwd()}/public/${grunt.option('tool')}/index.html`));

    // Force grunt to continue even with warnings. Used to print tool link even when eslint has warnings.
    grunt.registerTask('Force flag on', () => grunt.option('force', true));

    grunt.registerTask('default', [].concat(gruntTasksStep1, ['concat:tests'], gruntTasksStep2, gruntTasksStep3, [ 'Force flag on', 'eslint', 'Tool link' ]));

    grunt.registerTask('deploy_dev', [].concat(gruntTasksStep1, ['concat:blank_tests'], gruntTasksStep2, gruntTasksStep3, [ 'Tool link' ]));

    grunt.registerTask('production', [].concat(gruntTasksStep1, ['concat:blank_tests'], gruntTasksStep2, ['uglify'], gruntTasksStep3, [ 'Tool link' ]));
};
