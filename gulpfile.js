// Import packages
var gulp = require('gulp');
var babel = require('gulp-babel');
var karma = require('karma').server;
var rimraf = require('rimraf');
var webpack = require('gulp-webpack');
var typescript = require('gulp-typescript');

// Import options
function getBuildOptions(file) {
  var options = require('./' + file);
  var home = process.env.USERPROFILE || process.env.HOME;
  try {
    var overrides = require(home + '/' + file);
    Object.keys(overrides).forEach(function (key) {
      options[key] = overrides[key];
    });
  } catch (e) {
    console.log('Could not require build options', e);
  }
  return options;
}

var buildOptions = getBuildOptions('build.json');

// Define paths
var paths = {
  src: {
    main: 'src/main',
    test: 'src/test'
  },
  dest: {
    base: 'target',
    main: 'target/main',
    test: 'target/test',
    pack: 'target/pack'
  },
  name: {
    main: 'main.bundle.js',
    test: 'test.bundle.js'
  }
};

// Library options
function babelOptions() {
  return {
    optional: ['runtime']
  };
}

function karmaOptions() {
  return {
    singleRun: true,
    files: [
      paths.dest.pack + '/' + paths.name.test
    ],
    frameworks: ['mocha'],
    reporters: buildOptions['karma.reporters'],
    browsers: buildOptions['karma.browsers']
  };
}

function typescriptOptions() {
  return {
    target: 'ES6',
    noImplicitAny: true,
    typescript: require('typescript')
  };
}

function webpackOptions(name) {
  return {
    output: {
      filename: name,
      libraryTarget: 'umd'
    }
  };
}

// Tasks
gulp.task('clean', function (done) {
  rimraf(paths.dest.base, done);
});

gulp.task('compile:main:ts', function () {
  var tsResults = gulp.src(paths.src.main + '/**/*.ts')
    .pipe(typescript(typescriptOptions()));
    
  return tsResults.js
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:main:es6', function () {
  return gulp.src(paths.src.main + '/**/*.es6')
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:main:js', function () {
  return gulp.src(paths.src.main + '/**/*.js')
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:test:ts', function () {
  var tsResults = gulp.src(paths.src.test + '/**/*.ts')
    .pipe(typescript(typescriptOptions()));
    
  return tsResults.js
    .pipe(babel(babelOptions))  
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('compile:test:es6', function () {
  return gulp.src(paths.src.test + '/**/*.es6')
    .pipe(babel(babelOptions))  
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('compile:test:js', function () {
  return gulp.src(paths.src.test + '/**/*.js')
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('package:main', ['compile'], function () {
  return gulp.src(paths.dest.main + '/**/*.js')
    .pipe(webpack(webpackOptions(paths.name.main)))
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('package:test', ['compile'], function () {
  return gulp.src(paths.dest.test + '/**/*.js')
    .pipe(webpack(webpackOptions(paths.name.test)))
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('test', ['package'], function (done) {
  karma.start(karmaOptions(), function () {
    done(); // this avoids a gulp error when karma fails, but reporters show the error
  });
});

gulp.task('compile:main', ['compile:main:ts', 'compile:main:es6', 'compile:main:js']);
gulp.task('compile:test', ['compile:test:ts', 'compile:test:es6', 'compile:test:js']);
gulp.task('compile', ['compile:main', 'compile:test']);
gulp.task('package', ['package:main', 'package:test']);
gulp.task('default', ['compile', 'package', 'test']);