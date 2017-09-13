'use strict';

const uuidParse = require('uuid-parse');
const uuidValidate = require('uuid-validate');

angular
  .module('app')
  .controller('ClientController', ClientController);

NewController.$inject = ['GrpcSvc', '$stateParams', '$scope', 'StorageSvc', 'KubernetesSvc'];

function ClientController (GrpcSvc, $stateParams, $scope, StorageSvc, KubernetesSvc) {
  var vm = this;

  var transformers = {};

  vm.connection = {
    hasConnection: false,
    addr: "127.0.0.1:9000",
    targetnameoveride: ""
  };

  vm.result = null;
  vm.args = [];
  vm.metadataArgs = [];
  vm.json = true;

  var viewifier;

  function convertToExampleJSON(field) {
    var json = {};

    if (field.type && field.type == "bytes") {
      transformers[field.name] = function(str){ 
        if (uuidValidate(str)) {
          var parsedUUID = uuidParse.parse(str);
          return new Buffer(parsedUUID);
        }

        return new Buffer(str, "base64"); 
      }
      return "";
    }

    if (field.type && (field.type.type == "enum" || typeof field.type != "object")) { 
      return field.defaultValue;
    }
    
    field.type.fields.forEach(function(childField){
      json[childField.name] = convertToExampleJSON(childField);
    });

    return json;
  }

  vm.connectClient = async function(addr) {
    
    let done = function() {
        vm.disconnectClient();
        $scope.$apply();
    };

    var server;
    await KubernetesSvc.resolvable(addr, done).then(result => {
      server = result;
    }, error =>{
      console.log(error);
      return
    });

    if (!server) {
      alert("error: could not resolve hostname")
      $scope.$apply();
      return;
    }

    addr = server;
    console.log("Setting up grpc client: " + addr);
    vm.client = GrpcSvc.createClient($stateParams.serviceID, addr, vm.connection.secure, vm.connection.cert, vm.connection.targetnameoveride);
    vm.connection.hasConnection = true;
    vm.setMethod(vm.client.methods[0]);

    $scope.$apply();

  };

  vm.disconnectClient = function() {
    vm.client = null;
    vm.connection = {
      hasConnection: false,
      addr: vm.connection.addr,
      targetnameoveride: ""
    };
    
    vm.selectedMethod = null;
  };

  vm.setMethod = function(method, reset) {
    if (!vm.json) {
      vm.toggleInput();
    }

    vm.selectedMethod = method;
 
    if (!vm.selectedMethod.arg || reset){
      vm.selectedMethod.arg = {
        argStr: "{}",
        edited: false
      }
    }

    if (!vm.selectedMethod.arg.edited) {
      vm.selectedMethod.arg.argStr = JSON.stringify(convertToExampleJSON(method.requestType), undefined, 2);
    }

  };

  vm.addMetadata = function() {
    vm.metadataArgs.push({})
  }

  vm.removeMetadata = function(md) {
    var index = vm.metadataArgs.indexOf(md);
    if (index > -1) {
      vm.metadataArgs.splice(index, 1);
    }
  }

  vm.kubernetesCapable = KubernetesSvc.kubectlExists

  vm.kubernetesSettings = function() {
    alert('here');
  } 

  function displayResult(err, reply) {
      if (err) {
        vm.result = {
          error_code: err.code,
          message: err.message
        }
      } else {
        // go through each key, if it's a Buffer then convert to stringify
        var transform = function(obj) {
          Object.keys(obj).forEach(function(key) {
            if (!obj[key]) {
              return
            }
            
            if (obj[key] instanceof Buffer) {
              // try to convert to UUID. If your data was exactly 16 bytes and not a UUID, uhm... sorry :/
              if (obj[key].byteLength == 16) {
                var parsed = uuidParse.unparse(obj[key]);
                if (uuidValidate(parsed)) {
                  obj[key] = parsed;
                  return
                }
              }

              obj[key] = obj[key].toString("base64");
            }
            if (typeof obj[key] == "object") {
              transform(obj[key]);
            }
          });
        }

        transform(reply);
        vm.result = reply;
      }
      $scope.$apply();
  }

  vm.execute = function(method) {
    
    vm.result = null;
    var meta = new grpc.Metadata();

    vm.metadataArgs.forEach(function(ma) {
      meta.add(ma.key, ma.value)
    });


    var input;
    if (vm.json) {
      input = JSON.parse(vm.selectedMethod.arg.argStr);
    } else {
      input = viewifier.Model();
    }

    var transform = function(obj) {
      Object.keys(obj).forEach(function(key) {
        if (typeof obj != "object") {
          return
        }
        if (transformers[key]) {
          obj[key] = transformers[key](obj[key]);
        }

        transform(obj[key]);
      });
    }

    transform(input);
    vm.client[method.name](input, meta, displayResult);
  };

  vm.connectStream = function(method) {
    vm.result = null;
    var meta = new grpc.Metadata();

    vm.metadataArgs.forEach(function(ma) {
      meta.add(ma.key, ma.value)
    });

    vm.stream = vm.client[method.name](meta);
    vm.stream.isConnected = true;
    vm.stream.setMaxListeners(1);

    vm.stream.on("data", function(data) {
      displayResult(null, data);
    });
  };

  vm.sendStream = function(stream) {
    vm.result = null;

    var input;
    if (vm.json) {
      input = JSON.parse(vm.selectedMethod.arg.argStr);
    } else {
      input = viewifier.Model();
    }

    stream.write(input);
  };

  vm.closeStream = function(stream) {
    stream.end();
    vm.stream.isConnected = false;
  }

  vm.toggleTooltip = function() {
    vm.showTooltip = !vm.showTooltip;
  }

  function schemaFromProto(field) {

    // gonna treat bytes as string until viewify supports files
    if (field.type && field.type == "bytes") {
      return {
        fieldName: field.name,
        fieldType: "string",
        repeated: field.repeated
      }
    }

    if (field.type && typeof field.type != "object") {
      return {
        fieldName: field.name,
        fieldType: field.type,
        repeated: field.repeated
      }
    }

    // if (field.type && field.type.typeName == "UUID") {
    //   return {
    //     fieldName: field.name,
    //     fieldType: "object",
    //     typeName: field.type.typeName,
    //     repeated: field.repeated,
    //     fieldDef: [{
    //       fieldName: field.name,
    //       fieldType: "string",
    //     }]
    //   }
    // }



    if (field.type && field.type.type == "enum") {
      return {
        fieldName: field.name,
        fieldType: "enum",
        values: field.type.enumerations.map(function(v){
          return {
            display: v.name,
            value: v.value
          }
        })
      }
    }
    
    var n = field.name;
    if (!n) {
      n = field.type.typeName;
    }

    var fieldSchema = {
      fieldName: n,
      fieldType: "object",
      typeName: field.type.typeName,
      repeated: field.repeated,
      fieldDef: []
    } 

    field.type.fields.forEach(function(childField){
      fieldSchema.fieldDef.push(schemaFromProto(childField)); 
    });

    return fieldSchema;
  }

  var viewifier;

  vm.toggleInput = function() {
    if (vm.json) {
      vm.json = false;

      var schema = schemaFromProto(vm.selectedMethod.requestType);
      
      viewifier = new Viewifier(schema);
      viewifier.show("viewify-container");

      var model = JSON.parse(vm.selectedMethod.arg.argStr);
      viewifier.Load(model);
    } else {
      vm.json = true;
      var current = document.getElementById("viewify-container");
      while (current.firstChild) {
          current.removeChild(current.firstChild);
      }

      vm.selectedMethod.arg.argStr = JSON.stringify(viewifier.Model(), null, 2);
    }
  }

  $scope.setCert = function(element) {
    var filename = element.value
    vm.connection.cert = filename

    $('#upload-file-info').html(filename);
  }

  $scope.kubectlExists = KubernetesSvc.kubectlExists;

  $scope.kubectlContexts = KubernetesSvc.kubectlContexts();
  $scope.kubectlSelectedContext = $scope.kubectlContexts[0];

  $scope.kubectlContextChange = function($event) {
    KubernetesSvc.setContext($scope.kubectlSelectedContext.name);
  };

}
