'use strict';

//   ____ _   _ _     ____  
//  / ___| | | | |   |  _ \ 
// | |  _| | | | |   | |_) |
// | |_| | |_| | |___|  __/ 
//  \____|\___/|_____|_|    
//                        

 //  _   _  ___  ____  _____   ____   _    ____ _  __    _    ____ _____ ____  
 // | \ | |/ _ \|  _ \| ____| |  _ \ / \  / ___| |/ /   / \  / ___| ____/ ___| 
 // |  \| | | | | | | |  _|   | |_) / _ \| |   | ' /   / _ \| |  _|  _| \___ \ 
 // | |\  | |_| | |_| | |___  |  __/ ___ \ |___| . \  / ___ \ |_| | |___ ___) |
 // |_| \_|\___/|____/|_____| |_| /_/   \_\____|_|\_\/_/   \_\____|_____|____/ 
 //                                                                         

//***REQUIRE NODE PACKAGES***//

//***FOR GULP***//
var gulp = require('gulp');

//***FOR FILE/DIRECTORIES***//
//Logs the size of the file
var size = require('gulp-size');
//Filters files with globs so filtered files can be assigned to a variable
var filter = require('gulp-filter');
//Remove or replace relative path for files
var flatten = require('gulp-flatten');
//Concatenates files 
var concat = require('gulp-concat');
//Deletes folders and/or files using globs
var del = require('del');
//Adds a hash to a filename to prevent cacheing of changed resource
var rev = require('gulp-rev');
//Renames a file
var rename = require('gulp-rename');

//***FOR STREAMS***
//Toolkit for working with streams
var es = require('event-stream');

//***FOR SASS***//
//Compiles .scss files using lib-sass for Node (no Ruby dependency)
var sass = require('gulp-sass');

//***FOR JAVASCRIPT***//
//Checks JavaScript syntax
var jshint = require('gulp-jshint');
//Minifies JavaScript
var uglify = require('gulp-uglify');

//***FOR HTML***//
//Minifies html
var minifyHTML = require('gulp-minify-html');
//Inject CSS and JS depenencies into HTML as script and link tags
var inject = require("gulp-inject");

//***FOR ANGULARJS***// 
//Converts AngularJS views into AngularJS template cache JS files
var ngHTML2js = require("gulp-ng-html2js");
//Adds or removes AngularJS dependency injection
var ngAnnotate = require('gulp-ng-annotate');

//***FOR DEV SERVER***// 
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

//  _____  _    ____  _  ______  
// |_   _|/ \  / ___|| |/ / ___| 
//   | | / _ \ \___ \| ' /\___ \ 
//   | |/ ___ \ ___) | . \ ___) |
//   |_/_/   \_\____/|_|\_\____/ 
//

//Generic error handler for tasks
function handleError(err) {
  	console.error(err.toString());
  	this.emit('end');
}

//***** DEFAULT TASKS ******//

gulp.task('default', function () {
    //DO NOTHING BY DEFAULT
});

//***** DEV SERVER TASKS ******//

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        },
        ghostMode : false
    });
});

gulp.task('serve', ['watch', 'browser-sync']);

gulp.task('reload', function() {
    gulp.src('./')
      .pipe(reload({stream:true}));
});

//***** WATCH TASKS ******//

gulp.task('watch',function () {
  gulp.watch('css/*.css', ['reload']);
  gulp.watch('js/*.js', ['reload']);
  gulp.watch('index.html', ['reload']);
});

