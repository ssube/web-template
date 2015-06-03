// Import packages
var gulp = require('gulp');
var babel = require('gulp-babel');
var karma = require('karma').server;
var eslint = require('gulp-eslint');
var rimraf = require('rimraf');
var webpack = require('gulp-webpack');
var webserver = require('gulp-webserver');
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
    js: '/**/*.js'
  },
  resource: {
    main: ['/**/*.hbs', '/**/*.less', '/**/*.css'],
    pack: ['/index.html', '/conf.json']
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
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
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
    externals: {
      jquery: {
        root: 'jquery',
        amd: 'jquery'
      }
    },
    module: {
      loaders: [
        {test: /\.css$/, loaders: ['style-loader', 'css-loader']},
        {test: /\.hbs$/, loaders: ['handlebars-loader']},
        {test: /\.less$/, loaders: ['style-loader', 'css-loader', 'less-loader']}
      ]
    },
    output: {
      filename: name,
      libraryTarget: 'umd'
    }
  };
}

function webserverOptions() {
  return {
    host: '0.0.0.0',
    path: '/',
    port: '8000'
  };
}

// Tasks
gulp.task('clean', function (done) {
  rimraf(paths.dest.base, done);
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

gulp.task('compile:main:ts', ['lint'], function () {
  var tsResults = gulp.src(paths.src.main + paths.glob.ts)
    .pipe(typescript(typescriptOptions()));
    
  return tsResults.js
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.dest.main));
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

gulp.task('compile:test:ts', ['lint'], function () {
  var tsResults = gulp.src(paths.src.test + paths.glob.ts)
    .pipe(typescript(typescriptOptions()));
    
  return tsResults.js
    .pipe(babel(babelOptions))  
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('copy:manifest', function () {
  return gulp.src('package.json')
    .pipe(gulp.dest(paths.dest.base));
});

gulp.task('copy:resource:main', function () {
  var fullPaths = paths.resource.main.map(function (path) {
    return paths.src.main + path;
  });
  return gulp.src(fullPaths)
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('copy:resource:pack', function () {
  var fullPaths = paths.resource.pack.map(function (path) {
    return paths.src.main + path;
  });
  return gulp.src(fullPaths)
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('lint:main:es6', function () {
  return gulp.src(paths.src.main + paths.glob.es6)
    .pipe(eslint(eslintOptions()))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
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

gulp.task('serve', ['default'], function () {
  gulp.src(paths.dest.pack)
    .pipe(webserver(webserverOptions()));
});

gulp.task('compile:main', ['compile:main:es6', 'compile:main:js', 'compile:main:ts']);
gulp.task('compile:test', ['compile:test:es6', 'compile:test:js', 'compile:test:ts']);
gulp.task('compile', ['compile:main', 'compile:test']);
gulp.task('copy:resource', ['copy:resource:main', 'copy:resource:pack']);
gulp.task('copy', ['copy:manifest', 'copy:resource']);
gulp.task('lint:main', ['lint:main:es6']);
gulp.task('lint', ['lint:main']);
gulp.task('package', ['package:main', 'package:test']);

// Default task
gulp.task('default', ['copy', 'compile', 'package', 'test']);