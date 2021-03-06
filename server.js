/**
 * Created by majkho on 2015-09-02.
 */

var express = require('express')
	, http = require('http')
	, path = require('path')
	, bodyParser = require('body-parser')
	, fs = require('fs');

var url = require('url');
var app = express();
var statistics = [];

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

fs.exists(createLogFileName(), function(exists) {
	if (!exists) {
		console.log('No log file for today was found. The log file will be created.');
		var fields = ['time    ',
						'os    ',
						'process_cpu_usge(%)    ',
						'process_mem_usage(KB)    ',
						'total_mem(KB)    ',
						'total_free_mem(KB)    \n'];
    	fs.writeFile(createLogFileName(),fields, function(err){
    		if (err) throw err;
		})
	}
})

app.get('/ping', function(req, res){
	res.statusCode = 200;
	return res.send('pong!');
});

// server receives a new post request at uri /stat. If everything fine, writes new entry to log file
app.post('/stat', function(req, res) {
	if(!req.body.hasOwnProperty('os') || !req.body.hasOwnProperty('process_cpu_usage') |
		!req.body.hasOwnProperty('process_mem_usage') || !req.body.hasOwnProperty('total_mem') ||
		!req.body.hasOwnProperty('total_free_mem') || !req.body.hasOwnProperty('time')) {
    		res.statusCode = 400;
    		return res.send('Error 400: Post syntax incorrect.');
  	}
  	console.log('A new log entry received: ');
	var newStat = {
		time: req.body.time,
    	os: req.body.os,
   	 	process_cpu_usage : req.body.process_cpu_usage,
		process_mem_usage : req.body.process_mem_usage,
		total_mem : req.body.total_mem,
		total_free_mem : req.body.total_free_mem
	};
	console.log(newStat);
    fs.appendFile(createLogFileName(), createNewLogEntry(req), function (err) {
      	if (err) {
      		console.log(err);
      		throw err;
      	}
    })
  	res.json(true);
});

//server is created and started
http.createServer(app).listen(app.get('port'), function() {
	console.log('Log server listening on port ' + app.get('port'));
});


function createLogFileName() {
	var date = new Date();
    var mm = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    var dd = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var yy = date.getFullYear();
    return './log' + yy + mm + dd + '.txt';
}

function createNewLogEntry(req) {
	var newLine= req.body.time + '    ' + req.body.os + '    ' + req.body.process_cpu_usage + '    ';
		newLine = newLine + req.body.process_mem_usage + '    ' + req.body.total_mem + '    ' + req.body.total_free_mem + '    \n';
		return newLine;
}