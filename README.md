# omgrpc

omgRPC aims to be a GUI client for interacting with gRPC services, similar to what Postman is for REST APIs.

The goal is for it to be easy to use. Just open your `.proto` file and specify the address of the server you want to connect to and you're ready to start making requests.

![omgRPC Example](http://shldz.us/omgrpc/omgrpc.gif "omgRPC Example")

# Contributing

Please consider contributing, I will try to make it as easy as possible. This started as a proof-of-concept as I first started working with gRPC at [Weave](https://getweave.com) and it's just sort of grown organically from there. As a result, it's quite a mess and can use a lot of love. I'm open to any and all ideas.

## Setting Up

In order to run omgRPC from source, execute the following steps from the repo's root:

* Install [Node JS](https://nodejs.org/en/download/).
* Update Node's package manager [NPM](https://docs.npmjs.com/getting-started/installing-node)
* Install [nw](https://github.com/nwjs/npm-installer), which is an installer for NW.js (NodeWebkit).
* Install nw.js 0.22.3-sdk by running `nw install 0.22.3-sdk`
* Install project dependencies by running `npm install`
* Most annoying step of all, rebuild the node gRPC dependency for your platform by running something like `npm rebuild grpc --build-from-source --runtime=node-webkit --target=0.22.3 --target_arch=x64`
* Run omgRPC by running `nw .`

To be able to run the repo's example gRPC service (which is fully optional) you must have [Go](https://golang.org/) installed, along with all of the example's required dependencies. If you need help with this, let me know. This miniature Go project is a little different than your average Go project because it might not be in your normal GOPATH.

## Frameworks and Organization

The project uses Angular 1 (or AngularJS or whatever we're calling it these days). I choice this because I was already familiar with it and didn't want to learn a new framework if this project wasn't even going to work. Now that it does work I'm leaning towards choosing something else, such as React or Angular-whatever-the-newest-is.

Bootstap is the CSS framework, but again switching to some material-design framework might be worth it.

The app itself lives in `app`. It imports dependencies from `node_modules`. The structure is pretty simple. There are only a couple of views that each have controllers, and a couple of services that handle some common dependencies. The code's organization could use some cleanup and rework as well.

There is an example gRPC service (written in Go) that can be used (and altered) to quickly and easily test omgRPC. This lives in `exampleSvc`.

## Building for Distribution

I am sure there is a better way to do this (and one that will utilize minification better). 

For now I am just using a tool called [nwjs-builder](https://www.npmjs.com/package/nwjs-builder). I just copy and paste the `app`, `node_modules`, `config.json`, and `package.json` into a folder called `build` and then run this command: `nwb nwbuild -v 0.22.3-sdk -p osx64 ./build/`. It drops the built resources into a folder called `omgrpc-osx-x64`.

#### Some Miscellaneous Notes
* Import statements in the proto file need to be relative to the proto file from some shared root path.