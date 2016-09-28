module.exports = function(grunt) {
  grunt.initConfig({
    'uglify': {
      ellipsis: {
        files: {
          'ellipsis.min.js': ['ellipsis.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['uglify']);
};
