'use strict';

let grpc = require('grpc')
const path = require('path');

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

    function parseProtofile(proto) {
        var file = {
            root: path.dirname(proto.file.path),
            file: proto.file.name
        }
        let parsed = grpc.load(file)

        parsed.services = parseServices(parsed)
        parsed.id = parsed.$$hashKey;

        state.protos.push(parsed)

        debugger;
        return parsed
    }

    function getService(serviceID) {
        return state.servicesByServiceID[serviceID];
    }

    function createClient(serviceID, addr) {
        var svc = getService(serviceID);

        // TODO - SSL
        var creds = grpc.credentials.createInsecure();

        var client = new svc.client(addr, creds);

        client.methods = [];

        for(var p in client) {
            if(typeof client[p] === "function") {
                client.methods.push(p);
            }
        }

        return client;
    }

    parseProtofile({file:{path:"/Users/troyshields/projects/omgrpc/exampleSvc/example.proto", name:"example.proto"}})

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