'use strict';
module.exports = function (grunt) {
    // Project configuration.
    var root = 'src/main/resources/web';
    var srcLib = root + '/js/libs';
    var srcApp = root + '/js/ngapps';
    var tmp = '.tmp/templates';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                report: 'min',
                mangle: false
            },
            app: {
                src: '.tmp/concat/apps/**/*.js',
                dest: root + '/app/qaobee.min.js'
            },
            templates: {
                src: tmp + '/templates.js',
                dest: root + '/app/templates.min.js'
            }
        },
        html2js: {
            options: {
                base: root
            },
            main: {
                src: [root + '/templates/**/*.html'],
                dest: tmp + '/templates.js'
            }
        },
        bower: {
            install: {
                options: {
                    targetDir: '.tmp/jslibs',
                    cleanTargetDir: true
                }
            }
        },
        jshint: {
            options: {
                node: true,
                smarttabs: true
            },
            all: ['Gruntfile.js', srcApp + '/**/*.js']
        },
        copy: {
            dist: {
                files: [{
                    src: root + '/index-template.html',
                    dest: root + '/index.html'
                }, {
                    expand: true,
                    src: srcLib + '/**/*.ttf',
                    dest: root + '/fonts/',
                    flatten: true
                }, {
                    expand: true,
                    src: srcLib + '/**/*.woff',
                    dest: root + '/fonts/',
                    flatten: true
                }, {
                    expand: true,
                    src: srcLib + '/**/*.eot',
                    dest: root + '/fonts/',
                    flatten: true
                }, {
                    expand: true,
                    src: srcLib + '/**/images/*.*',
                    dest: root + '/images/',
                    flatten: true
                }]
            },
            dev: {
                files: [{
                    src: root + '/index.tmp',
                    dest: root + '/index.html'
                }]
            },
            prepare: {
                files: [{
                    src: root + '/index-template.html',
                    dest: root + '/index.tmp'
                }, {
                    src: root + '/index-template.html',
                    dest: root + '/index.html'
                }]
            }
        },
        wiredep: {
            target: {
                src: [root + '/index.tmp'],
                cwd: '',
                dependencies: true,
                devDependencies: false,
                exclude: ['angular-i18n'],
                fileTypes: {},
                ignorePath: '',
                overrides: {
                    "tinymce": {
                        "main": "tinymce.min.js"
                    },
                    "angular-file-uploader": {
                        "main": "angular-file-uploader.js"
                    },
                    'font-awesome': {
                        "main": "css/font-awesome.min.css"
                    },
                    'jqueryui-touch-punch': {
                        'main': "jquery.ui.touch-punch.min.js"
                    },
                    'leaflet.markerclusterer': {
                        'main': ['dist/leaflet.markercluster.js', 'dist/MarkerCluster.css', 'dist/MarkerCluster.Default.css']
                    },
                    'angular-wizard': {
                        'main': ['dist/angular-wizard.min.js', 'dist/angular-wizard.css']
                    },
                    'nouislider': {
                        'main': ['jquery.nouislider.min.js']
                    },
                    'jquery-maskedinput': {
                        'main': ['dist/jquery.maskedinput.min.js']
                    }
                }
            }
        },
        useminPrepare: {
            options: {
                dest: root + '/app/'
            },
            html: root + '/index.tmp'
        },
        usemin: {
            html: root + '/index.html',
            options: {
                blockReplacements: {
                    js: function (block) {
                        return '<script src="app/' + block.dest + '"></script>\n';
                    },
                    css: function (block) {
                        return '<link rel="stylesheet" href="app/' + block.dest + '" />\n';
                    }
                }
            }
        },
        cssmin: {
            generated: {
                banner: '/* My minified css file */',
                keepSpecialComments: 0,
                root: root,
                target: {
                    files: {
                        'src/main/resources/web/app/css.min.css': ['src/main/resources/web/app/css.min.css']
                    }
                }
            }

        },
        rev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 8
            },
            assets: {
                files: [{
                    src: [root + '/app/*.min.*']
                }]
            }
        },
        htmlmin: {
            prod: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'src/main/resources/web/index.html': root + '/index.html'
                }
            },
            dev: {
                options: {
                    removeComments: true,
                    collapseWhitespace: false
                },
                files: {
                    'src/main/resources/web/index.html': root + '/index.html'
                }
            }
        },
        clean: [root + '/app/**/*', '.tmp', root + '/index.tmp', root + '/fonts/*'],
        ngAnnotate: {
            dist: {
                files: [{
                    expand: false,
                    src: srcApp + '/**/*.js',
                    dest: '.tmp/concat/apps/qaobee.js'
                }]
            }
        },
        scriptlinker: {
            dev: {
                options: {
                    startTag: '<!--SCRIPTS-->',
                    endTag: '<!--SCRIPTS END-->',
                    fileTmpl: '<script src="%s"></script>\n',
                    appRoot: root + '/',
                    relative: true
                },
                files: {
                    'src/main/resources/web/index.tmp': [srcApp + '/**/*.js', srcLib + '/angular-chartjs-directive/lib/Chart.min.js']

                }
            },
            devcss: {
                options: {
                    startTag: '<!--CSS -->',
                    endTag: '<!--CSS END -->',
                    fileTmpl: '<link rel="stylesheet" href="%s" />\n',
                    appRoot: root + '/',
                    relative: true
                },
                files: {
                    'src/main/resources/web/index.tmp': [root + '/css/**/*.css']

                }
            },
            prod: {
                options: {
                    startTag: '<!--SCRIPTS-->',
                    endTag: '<!--SCRIPTS END-->',
                    fileTmpl: '<script src="%s"></script>\n',
                    appRoot: root + '/',
                    relative: true
                },
                files: {
                    'src/main/resources/web/index.html': [root + '/app/*.js', srcLib + '/angular-chartjs-directive/lib/Chart.min.js']

                }
            },
            prodcss: {
                options: {
                    startTag: '<!--CSS -->',
                    endTag: '<!--CSS END -->',
                    fileTmpl: '<link rel="stylesheet" href="%s" />\n',
                    appRoot: root + '/',
                    relative: true
                },
                files: {
                    'src/main/resources/web/index.html': [root + '/app/*.css']
                }
            }
        },
        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                name: 'config'
            },
            // Environment targets
            development: {
                options: {
                    dest: srcApp + '/config.js'
                },
                constants: {
                    ENV: {
                        name: 'development',
                        apiEndPoint: 'http://localhost:8080',
                        useLoaderCache: false,
                        debugEnabled: true
                    }
                }
            },
            production: {
                options: {
                    dest: srcApp + '/config.js'
                },
                constants: {
                    ENV: {
                        name: 'production',
                        apiEndPoint: '',
                        useLoaderCache: true,
                        debugEnabled: false
                    }
                }
            }
        }, changelog: {
            options: {
                // Task-specific options go here.
            }
        }, bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false
            }
        },
        apidoc2swagger : {
            testAPI : {
                options : {
                    apiProject : 'target/site/restAPI/api_project.json',
                    apiData : 'target/site/restAPI/api_data.json',
                    swagger : 'target/site/swagger',
                    basePath: 'http://localhost:8080'
                }
            }
        }
    });

    // Load the plugins
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Default task(s).
    grunt.registerTask('prod', ['clean', 'ngconstant:production', 'copy:prepare', 'jshint', 'bower:install', 'scriptlinker',
        'wiredep', 'html2js', 'scriptlinker:dev', 'copy:dist', 'copy:dev', 'useminPrepare', 'concat:generated', 'cssmin:generated',
        'ngAnnotate', 'uglify:app', 'uglify:templates', 'rev', 'usemin:html', 'scriptlinker:prod',
        'scriptlinker:prodcss', 'htmlmin:prod']);
//*, 'changelog', 'bump'
    /* grunt.registerTask('prod', ['clean', 'ngconstant:production', 'copy:prepare', 'jshint', 'bower:install', 'scriptlinker', 'wiredep', 'html2js', 'copy:dist', 'useminPrepare', 'concat:generated', 'cssmin:generated',
     'ngAnnotate','uglify:generated', 'uglify:app', 'uglify:templates', 'rev', 'usemin:html', 'scriptlinker:prod', 'scriptlinker:prodcss', 'htmlmin:prod']);*/ //, 'apidoc', 'jsdoc', 'plato'
    grunt.registerTask('ci', ['jshint', 'bower:install', 'wiredep', 'scriptlinker:dev', 'copy']);
    grunt.registerTask('default', ['clean', 'ngconstant:development', 'copy:prepare', 'jshint',
        'bower:install', 'wiredep', 'scriptlinker:dev', 'scriptlinker:devcss', 'copy:dist', 'copy:dev', 'htmlmin:dev']);
};
