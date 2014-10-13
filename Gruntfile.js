var fs = require('fs');

module.exports = function(grunt) {
    var jsfiles = grunt.file.readJSON('deps.json').files;
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        'less': {
            dev: {
                options: {
                    compress: false
                },
                files: {
                    './assets/css/base.css': './assets/less/base.less',
                    './assets/css/styles.css': './assets/less/styles.less'
                }
            }
        },

        'watch': {
            less: {
                files: './assets/less/*.less',
                tasks: ['less:dev'],
                nospawn: true
            },
            deps: {
                files: './deps.json',
                tasks: ['deps'],
                nospawn: true
            }
        },

        'concurrent': {
            options: {
                logConcurrentOutput: true
            },
            watch: {
                tasks: ["watch:less", "watch:deps"]
            }
        },

        'connect': {
            server: {
                options: {
                    port: 8888,
                    livereload: true,
                    base: '.'
                }
            }
        }
    });

    grunt.registerTask('deps', function() {
        var output = './base.js',
            start = grunt.file.read('./src/deps.begin.js'),
            end = grunt.file.read('./src/deps.end.js'),
            contents = '"' + jsfiles.join('",\n"') + '"';

        grunt.file.write(
            output, [start, contents, end].join('\n'));
        grunt.log.writeln('Deps written in', output);
    });

    grunt.registerTask('dev', [
        'connect:server',
        'concurrent:watch'
    ]);

    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
};
