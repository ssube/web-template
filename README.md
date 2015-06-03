Need to hit a REST API from a single-page app? This will get you started.

# Web Template
This is a light-weight template for building packaged, tested front-end-only web applications.

A bootstrap webpage and server are built in, allowing this repository to be a fully
functional single-page app.

## What's Provided?
This project will build itself, serve itself, and render a key from the configuration
onto the page with some styling.

That should be enough to show Webpack working with Babel, Handlebars, and LESS. To
make things fun, Karma gets in the mix to handle testing with PhantomJS.

For the strongly-typed, basic support for Typescript is in place but needs the 1.5
release to work fully.

## What's Missing?
There are no MV* frameworks included. Source maps and code coverage are not set up yet.

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
