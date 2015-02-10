module.exports = function(grunt) {
  var parser_export="sprintf.parser";
  var parser_start_rules="ConversionTemplate,AConversionTemplate";
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      pegjs: {
          src: ["src/functions.pegjs", "src/sprintf-parser.pegjs", "src/javascript.pegjs"],
          dest: "src/parser.pegjs"
        },
      dist: {
          src: ["src/header.js", "src/sprintf.js", "src/parser.js", "src/footer.js"], 
          dest: "dist/sprintf.js"
        }
    
    },
    shell: {
      pegjs_compile:
        {
          command:
	          "pegjs --export-var " + parser_export + " --allowed-start-rules " + parser_start_rules + " src/parser.pegjs src/parser.js"
        }
    },
    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> | <%= pkg.author %> | <%= pkg.license %> */\n",
        sourceMap: true
      },
      build: {
        files: [
          {
            src: "dist/sprintf.js",
            dest: "dist/sprintf.min.js"
          },
          {
            src: "src/angular-sprintf.js",
            dest: "dist/angular-sprintf.min.js"
          }
        ]
      }
    },
   watch: {
     js: {
       files: "src/*.js",
       tasks: ["concat:pegjs", "shell:pegjs_compile", "concat:dist", "uglify"]
     },
     pegjs: {
       files: "src/*.pegjs",
       tasks: ["concat:pegjs", "shell:pegjs_compile", "concat:dist", "uglify"]
     }
   },
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-shell");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.registerTask("default", ["concat:pegjs", "shell:pegjs_compile", "concat:dist", "uglify", "watch"]);
}
