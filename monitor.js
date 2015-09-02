/**
 * Created by majkho on 2015-09-02.
 */

var monitor = require("os-monitor")
	, os = require('os')
	, usage = require('usage');
	var Client = require('node-rest-client').Client;

    var client = new Client();

if (process.argv[2] == null) {
	printUsage();
	return;
};
var processID = process.argv[2];
var monitorInterval = process.argv[3] == null ? 3000 : process.argv[3];


monitor.start({ delay: monitorInterval // interval in ms between monitor cycles
	, freemem: 1000000000 // freemem under which event 'freemem' is triggered
	, uptime: 1000000 // number of secs over which event 'uptime' is triggered
	, critical1: 0.7 // loadavg1 over which event 'loadavg1' is triggered
	, critical5: 0.7 // loadavg5 over which event 'loadavg5' is triggered
	, critical15: 0.7 // loadavg15 over which event 'loadavg15' is triggered
	, silent: false // set true to mute event 'monitor'
	, stream: false // set true to enable the monitor as a Readable Stream
	, immediate: false // set true to execute a monitor cycle at start()
});

//console.log('Operating system: ' + os.type());

monitor.on('monitor', function(event) {
	console.log(event.type, 'Collecting information every ' + monitorInterval + ' second');
	usage.lookup(processID, function(err, result) {
		if (result) {
			console.log(result);
			console.log(result.cpu);
		} else {
			return
		}

		var args = {
          data: { os: os.type(), process_cpu_usage: result.cpu },
          headers:{"Content-Type": "application/json"}
        };

		client.post("http://localhost:3000/stat", args, function(data,response) {
                // parsed response body as js object
                //console.log(data);
                // raw response
                console.log(response);
            });

		console.log('free memory: ' + os.freemem());
        console.log('total available memory: ' + os.totalmem());
        console.log('Average CPU load in system level: ' + os.loadavg());
	})
});

function printUsage() {
	console.log('\n********** Correct Usage ******************')
	console.log('node monitor.js pid interval')
	console.log("pid = spotify's process id")
	console.log('interval = data collection interval in ms (optional)')
	console.log('********************************************')
}