
module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    concat: {
      dist: {
        src: ['src/main.js', 'src/change.js', 'src/style.js', 'src/events.js', 'src/build.js'],
        dest: 'build/zoomy_build.js',
        separator: '\n\n'
      }
    },
    min: {
      dist: {
        src: ['build/zoomy_build.js'],
        dest: 'build/zoomy_build.min.js'
      }
    },
    lint: {
      files: ['src/*.js']
    },
    server : {
      port : 3000,
      base : '.'
    }
  });

  grunt.registerTask('server', 'Start a custom web server.', function() {
    var done = this.async();
    grunt.log.writeln('Starting web server on port 3000.');
    require('./server.js').listen(3000).on('close', done);
  });
};