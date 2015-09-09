// Import packages
var gulp = require('gulp');
var path = require('path');
var karma = require('karma').server;
var eslint = require('gulp-eslint');
var rimraf = require('rimraf');
var webpack = require('webpack-stream');
var webserver = require('gulp-webserver');
var minimist = require('minimist');

var cliOptions = minimist(process.argv.slice(2))

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
    pack: ['index.html', 'conf.json']
  }
};

// Library options
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
        {
          test: /\.es6$/,
          include: path.resolve(paths.src.base),
          loader: 'babel-loader',
          query: {
            optional: ['runtime']
          }
        },
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
      root: path.join(__dirname, paths.src.main)
    }
  };

  // Modify the settings to instrument tests
  if (test) {
    options.module.preLoaders.push({
      test: /\.es6$/, include: path.resolve(paths.src.main), loader: 'isparta'
    });
  }

  return options;
}

function webserverOptions() {
  return {
    host: cliOptions.host || '0.0.0.0',
    path: cliOptions.path || '/',
    port: cliOptions.port || '8000'
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

gulp.task('package:main', ['lint'], function () {
  return gulp.src(path.join(paths.src.main, paths.glob.es6))
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
gulp.task('copy:resource', ['copy:resource:pack']);
gulp.task('copy', ['copy:manifest', 'copy:resource']);
gulp.task('lint:main', ['lint:main:es6']);
gulp.task('lint', ['lint:main']);
gulp.task('package', ['package:main']);

// Default task
gulp.task('default', ['copy', 'package', 'test']);
