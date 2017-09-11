'use strict';

let grpc = require('grpc')
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
                return key != "$$hashKey"
            })
            .map(function(pkgName){
                return proto[pkgName];
            })
            .forEach(function(pkg){
                Object.keys(pkg)
                    .filter(function(key){
                        return pkg[key].service
                    })
                    .forEach(function(key){
                        var svc = {
                            id: key,
                            name: key,
                            client: pkg[key]
                        }
                        services.push(svc);

                        state.servicesByServiceID[key] = svc;
                    });
            });

        return services;
    }

    function findRoot(root, relPath, attempts) {
        var parsed
        try {
            var file = {
                root: root,
                file: relPath
            };
            
            parsed = grpc.load(file);
        } catch (e) {
            if (attempts > 0) {
                let newRoot = path.dirname(root);
                let newRelPath = path.join(root, relPath).replace(newRoot, "");

                if (newRelPath[0] == path.sep) {
                    newRelPath = newRelPath.substring(1);
                }

                return findRoot(newRoot, newRelPath, attempts-1);
            }

            throw (e);
        }

        return parsed
    }

    function parseProtofile(protoFile, skipSave) {
        console.log("protofile", protoFile);
        let parsed = findRoot(path.dirname(protoFile.path), protoFile.name, protoFile.path.split(path.sep).length);

        parsed.services = parseServices(parsed)
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

    function parseResolvedType(grpcType) {
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
            if (f.resolvedType) {
                t = parseResolvedType(f.resolvedType);
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