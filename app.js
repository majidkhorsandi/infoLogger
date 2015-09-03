/**
 * Created by majkho on 2015-09-02.
 */

var express = require('express')
	, http = require('http')
	, path = require('path')
	, bodyParser = require('body-parser');

var url = require('url');
var app = express();
var statistics = [];

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser());

app.post('/stat', function(req, res) {
	if(!req.body.hasOwnProperty('os') || !req.body.hasOwnProperty('process_cpu_usage')) {
    		res.statusCode = 400;
    		return res.send('Error 400: Post syntax incorrect.');
  	}
	var newStat = {
		date: req.body.date,
    	os : req.body.os,
   	 	process_cpu_usage : req.body.process_cpu_usage,
		process_mem_usage : req.body.process_mem_usage,
		total_mem : req.body.total_mem,
		total_free_mem : req.body.total_free_mem
	};
	statistics.push(newStat);
	console.log(statistics);
  	res.json(true);
});


http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});