/**
 * Created by majkho on 2015-09-02.
 */
var DEFAULT_PORT = 3000;
var DEFAULT_INTERVAL = 3;
var DEFAULT_SERVER = 'localhost';
var STATUS_OK = 200;
var SEC_TO_MILLISEC = 1000;

var monitor = require("os-monitor");
var os = require('os');
var usage = require('usage');
var Client = require('node-rest-client').Client;
var ping = require('ping');
var client = new Client();
var serverAddress;
var	monitorInterval;
var	processID;


if (!isCorrectUsage()) {return};
assignCommandLineArguments();
isServerAlive(startMonitor);


function isServerAlive(startMonitor){
	console.log('Pinging the remote server before starting to monitor...');
	ping.sys.probe(serverAddress, function(isAlive){
            if (!isAlive) {
            	console.log('Monitor server is not reachable. Please check the address.');
            	process.exit(1);
            }
    });
	client.get('http://' + serverAddress + ':' + DEFAULT_PORT + '/ping', function(data, response) {
		if (response.statusCode != STATUS_OK) {
			console.log('Could not talk to the monitor service. Please check if service is started.');
			process.exit(1);
		} else {
			console.log('Monitor server is up and running...');
			startMonitor();
		}
	}).on('error', function(err) {
		console.log('Something went wrong when trying to talk to monitor service');
	});
};

function startMonitor(){
	console.log('Monitor is started. Stop it by pressing Ctrl+c');
	monitor.start({ delay: monitorInterval*SEC_TO_MILLISEC });
	monitor.on('monitor', function(event) {
	usage.lookup(processID, function(err, result) {
		if (!result) {
			console.log('Process ID could not be found');
			process.exit(1)
		}
		if (err) {
			throw err;
		}
		client.post("http://" + serverAddress + ":" + DEFAULT_PORT + "/stat", generateUsgeJsonMessage(result), function(data,response) {
			console.log('Sending usage statistics to the monitor server')
        }).on('error', function(err){
        	console.log('something went wrong with connecting to the server!');
        	monitor.stop();
        	return;
        });
	})
});
};

function generateUsgeJsonMessage(result) {
	return {
    	data: {time: getCurrentTime(),
        os: os.platform() + '-' + os.release(),
        process_cpu_usage: result.cpu,
        process_mem_usage: result.memory/1000,
        total_mem: os.totalmem()/1000 ,
        total_free_mem: os.freemem()/1000},
    	headers:{"Content-Type": "application/json"}
    };
}

function assignCommandLineArguments() {
	processID = process.argv[2];
	if (process.argv[4] == null) {
		monitorInterval = DEFAULT_INTERVAL;
	} else if (process.argv[4] < 1) {
		monitorInterval = 1;
		console.log('Min interval can not be less than one second. Changing interval to 1 sec');
	} else if (process.argv[4] > 60) {
		monitorInterval = 60;
		console.log('Max interval can not be more than one minute. Changing interval to 1 min');
	} else {
		monitorInterval = process.argv[4];
	}
    serverAddress = process.argv[3] == null ? DEFAULT_SERVER : process.argv[3]
}

function getCurrentTime() {
	var currentDate = new Date();
	var currentHour = currentDate.getHours() < 10 ? '0' + currentDate.getHours() : currentDate.getHours();
	var currentMinute = currentDate.getMinutes() < 10 ? '0' + currentDate.getMinutes() : currentDate.getMinutes();
	var currentSecond = currentDate.getSeconds() < 10 ? '0' + currentDate.getSeconds() : currentDate.getSeconds();
	var currentTime = currentHour + ":" + currentMinute + ":" + currentSecond;
	return currentTime;
}

function isCorrectUsage() {
	if (process.argv[2] == null) {
		printUsage();
		return false;
	} else return true;
}

function printUsage() {
	console.log('\n********** Correct Usage ******************')
	console.log(':> node monitor.js <pid> <server-address> <interval>')
	console.log('server-address = IP address of server that collects the information. Default is localhost')
	console.log("pid = ID of the process you want to monitor")
	console.log('interval = Data collection interval in seconds (optional)')
	console.log('********************************************')
}