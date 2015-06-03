// Import packages
var gulp = require('gulp');
var babel = require('gulp-babel');
var karma = require('karma').server;
var eslint = require('gulp-eslint');
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
  },
  glob: {
    ts: '/**/*.ts',
    es6: '/**/*.es6',
    js: '/**/*.js',
    res: ['/**/*.hbs', '/**/*.html', '/**/*.less', '/**/*.css']
  }
};

// Library options
function babelOptions() {
  return {
    optional: ['runtime']
  };
}

function eslintOptions() {
  return {
    configFile: 'eslint.json'
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
    module: {
      loaders: [
        {test: /\.hbs$/, loader: 'handlebars-loader'}
      ]
    },
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

gulp.task('copy:manifest', function () {
  return gulp.src('package.json')
    .pipe(gulp.dest(paths.dest.base));
});

gulp.task('copy:resource', function () {
  return gulp.src(paths.src.main + paths.glob.res)
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('lint:main:es6', function () {
  return gulp.src(paths.src.main + paths.glob.es6)
    .pipe(eslint(eslintOptions()))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('compile:main:ts', ['lint'], function () {
  var tsResults = gulp.src(paths.src.main + paths.glob.ts)
    .pipe(typescript(typescriptOptions()));
    
  return tsResults.js
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:main:es6', ['lint'], function () {
  return gulp.src(paths.src.main + paths.glob.es6)
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:main:js', ['lint'], function () {
  return gulp.src(paths.src.main + paths.glob.js)
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:test:ts', ['lint'], function () {
  var tsResults = gulp.src(paths.src.test + paths.glob.ts)
    .pipe(typescript(typescriptOptions()));
    
  return tsResults.js
    .pipe(babel(babelOptions))  
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('compile:test:es6', ['lint'], function () {
  return gulp.src(paths.src.test + paths.glob.es6)
    .pipe(babel(babelOptions))  
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('compile:test:js', ['lint'], function () {
  return gulp.src(paths.src.test + paths.glob.js)
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('package:main', ['compile'], function () {
  return gulp.src(paths.dest.main + paths.glob.js)
    .pipe(webpack(webpackOptions(paths.name.main)))
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('package:test', ['compile'], function () {
  return gulp.src(paths.dest.test + paths.glob.js)
    .pipe(webpack(webpackOptions(paths.name.test)))
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('test', ['package'], function (done) {
  karma.start(karmaOptions(), function () {
    done(); // this avoids a gulp error when karma fails, but reporters show the error
  });
});

gulp.task('copy', ['copy:manifest', 'copy:resource']);
gulp.task('lint:main', ['lint:main:es6']);
gulp.task('lint', ['lint:main']);
gulp.task('compile:main', ['compile:main:ts', 'compile:main:es6', 'compile:main:js']);
gulp.task('compile:test', ['compile:test:ts', 'compile:test:es6', 'compile:test:js']);
gulp.task('compile', ['compile:main', 'compile:test']);
gulp.task('package', ['package:main', 'package:test']);
gulp.task('default', ['copy', 'compile', 'package', 'test']);