
// let parsed = grpc.load({
//     root: process.cwd(),
//     file: 'example.proto'
// })

const grpc = require('grpc')

// require('nw.gui').Window.get().showDevTools();

// Load native UI library
var gui = require('nw.gui'); //or global.window.nwDispatcher.requireNwGui() (see https://github.com/rogerwang/node-webkit/issues/707)

// Get the current window
var win = gui.Window.get();

win.showDevTools();


var file = {
    root: process.cwd() + "/exampleSvc",
    file: "example.proto"
}
let parsed = grpc.load(file)
let serviceName = "exampleSvc"

let creds = grpc.credentials.createInsecure()
let client = new parsed["exampleSvc"].ExampleService("127.0.0.1:6565", creds)

console.log(client)
// var client = init(serviceName, parsed, "exampleSvc/example.proto", serviceName, "127.0.0.1:6565", {insecure:true})
// client.sayHello({sayWhat:"hi"}, pr)


