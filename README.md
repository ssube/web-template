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

## Potential Errors
### webpack entry point dependencies

If you receive an error from webpack about depending on entry points, make sure you aren't importing any files
that are also considered valid tests. This error is the reason behind the `**/test-*` filter on test files.
