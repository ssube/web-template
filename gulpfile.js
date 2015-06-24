// Import packages
var gulp = require('gulp');
var path = require('path');
var babel = require('gulp-babel');
var karma = require('karma').server;
var eslint = require('gulp-eslint');
var rimraf = require('rimraf');
var webpack = require('webpack-stream');
var webserver = require('gulp-webserver');

// Import options
function getBuildOptions(file) {
  var options = require(path.join(__dirname, file));
  var home = process.env.USERPROFILE || process.env.HOME;
  try {
    var overrides = require(path.join(home, file));
    Object.keys(overrides).forEach(function (key) {
      options[key] = overrides[key];
    });
  } catch (e) {
    console.log('Could not include personal build options.');
  }
  return options;
}

var buildOptions = getBuildOptions('build.json');

// Define paths
var paths = {
  src: {
    base: 'src',
    main: 'src/main',
    test: 'src/test'
  },
  dest: {
    base: 'target',
    main: 'target/main',
    test: 'target/test',
    pack: 'target/pack',
    cover: 'target/cover'
  },
  name: {
    main: 'main.bundle.js',
    test: 'test.bundle.js'
  },
  glob: {
    es6: '**/*.es6',
    js: '**/*.js',
    test: '**/test-*.es6'
  },
  resource: {
    main: ['**/*.hbs', '**/*.less', '**/*.css'],
    pack: ['index.html', 'conf.json']
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
  // Set up the webpack preprocessor for ES6 scripts
  var pre = {};
  pre[path.join(paths.src.test, paths.glob.es6)] = ['webpack'];

  // Return built options
  return {
    browsers: buildOptions['karma.browsers'],
    coverageReporter: {
      dir: paths.dest.cover,
      reporters: [{
        type: 'lcov', subdir: 'lcov'
      }]
    },
    files: [
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      {pattern: path.join(paths.src.test, paths.glob.test), included: true}
    ],
    frameworks: ['mocha'],
    preprocessors: pre,
    reporters: buildOptions['karma.reporters'],
    singleRun: true,
    webpack: webpackOptions(paths.name.test, true)
  };
}

function webpackOptions(name, test) {
  var options = {
    devtool: '#inline-source-map',
    externals: {
      jquery: {
        root: 'jquery',
        amd: 'jquery'
      }
    },
    module: {
      preLoaders: [
        {test: /\.js$/, loaders: ['source-map-loader']}
      ],
      loaders: [
        {test: /\.css$/, loaders: ['style-loader', 'css-loader']},
        {test: /\.hbs$/, loaders: ['handlebars-loader']},
        {test: /\.less$/, loaders: ['style-loader', 'css-loader', 'less-loader']}
      ]
    },
    node: {
      global: false,
      process: false
    },
    output: {
      filename: name,
      libraryTarget: 'umd'
    },
    resolve: {
      extensions: ['', '.es6', '.js'],
      root: path.join(__dirname, paths.dest.main)
    }
  };

  // Modify the settings to instrument tests
  if (test) {
    options.module.preLoaders.push({
      test: /\.es6$/, include: path.resolve(paths.src.base), loader: 'babel-loader?optional[]=runtime'
    }, {
      test: /\.es6$/, include: path.resolve(paths.src.main), loader: 'isparta'
    });
    options.resolve.root = path.join(__dirname, paths.src.main);
  }

  return options;
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
  return gulp.src(path.join(paths.src.main, paths.glob.es6))
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:main:js', ['lint'], function () {
  return gulp.src(path.join(paths.src.main, paths.glob.js))
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('compile:test:es6', ['lint'], function () {
  return gulp.src(path.join(paths.src.test, paths.glob.es6))
    .pipe(babel(babelOptions))
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('compile:test:js', ['lint'], function () {
  return gulp.src(path.join(paths.src.test, paths.glob.js))
    .pipe(gulp.dest(paths.dest.test));
});

gulp.task('copy:manifest', function () {
  return gulp.src('package.json')
    .pipe(gulp.dest(paths.dest.base));
});

gulp.task('copy:resource:main', function () {
  var fullPaths = paths.resource.main.map(function (glob) {
    return path.join(paths.src.main, glob);
  });
  return gulp.src(fullPaths)
    .pipe(gulp.dest(paths.dest.main));
});

gulp.task('copy:resource:pack', function () {
  var fullPaths = paths.resource.pack.map(function (glob) {
    return path.join(paths.src.main, glob);
  });
  return gulp.src(fullPaths)
    .pipe(gulp.dest(paths.dest.pack));
});

gulp.task('lint:main:es6', function () {
  return gulp.src(path.join(paths.src.main, paths.glob.es6))
    .pipe(eslint(eslintOptions()))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('package:main', ['compile'], function () {
  return gulp.src(path.join(paths.dest.main, paths.glob.js))
    .pipe(webpack(webpackOptions(paths.name.main, false)))
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

// Group tasks
gulp.task('compile:main', ['compile:main:es6', 'compile:main:js']);
gulp.task('compile:test', ['compile:test:es6', 'compile:test:js']);
gulp.task('compile', ['compile:main', 'compile:test']);
gulp.task('copy:resource', ['copy:resource:main', 'copy:resource:pack']);
gulp.task('copy', ['copy:manifest', 'copy:resource']);
gulp.task('lint:main', ['lint:main:es6']);
gulp.task('lint', ['lint:main']);
gulp.task('package', ['package:main']);

// Default task
gulp.task('default', ['copy', 'compile', 'package', 'test']);
