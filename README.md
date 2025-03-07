# Chronas

[![Build Status](https://dev.azure.com/chronas/chronas/_apis/build/status/Chronasorg.chronas?branchName=master)](https://dev.azure.com/chronas/chronas/_build/latest?definitionId=2?branchName=master)
[![dependencies](https://david-dm.org/daumann/chronas.svg)](https://david-dm.org/daumann/chronas)
[![devDependency Status](https://david-dm.org/daumann/chronas/dev-status.svg)](https://david-dm.org/daumann/chronas#info=devDependencies)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Table of Contents
- [Chronas](#chronas)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
  - [Project Structure](#project-structure)
  - [Live Development](#live-development)
    - [Hot Reloading](#hot-reloading)
    - [Redux DevTools](#redux-devtools)
  - [Routing](#routing)
  - [Testing](#testing)
  - [Building for Production](#building-for-production)
  - [Deployment](#deployment)
    - [Static Deployments](#static-deployments)
    - [Docker](#docker)
  - [Thank You](#thank-you)

11. [Thank You](#thank-you)

## Installation

After confirming that your environment meets the above [requirements](#requirements), you can install Chronas locally by doing the following:

```bash
$ git clone https://github.com/daumann/chronas.git <my-project-name>
$ cd <my-project-name>
```

When that's done, install the project dependencies.

```bash
$ npm install
```

## Running the Project

After completing the [installation](#installation) step, you're ready to start the project!

```bash
$ npm start  # Start the development server
```

While developing, you will probably rely mostly on `npm start`; however, there are additional scripts at your disposal:

|`npm run <script>`    |Description|
|-------------------|-----------|
|`start`            |Serves Chronas at `localhost:3000`|
|`build`            |Builds the application to ./dist|
|`test`             |Runs unit tests with Karma. See [testing](#testing)|
|`test:watch`       |Runs `test` in watch mode to re-run tests when changed|
|`lint`             |[Lints](http://stackoverflow.com/questions/8503559/what-is-linting) the project for potential errors|
|`lint:fix`         |Lints the project and [fixes all correctable errors](http://eslint.org/docs/user-guide/command-line-interface.html#fix)|

## Project Structure

The project structure is **fractal**, where functionality is grouped primarily by feature rather than file type. This structure is only meant to serve as a guide, it is by no means prescriptive. That said, it aims to represent generally accepted guidelines and patterns for building scalable applications. If you wish to read more about this pattern, please check out this [awesome writeup](https://github.com/davezuko/react-redux-starter-kit/wiki/Fractal-Project-Structure) by [Justin Greenberg](https://github.com/justingreenberg).

## Live Development

### Hot Reloading

Hot reloading is enabled by default when the application is running in development mode (`npm start`). This feature is implemented with webpack's [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement.html) capabilities, where code updates can be injected to the application while it's running, no full reload required. Here's how it works:

* For **JavaScript** modules, a code change will trigger the application to re-render from the top of the tree. **Global state is preserved (i.e. redux), but any local component state is reset**. This differs from React Hot Loader, but we've found that performing a full re-render helps avoid subtle bugs caused by RHL patching.

* For **Sass**, any change will update the styles in realtime, no additional configuration or reload needed.

### Redux DevTools

**We recommend using the [Redux DevTools Chrome Extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd).**
Using the chrome extension allows your monitors to run on a separate thread and affords better performance and functionality. It comes with several of the most popular monitors, is easy to configure, filters actions, and doesn't require installing any packages in your project.

However, it's easy to bundle these developer tools locally should you choose to do so. First, grab the packages from npm:

```bash
npm add --dev redux-devtools redux-devtools-log-monitor redux-devtools-dock-monitor
```

Then follow the [manual integration walkthrough](https://github.com/gaearon/redux-devtools/blob/master/docs/Walkthrough.md).

## Routing
We use `react-router` [route definitions](https://github.com/ReactTraining/react-router/blob/v3/docs/API.md#plainroute) (`<route>/index.js`) to define units of logic within our application. See the [project structure](#project-structure) section for more information.

## Testing
To add a unit test, create a `.spec.js` file anywhere inside of `./tests`. Karma and webpack will automatically find these files, and Mocha and Chai will be available within your test without the need to import them.

## Building for Production

## Deployment

Out of the box, Chronas is deployable by serving the `./dist` folder generated by `npm run build`. At this stage of development, Chronas is using a [fake REST api](https://github.com/marmelab/FakeRest) for test data input.

### Static Deployments

Serve the application with a web server such as nginx by pointing it at your `./dist` folder. Make sure to direct incoming route requests to the root `./dist/index.html` file so that the client application will be loaded; react-router will take care of the rest. If you are unsure of how to do this, you might find [this documentation](https://github.com/reactjs/react-router/blob/master/docs/guides/Histories.md#configuring-your-server) helpful. The Express server that comes with this early draft project is able to be extended to serve as an API and more, but is not required for a static deployment.

### Docker

You can find Chronas as well on Docker [aumanjoa/chronas-map](https://hub.docker.com/r/aumanjoa/chronas-map/)

[Dockerfile](https://github.com/daumann/chronas/blob/master/Dockerfile)

To run the docker use ```docker run -p -d 80:80 aumanjoa/chronas-map```


## Thank You

This project wouldn't be possible without help from the Chronas community, so I'd like to thank especially those who backed the [Kickstarter](https://www.kickstarter.com/projects/1152044848/chronas-interactive-history-map-application) campaign!