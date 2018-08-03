# Read this please!

[TL;DR] - omgRPC is dead; long live [grpc-json-proxy](https://github.com/jnewmano/grpc-json-proxy).

omgrpc was built because of frustration that we felt at Weave while transitioning from REST to gRPC. Lack of tooling like Postman made it hard to test or feel confident about services we were working on. So, one night while my wife was working late I put together a proof-of-concept for a project that could dynamically load a protobuf file to let you interact with a gRPC server: omgRPC. This project has gotten very little TLC since then, but it helped us a lot at Weave while we were becoming more comfortable with gRPC. 

While it was nice to fantasize about adding many more Postman-like features to omgRPC, the fact is that Postman is just awesome and this little side-project was never going to catch up to that. 

Recently, another member of our team (and contributor to omgrpc) has found a _very_ convenient way to use Postman to interact with gRPC servers. I'll let him explain the mechanics to you [here](https://medium.com/@jnewmano/grpc-postman-173b62a64341). 

While I encourage you to star this repo (obviously), use it as it's useful, and make any contributions you want, you are probably better off using jnewmano's [grpc-json-proxy](https://github.com/jnewmano/grpc-json-proxy) to enable you to continue to use HTTP tools you know and love like `curl` or Postman.

# omgrpc

omgRPC aims to be a GUI client for interacting with gRPC services, similar to what Postman is for REST APIs.

The goal is for it to be easy to use. Just open your `.proto` file and specify the address of the server you want to connect to and you're ready to start making requests.

![omgRPC Example](http://shldz.us/omgrpc/omgrpc.gif "omgRPC Example")

## Kubernetes support

Version v0.2.0 and later can automatically setup a port-forward for connecting to services inside of Kubernetes. If kubectl exists in your path, a dropdown will appear allowing you to choose which kubectl config to use, with the current kubectl config selected by default. You can then use the {servicename}.{namespace}:{port|port name} as the server address and omgRPC will figure out how a destination pod to setup a port forward.

# Contributing

Please consider contributing, I will try to make it as easy as possible. This started as a proof-of-concept as I first started working with gRPC at [Weave](https://getweave.com) and it's just sort of grown organically from there. As a result, it's quite a mess and can use a lot of love. I'm open to any and all ideas.

## Setting Up

In order to run omgRPC from source, execute the following steps from the root directory:

* Install [Node JS](https://nodejs.org/en/download/).
* Update Node's package manager [NPM](https://docs.npmjs.com/getting-started/installing-node)
* Install [nwjs](https://www.npmjs.com/package/nwjs), which is an installer for NW.js (NodeWebkit): `npm install -g nwjs`.
* Install nw.js 0.22.3-sdk by running `nw install 0.25.0-sdk`
* Install project dependencies by running `npm install`
* Install `npm install -g node-pre-gyp`
* Install `npm install -g nw-gyp`
* Most annoying step of all, rebuild the node gRPC dependency for your platform by running something like `npm rebuild grpc --build-from-source --runtime=node-webkit --target=0.25.0 --target_arch=x64 --target_platform=darwin` (set target\_arch and target\_platform to whatever you are building for. See [here](https://github.com/mapbox/node-pre-gyp))
* Run omgRPC by running `nw .`

To be able to run the repo's example gRPC service (which is fully optional) you must have [Go](https://golang.org/) installed, along with all of the example's required dependencies. If you need help with this, let me know. This miniature Go project is a little different than your average Go project because it might not be in your normal GOPATH.

## Frameworks and Organization

The project uses Angular 1 (or AngularJS or whatever we're calling it these days). I choice this because I was already familiar with it and didn't want to learn a new framework if this project wasn't even going to work. Now that it does work I'm leaning towards choosing something else, such as React or Angular-whatever-the-newest-is.

Bootstap is the CSS framework, but again switching to some material-design framework might be worth it.

The app itself lives in `app`. It imports dependencies from `node_modules`. The structure is pretty simple. There are only a couple of views that each have controllers, and a couple of services that handle some common dependencies. The code's organization could use some cleanup and rework as well.

There is an example gRPC service (written in Go) that can be used (and altered) to quickly and easily test omgRPC. This lives in `exampleSvc`.

## Building for Distribution

I am sure there is a better way to do this (and one that will utilize minification better). 

For now I am just using a tool called [nw-builder](https://github.com/nwjs-community/nw-builder). You can run `./build.sh`, which runs a gulp file that mostly just copies everything it needs into a `build` folder, then runs this command: `nwbuild -v 0.25.0 -p osx64 ./build/ -o dist`. It drops the built resources into a folder called `dist`.

#### Some Miscellaneous Notes
* Import statements in the proto file need to be relative to the proto file from some shared root path.
