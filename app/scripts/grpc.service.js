'use strict';

let grpc = require('grpc')
const path = require('path');

const fs = require('fs');

angular
  .module('app')
  .service('GrpcSvc', GrpcSvc);

GrpcSvc.$inject = [];

function GrpcSvc() {
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

    function parseProtofile(protoFile) {
        let parsed = findRoot(path.dirname(protoFile.path), protoFile.name, protoFile.path.split(path.sep).length);

        parsed.services = parseServices(parsed)
        parsed.id = parsed.$$hashKey;

        state.protos.push(parsed)

        return parsed
    }

    function getService(serviceID) {
        return state.servicesByServiceID[serviceID];
    }

    function parseResolvedType(grpcType) {
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

    function createClient(serviceID, addr, secure) {
        var svc = getService(serviceID);

        var creds;
        // TODO get SSL to work :()
        if (secure) {
            var cert = fs.readFileSync('/Users/troyshields/projects/omgrpc/exampleSvc/server.crt'); 
            creds = grpc.credentials.createSsl(cert);
        } else {
            creds = grpc.credentials.createInsecure();
        }

        var client = new svc.client(addr, creds);

        client.methods = [];

        var methodCache = {};

        for(var p in client) {
            if(typeof client[p] === "function") {
                methodCache[p.toLowerCase()] = {
                    name: p
                };
            }
        }

        svc.client.service.children.forEach(function(child){
            if (child.className==="Service.RPCMethod") {
                // check if it's a streaming endpoint and do something different if it is? this whole mess needs to be cleaned up

                var m = methodCache[child.name.toLowerCase()]

                if (!m) {
                    console.log("Couldn't find method on client", child.name)
                    return
                }

                m.requestType = {};
                m.responseType = {};

                m.requestType.type = parseResolvedType(child.resolvedRequestType);
                m.responseType.type = parseResolvedType(child.resolvedResponseType);

                m.requestStream = child.requestStream;
                m.responseStream = child.responseStream;
                m.isStream = m.requestStream || m.responseStream;

                client.methods.push(m);
            }
        });


        return client;
    }

    // parseProtofile({path:"/Users/troyshields/projects/omgrpc/exampleSvc/example.proto", name:"example.proto"})

    return {
        parseProtofile: parseProtofile,
        // getGrpcClient: getGrpcClient
        getProtos: function() {
            return state.protos
        },

        getService: getService,
        createClient: createClient
    }
}