'use strict';

let grpc = require('grpc')
const path = require('path');

angular
  .module('app')
  .service('GrpcSvc', GrpcSvc);

GrpcSvc.$inject = [];

function GrpcSvc() {
    function getGrpcServices(connectionParams) {
        var file = {
            root: path.dirname(connectionParams.file.path),
            file: connectionParams.file.name
        }
        let parsed = grpc.load(file)

        return parsed
    }

    function getGrpcClient(connectionParams) {
        var file = {
            root: path.dirname(connectionParams.file.path),
            file: connectionParams.file.name
        }
        let parsed = grpc.load(file)
        let serviceName = "exampleSvc"

        let creds = grpc.credentials.createInsecure()
        let client = new parsed["exampleSvc"].ExampleService(connectionParams.address, creds)

        window.client = client

        return client
    }

    return {
        getGrpcServices: getGrpcServices,
        getGrpcClient: getGrpcClient
    }
}