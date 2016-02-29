var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'MSRM_daemon',
  description: 'The nodejs web server to run the MSRM project.',
  script: 'D:\\NodeProjects\\MSRM\\server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();