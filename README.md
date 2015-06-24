Need to hit a REST API from a single-page app? This will get you started.

# Web Template
This is a light-weight template for building packaged, tested front-end-only web applications.

A bootstrap webpage and server are built in, allowing this repository to be a fully
functional single-page app.

## What's Provided?
This project will build itself, serve itself, and render a key from the configuration
onto the page with some styling.

That should be enough to show Webpack working with Babel, Handlebars, and LESS, with source maps enabled.

To make things fun, Karma gets in the mix to handle testing with your preferred browsers (falling back to
PhantomJS) and produces code coverage reports for the ES6 code.

## What's Missing?
Integration with a CI system, probably Travis CI.

There are no MV* frameworks included, but this structure should work with most existing frameworks.

## Build
```
npm install
gulp
```

## Run
```
npm install
gulp serve
```

## Tools
This repository is intended to provide a clean example of a number of tools working together.

The build configuration transpiles ES6 to run on current browsers, runs in-browser tests, and merges styling
and templates with scripts for a single deployable package.

To make this possible, we're using:

 - [BabelJS](https://babeljs.io/)
 - [Bluebird](https://github.com/petkaantonov/bluebird)
 - [Chai](http://chaijs.com/)
 - [ESLint](http://eslint.org/)
 - [Gulp](http://gulpjs.com/)
 - [Handlebars](http://handlebarsjs.com/)
 - [Isparta](https://github.com/douglasduteil/isparta)
 - [Karma](http://karma-runner.github.io/0.12/index.html)
 - [LESS](http://lesscss.org/)
 - [Mocha](http://mochajs.org/)
 - [PhantomJS](http://phantomjs.org/)
 - [Webpack](http://webpack.github.io/)

This is not a complete list of every package, just the main tools. Without these tools and their authors, we would
not have a sane and manageable JavaScript workflow today.

## Potential Errors
### webpack entry point dependencies

If you receive an error from webpack about depending on entry points, make sure you aren't importing any files
that are also considered valid tests. This error is the reason behind the `**/test-*` filter on test files.

## Disclaimer
These are not necessarily the best tools for the job, but they are my favorites (and now, the ones I get to use
at work).

This configuration may not be ideal, but it is tested and seems to work. If you have any suggestions, pull requests
are welcome!
