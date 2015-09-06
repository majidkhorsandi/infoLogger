/**
 * Created by majkho on 2015-09-02.
 */
var DEFAULT_PORT = 3000;
var DEFAULT_SERVER = 'localhost';
var STATUS_OK = 200;

var monitor = require("os-monitor");
var os = require('os');
var usage = require('usage');
var Client = require('node-rest-client').Client;
var client = new Client();
var serverAddress;
var	monitorInterval;
var	processID;


if (!isCorrectUsage()) {return};
assignCommandLineArguments();
isServerAlive(startMonitor);


function isServerAlive(startMonitor){
console.log('Pinging the remote server before starting to monitor...')
	client.get('http://' + serverAddress + ':' + DEFAULT_PORT + '/ping', function(data, response) {
		if (response.statusCode != STATUS_OK) {
			console.log('Could not ping the monitor server. Please check if server is started');
		} else {
			console.log(response.body + 'Monitor server is up and running...');
			startMonitor();
		}
	}).on('error', function(err) {
		console.log('Could not ping the monitor server. Please check if server is started');
	});
};

function startMonitor(){
console.log('Monitor is started. Stop it by pressing Ctrl+c');
monitor.start({ delay: monitorInterval });
monitor.on('monitor', function(event) {
	usage.lookup(processID, function(err, result) {
		if (!result) {
			return;
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
    monitorInterval = process.argv[4] == null ? DEFAULT_PORT : process.argv[4];
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
	console.log('interval = Data collection interval in ms (optional)')
	console.log('********************************************')
}