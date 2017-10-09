'use strict';

let grpc = require('grpc')

var ProtoBuf = require('protobufjs');

const path = require('path');
const fs = require('fs');

angular
  .module('app')
  .service('GrpcSvc', GrpcSvc);

GrpcSvc.$inject = ['StorageSvc'];

function GrpcSvc(StorageSvc) {
    var state = {
        protos: [],
        servicesByServiceID: {}
    }

    function parseServices(proto) {
        var services = [];

        Object.keys(proto)
            .filter(function(key){
                if (key == "$$hashKey") {
                    return false
                }

                return true;
            })
            .map(function(pkgName){
                return proto[pkgName];
            })
            .forEach(function(pkg){

                let s = Object.keys(pkg)
                    .filter(function(key){
                        try {
                            return pkg[key].service
                        } catch(e) {
                            console.log(e);
                            return false;
                        }
                    });

                if (s.length === 0) {
                    parseServices(pkg).forEach(function(svc){
                        services.push(svc);
                    });
                } else {
                    s.forEach(function(key){
                        var svc = {
                            id: key,
                            name: key,
                            client: pkg[key]
                        }
                        services.push(svc);
                    });
                }
            });

        return services;
    }

    function findRoot(root, relPath, attempts) {

        var parsed

        // check if file exists
        var fn = path.join(root, relPath);
        if (!fs.existsSync(fn)) {
           throw('file does not exist');
        }

        var rootPB = new ProtoBuf.Root();
        // http://dcode.io/protobuf.js/Root.html#resolvePath
        rootPB.resolvePath = function(origin, target) {
            if (!origin) {
                return target;
            }

            var attempts = 10;
            var r = path.dirname(origin);
            while (true) {
                
                fn = path.join(r, target);
                if (fs.existsSync(fn)) {
                    return fn;
                }

                r = path.dirname(r);
                attempts = attempts - 1;
            }
        }

        rootPB.loadSync(fn);

        parsed = grpc.loadObject(rootPB);

        return parsed
    }

    function parseProtofile(protoFile, skipSave) {

        let parsed = findRoot(path.dirname(protoFile.path), protoFile.name, protoFile.path.split(path.sep).length);

        let service = parseServices(parsed);

        parsed.services = service;

        if (parsed.services.length === 0) {
            console.log("did not get any services from proto file");
            return
        }

        parsed.services.forEach(function(svc) {    
            state.servicesByServiceID[svc.id] = svc;
        });


        parsed.id = protoFile.name;
        state.protos.push(parsed);

        if (!skipSave) {
            StorageSvc.saveRecentProto({
                path: protoFile.path,
                name: protoFile.name,
            });
        }

        return parsed
    }

    function getService(serviceID) {
        return state.servicesByServiceID[serviceID];
    }

    function parseResolvedType(grpcType, depth) {
        // we track depth in case there's a recursive message we'll give up on it before getting a stack overflow--I'm sure we can handle this in a better way
        if (!depth) {
            depth = 1;
        }

        if (grpcType.className == "Enum") {
            return {
                name: grpcType.name,
                enumerations: grpcType.children.map(function(c){
                    return {
                        value: c.id,
                        name: c.name
                    };
                }),
                type: "enum"
            }
        }

        if (!grpcType._fields) {
            return grpcType.name
        }

        var fields = grpcType._fields.map(function(f){
            var t
            if (f.resolvedType && depth < 4) {
                depth++;
                t = parseResolvedType(f.resolvedType, depth);
            } else {
                t = f.type.name;
            }

            // TODO handle enum types here so we can display them better
            return {
                name: f.name,
                type: t,
                defaultValue: f.defaultValue,
                repeated: f.repeated,
                required: f.required
            }
        });

        return {
            fields: fields,
            typeName: grpcType.name
        }
    }

    function createClient(serviceID, addr, secure, cert, targetnameoverride) {
        var svc = getService(serviceID);

        var options = {
            'grpc.min_reconnect_backoff_ms': 1000,
            'grpc.max_reconnect_backoff_ms': 1000,
            'grpc.keepalive_time_ms': 15000
        };

        var creds;
        // TODO get SSL to work :()
        if (secure) {
            var cert = fs.readFileSync(cert); 
            creds = grpc.credentials.createSsl(cert);

            if (targetnameoverride != "") {
                options['grpc.ssl_target_name_override'] = targetnameoverride
            }
        } else {
            creds = grpc.credentials.createInsecure();
        }

        var client = new svc.client(addr, creds, options);

        client.methods = [];

        var methodCache = {};

        for(var p in client) {
            if(typeof client[p] === "function") {
                methodCache[p.toLowerCase()] = {
                    name: p
                };
            }
        }

        Object.keys(svc.client.service).forEach(function(k){
            // check if it's a streaming endpoint and do something different if it is? this whole mess needs to be cleaned up
            var child = svc.client.service[k] 

            if (!child.originalName) {
                return
            }

            var m = methodCache[child.originalName.toLowerCase()]

            if (!m) {
                console.log("Couldn't find method on client", child.name)
                return
            }

            m.requestType = {};
            m.responseType = {};

            m.requestType.type = parseResolvedType(child.requestType);
            m.responseType.type = parseResolvedType(child.responseType);

            m.requestStream = child.requestStream;
            m.responseStream = child.responseStream;
            m.isStream = m.requestStream || m.responseStream;

            client.methods.push(m);
        });


        return client;
    }

    return {
        parseProtofile: parseProtofile,
        // getGrpcClient: getGrpcClient
        getProtos: function() {
            return state.protos
        },
        removeProto: function(proto) {
            var index = state.protos.indexOf(proto);
            state.protos.splice(index, 1)

            StorageSvc.removeRecentProto(proto.id);
        },

        getService: getService,
        createClient: createClient
    }
}

/*
    binary.load
    cli->pbjs->cli

    var builder = ProtoBuf.loadProtoFile(node_path.join("..", "..", "..", "src", "google", "protobuf", "descriptor.proto")),
        FileDescriptorSet = builder.build("google.protobuf.FileDescriptorSet");
    var fds = FileDescriptorSet.decode(data),
        imports = [];
    var json = {
        "package": null,
        "imports": imports
    };
    fds.file.forEach(function(fdp) {
        imports.push(buildFileDescriptorProto(fdp));
    });
    return json;
*/
