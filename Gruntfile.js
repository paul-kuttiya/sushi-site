var path = require('path');
var src = path.join(__dirname, "public/javascripts"),
    dist = path.join(__dirname, "public/dist"),
    css = path.join(__dirname, "public/stylesheet");

module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      components: {
        src: 
        [
          `${src}/app.js`,
          `${src}/models/item.js`, `${src}/models/cartItem.js`,
          `${src}/collections/items.js`, `${src}/collections/cartItems.js`,
          `${src}/views/index.js`, `${src}/views/itemDetails.js`, `${src}/views/cartItems.js`, `${src}/views/checkout.js`
        ],
        dest: `${dist}/components.js`,
      },
    },
    bower_concat: {
      all: {
        dest: `${dist}/lib.js`,
        dependencies: {
          //underscore with jquery as dependencies
          "underscore": "jquery",
          "backbone": "underscore",
        }
      }
    },
    handlebars: {
      all: {
        files: {
          "public/javascripts/handlebars_templates.js": ["handlebars/**/*.hbs"]
        },
        options: {
          processContent: removeWhitespace,
          processName: extractFileName,          
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          "public/dist/lib.min.js": [`${dist}/lib.js`],
          "public/dist/components.min.js": [`${dist}/components.js`],
          "public/dist/router.min.js": [`${src}/router.js`],
          "public/dist/handlebars_templates.min.js": [`${src}/handlebars_templates.js`],
        }
      }
    },
    cssmin: {
      minify: {
        files: [{
          expand: true,
          cwd: 'public/stylesheets',
          src: ['**/*.css', '!**/*.min.css'],
          dest: `${dist}`,
          ext: '.min.css'
        }]
      },
      options: {
        shorthandCompacting: false,
        roundingPrecision: -1
      },
      combine: {
        files: {
          'dist/all.css': [`${css}/style.css`, `${css}/whitespace-reset-modified.css`]
        }
      }
    } 
  });

  [
    "grunt-bower-concat",
    'grunt-contrib-concat',
    "grunt-contrib-uglify",
    "grunt-contrib-handlebars",
    'grunt-contrib-cssmin'
  ].forEach(function(task) {
    grunt.loadNpmTasks(task);
  });

  grunt.registerTask("default", ['concat', "bower_concat", "uglify", "cssmin"])
};

function removeWhitespace(template) {
  return template.replace(/ {2,}/mg, "").replace(/\r|\n/mg, "");
};

function extractFileName(file) {
  return file.match(/\/(.+)\.hbs$/).pop();
};