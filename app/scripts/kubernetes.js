
const execFileSync = require('child_process').execFileSync;
const spawn = require('child_process').spawn;

/*
	1. see if hostname resolves
	2. if not, see if kubectl is available `kubectl version --client --short`
	3. choose context `kubectl config get-contexts --no-headers -o name`
	4. if it is, try to look up kubernetes service `kubectl get service --context=dev-ut -o json -n [namespace] [name]`
	5. if service exists, get service endpoints
	6. decide if we should use nodeport or port forward (use data from 4)
	7. if node port, lookup port in service (use data from 4)
	8. if port forward, load endpoints
	9. setup kubectl port-forward
	10. do request (edited)
*/

var kubernetes = {
	url: require('url'),
	dns: require('dns'),

	kubectlExistsCached: null,
	kubectContext: null,

	nodePortHostname: '', // TODO: this needs to be configurable (if empty, nodeports will never be used)
	defaultNamespace: 'default', // TODO: load default namespace from kubectl config

	kubectlExists: function() {
		if (this.kubectlExistsCached != null) {
			return this.kubectlExistsCached;
		}

		try {
			var args = ['help'];
			execFileSync('kubectl', args);
		} catch(err) {
			this.kubectlExistsCached = false;
		}

		this.kubectlExistsCached = true;

		return this.kubectlExistsCached;
	},

	kubectlCurrentContext: function() {
		if (this.kubectlExistsCached != null) {
			return [];
		}

		try {
			var args = ['config', 'current-context'];
			result = execFileSync('kubectl', args);
		} catch(err) {
			console.log(err);
			return [];
		}

		return String.fromCharCode.apply(String, result);
	},

	kubectlContexts: function() {

		if (this.kubectlExistsCached != null) {
			return [];
		}

		try {
			var args = ['config', 'get-contexts', '-o=name'];
			result = execFileSync('kubectl', args);
		} catch(err) {
			console.log(err);
			return [];
		}

		var s = String.fromCharCode.apply(String, result);
		var split = s.split('\n').sort();

		var objects = [];
		for (i in split) {
			var n = split[i];
			if (n.length == 0) {
				continue
			}

			objects.push({
				'name': n.trim(),
				'id': i
			})
		}

		var current = this.kubectlCurrentContext().trim();
		if (current.length > 0) {
			objects.sort(function(x,y){ 
				
				if (x.name == current) {
					return -1;
				}
				if (y.name == current) {
					return 1;
				}
				return x.name < y.name ? -1 : 1;

			});
		}

		if (!this.kubectlContext) {
			this.setContext(current);
		}

		return objects;
	},

	context: function() {
		return this.kubectlContext;
	},

	setContext: function(context) {
		console.log(`Setting context to [${context}]`);
		this.kubectlContext = context;
	},

	resolvable: function(addr) {

		var parts = addr.split(':');
		if (parts.length < 2) {
			throw "invalid address";
		}

		var port = parts.pop();
		var hostname = parts.join(':');

		var promise = new Promise((resolve, reject) => {

			this.dns.lookup(hostname, (err, address, family) => {
				
				if (!err && !isNaN(port)) {
					resolve(addr);
					return;
				}

				if (this.kubectlExists() == false) {
					reject("kubectl not found");
					return;
				}

				// if dns does not resolve, we may be able to forward into kubernetes
				// through a nodeport or kubectl port-forward
				try {
					var context = this.context();
					var target = this.lookupTarget(context, hostname, port);

					console.log(target);
					if (target.type == 'NodePort') {
						resolve(target.hostname+":"+target.port);
						return
					}
					
					if (target.type == 'Pod') {
						console.log('setting up port forward');

						this.portForward(context, target.namespace, target.pod, target.port).then(forward => {
						
							console.log(`done setting up [${forward}]`);
							resolve(forward.address);
						}, error => {
							reject(error);
						});
						return;

						// TODO: add mechanism to close port forward
					}

					reject(`unknown target type [${target.type}]`);

					return;

				} catch(err) {
					reject(err);
				}
				
				return;

			});
		});
	
		return promise;
	},

	lookupTarget: function(context, serviceName, port) {

		// lookup service definition
		var service = this.lookupService(context, serviceName, port);
		// if there's a node port and there is a node port
		// ingress, use it.
		if (service.type == 'NodePort' && service.nodePort > 0 && this.nodePortHostname.length > 0) {
			return {
				type: 'NodePort',
				hostname: this.nodePortHostname,
				port: service.nodePort
			};
		}

		// otherwise, find pods that match service selector
		if (Object.keys(service.selector).length == 0) {
			throw 'no pod selectors found';
		}

		pods = this.lookupPods(context, service.namespace, service.selector, service.targetPort);
		if (pods.length == 0) {
			throw 'no pods found that match selector';
		}

		return {
			type: 'Pod',
			namespace: service.namespace,
			pod: pods[0].name,
			port: pods[0].containerPort
		};

	},

	lookupPods: function(context, namespace, selectors, port) {

		var selector;
		var i = 0;
		for (var key in selectors) {
			if (i++ > 0) {
				selector += ",";
			}

			selector =  `${key}=${selectors[key]}`;
		}

		var args = [
			'get',
			'pods',
			`--selector=${selector}`,
			`--namespace=${namespace}`,
			`--context=${context}`,
			`-o=json`
		];

		var j;
		try {
			var result = execFileSync('kubectl', args);
			j = String.fromCharCode.apply(String, result);

		} catch(err) {
			throw err;
		}

		var pods = JSON.parse(j);
		var podPorts = [];

		pods:
		for (var i in pods.items) {
			var pod = pods.items[i];
			var name = pod.metadata.name;
			var containerPort;

			containers:
			for (var j in pod.spec.containers) {

				// try to find matching port, if we do, add it, otherwise don't
				var c = pod.spec.containers[j];

				ports:
				for (var k in c.ports) {
					var p = c.ports[k];

					if (p.name == port || p.containerPort == port) {
						containerPort = p.containerPort;
						break containers;
					}
				}
			}

			if (containerPort > 0) {
				podPorts.push({
					name: name,
					containerPort: containerPort,
				})
			}
		}

		return podPorts;

	},

	lookupService: function(context, serviceDNSName, port) {
		// split the serviceName apart. 
		// Assume first part is service name
		// second is the namespace
		// ignore anything that follows

		var namespace = this.defaultNamespace;

		var parts = serviceDNSName.split(".");
		if (parts.length == 0) {
			throw "unable to split kubernetes service dns name";
		}
		name = parts[0];
		if (parts.length > 1) {
			namespace = parts[1];
		}

		var args = [
			'get',
			'service',
			'-o=json',
			`-n=${namespace}`,
			`--context=${context}`,
			name
		];

		var j;
		try {
			var result = execFileSync('kubectl', args);
			j = String.fromCharCode.apply(String, result);

		} catch(err) {
			throw err;
		}

		var service = JSON.parse(j);

		var ports = service.spec.ports;
		if (ports.length == 0) {
			throw "no ports found";
		}

		var resp = {
			namespace: namespace,
			selector: service.spec.selector,
			type: service.spec.type
		};

		// loop through ports and find port that matches either port name or port number
		for (var i in ports) {
			var p = ports[i];
			if (p.nodePort === port || p.name === port) {
				resp.nodePort = p.nodePort;
				resp.targetPort = p.targetPort;
				return resp;
			}

		}

		throw "port not found";

	},

	portForward: async function(context, namespace, pod, port) {
		
		var args = [
			"port-forward",
			pod,
			`--namespace=${namespace}`,
			`0:${port}`,
			`--context=${context}`
		];
		console.log(args);

		var k = spawn('kubectl', args);

		var promise = new Promise((resolve, reject) => {

			k.stdout.on('data', (data) => {
			  
			  var result = String.fromCharCode.apply(String, data);

			  var split = result.split('\n');
			  
			  // parse output message to get hostname and port
			  //   Forwarding from 127.0.0.1:57251 -> 4150
			  //   Forwarding from [::1]:57251 -> 4150

			  // we should be able to parse the first line of the output
			  for (var i in split) {
			  	var l = split[i];
			  	var r = new RegExp(/Forwarding from ([\[\]0-9a-fA-F:\.]+):([0-9]+)/g);
			  	var matches = r.exec(l);

			  	if (matches.length == 3) {
				  var d = {
				  	hostname: matches[1],
				  	port: matches[2],
				  }

				  console.log(`resolving port forward ${d.hostname}:${d.port}`);
				  resolve(d);
				  return;
			  	}
			  }
			  reject(`unable to parse response ${result}`);
			  return;
			});

			k.stderr.on('data', (data) => {
			  console.log(`stderr: ${data}`);
			});

			k.on('close', (code) => {
			  reject(`child process exited with code ${code}`);
			});

		});

		var r;
		await promise.then(result => {
			// result should just be the listening proxy address

			var address = result.hostname+":"+result.port;

			r = {
				address: address,
				close: function() {
					// Send SIGHUP to process
					k.kill('SIGHUP');
				}
			};

			return;

		}, error => {
			throw error
		});

		return r;
	}
}

angular
	.module('app')
	.controller('DropdownCtrl', DropdownCtrl);

NewController.$inject = ['$scope'];

function DropdownCtrl ($scope) {
  var vm = this;

  $scope.kubectlExists = kubernetes.kubectlExists;

  $scope.options = kubernetes.kubectlContexts();
  $scope.selectedOption = $scope.options[0];

  $scope.toggled = function(open) {
  };

  $scope.toggleDropdown = function($event) {

    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  $scope.change = function($event) {
  	kubernetes.setContext($scope.selectedOption.name);
  };

}
