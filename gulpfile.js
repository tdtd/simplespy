var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var babili = require("gulp-babili");
var rename = require("gulp-rename");
function compile(end) {
  var bundler = watchify(browserify('./src/main.js', { debug: false  }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('simpleSpy.js'))
      .pipe(buffer())
      .pipe(gulp.dest('./dist'));
      return;
  }

  if (!end) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
  if (end){
    process.exit();
  }
}

function minify() {
  gulp.src("./dist/simpleSpy.js")
    .pipe(rename('simpleSpy.min.js'))
    .pipe(babili({
      mangle: {
        keepClassName: true
      }
    }))
    .pipe(gulp.dest("./dist"));
}

gulp.task('build', function() { return compile(true); });
gulp.task('minify', function() { return minify(); });
gulp.task('watch', function() { return compile(false); });

gulp.task('default', ['watch']);
