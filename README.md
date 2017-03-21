# omgrpc

OMGRPC aims to be a postman-like client for interacting with gRPC services.

Just select your .proto file, tell it where the server is running, and away you go.

The import statements in the proto file need to be relative to the proto file from some shared root path.


- Install grpc : `npm install grpc --build-from-source --runtime=node-webkit --target=0.21.3 --target_arch=x64`
- Build: Move stuff to a build folder and run `nwb nwbuild -v 0.21.3-sdk -p osx64 ./build/` with nwjs-builder