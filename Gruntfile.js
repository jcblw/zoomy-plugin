/*global module:false*/
module.exports = function(grunt) {
  var files = ["src/main.js", "src/change.js", "src/events.js", "src/build.js", "src/style.js"];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner : '/*' + 
      '\n * <%= pkg.name %>.js - <%= pkg.version %> \n' + 
      ' * Description : <%= pkg.description %> \n' +
      ' * Project Url : <%= pkg.repository.url %> \n' +
      ' * Author : <%= pkg.author %> \n' +
      ' * License : <%= pkg.license %> \n' +
      ' */\n\n',
    concat: {
      options: {
        banner: "<%=banner%>",
        separator: '\n\n',
        stripBanners : true
      },
      dist: {
        src: files,
        dest: 'build/<%= pkg.name.toLowerCase() %>.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      options: {
        expr: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true,
          Zoomy : true,
          console : true
        }
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },
    uglify: {
      options: {
        banner: "<%=banner%>",
        separator: '\n\n',
        stripBanners : true
      },
      dist: {
        src: files,
        dest: 'build/<%= pkg.name.toLowerCase() %>.min.js'
      }
    }
  });

  // load task
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

};
