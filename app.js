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
    	os : req.body.os,
   	 	process_cpu_usage : req.body.process_cpu_usage
	};
	statistics.push(newStat);
	console.log(req.body.os);
	console.log(req.body.process_cpu_usage)
  	res.json(true);
});


http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});