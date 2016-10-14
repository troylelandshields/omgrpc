'use strict';


// const grpc = require('grpc')

// angular
//   .module('app')
//   .service('GrpcDefintionSvc', GrpcDefintionSvc);

// GrpcDefintionSvc.$inject = [];

// function GrpcDefintionSvc ()
// {
//   function getGrpcDefition(src) {
//     var file = {
//         root: process.cwd() + "/exampleSvc",
//         file: "example.proto"
//     }
//     let parsed = grpc.load(file)
//     let serviceName = "exampleSvc"

//     let creds = grpc.credentials.createInsecure()
//     let client = new parsed["exampleSvc"].ExampleService("127.0.0.1:6565", creds)

//     console.log(client)

//     return client
//   }

//   return {
//     GetGrpcDefintion: getGrpcDefition
//   }
// }