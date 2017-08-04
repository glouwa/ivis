//https://stackoverflow.com/questions/25038014/how-do-i-copy-directories-recursively-with-gulp

// it flattens the dir structure
//gulp.src(['index.php', 'css/**', 'js/**', 'src/**'])
//    .pipe(gulp.dest('/var/www/'));


//The following works without flattening the folder structure:
//gulp.src(['input/folder/**/*'])
//    .pipe(gulp.dest('output/folder'));

/*
Turns out that to copy a complete directory structure gulp needs to be provided
 with a base for your gulp.src() method.

So gulp.src( [ files ], { "base" : "." }) can be used in the structure above to
 copy all the directories recursively.

If, like me, you may forget this then try:

  */
/*gulp.copy = (src, dest) =>
    gulp.src(src, {base:"."})
        .pipe(gulp.dest(dest))
*/
// https://stackoverflow.com/questions/28702247/browserify-typescript

//var paths = {
//    src: {
//        ts:     './ts/**/*.ts',
//        scss:   './src/scss/**/**.scss',
//    },
//    dst: {
//        jsDir:  './dist/client/',
//        dtsDir: './dist/client.d.ts',

//        jsMin:  './dist/client.min.js',
//        dts:    './dist/client.d.js',
//        scss:   './dist/client.css'
//    }
//}

var gulp       = require('gulp')
var ts         = require('gulp-typescript')
var merge      = require('merge2')
var browserify = require('browserify')
var source     = require('vinyl-source-stream')
var buffer     = require('vinyl-buffer')
var uglify     = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')
var gutil      = require('gulp-util')

//https://github.com/gulpjs/gulp/blob/master/docs/recipes/server-with-livereload-and-css-injection.md


var config = {
    tsc: {
        in:  './ts/**/*.ts',
        out: './dist/js/',
        d:   './dist/d/'
    },
    browserify:
    {
        in:  './dist/js/',
        out: './dist/client.js',
        map: './dist/client.map.js',
    }
}

// Build typescript
var tsProject = ts.createProject({
    target: "ES6",
    module: "commonjs", //
    declaration: true,
    sourceMap: true,
    types: [ "d3", "node", "jquery" ],
    typeRoots: ["node_modules/@types"],
})

gulp.task('tsc', function() {
    var tsResult = gulp.src(config.tsc.in)
        .pipe(tsProject())

    return merge([
        tsResult.dts.pipe(gulp.dest(config.tsc.d)),
        tsResult.js.pipe(gulp.dest(config.tsc.out))
    ])
})

// Browserify, uglify and sourcemaps
gulp.task('minify', ['tsc'], function () {
  return browserify({
        entries: './dist/js/controller-init.js',
        debug: true
    })
    .bundle()
    .pipe(source('client.js'))
    //.pipe(buffer())
    //.pipe(uglify())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    //.pipe(sourcemaps.write(config.browserify.map))
    .pipe(gulp.dest('./dist/'));
})

gulp.task('data', [], function() {
})

gulp.task('build', ['tsc', 'minify', 'scss', 'ast'], function() {
})

gulp.task('run', ['server', 'client'], function() {
})

gulp.task('dev', ['server', 'client', 'sync'], function() {
})


//gulp.task('watch', ['scripts'], function() {
//    gulp.watch('js/**/*.js', ['scripts']);
//        .on('change', e =>
//            console.log('File ' + event.path + ' was ' + event.type + ', running tasks...'))
//})

