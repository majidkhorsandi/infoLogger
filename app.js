/**
 * Created by majkho on 2015-09-02.
 */

var express = require('express')
	, http = require('http')
	, path = require('path')
	, contacts = require('./moduels/contacts')
	, cors = require('cors');

var url = require('url');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/contacts',
	function(request, response){

		var get_params = url.parse(request.url, true).query;

		if (Object.keys(get_params).length == 0)
		{
			response.setHeader('content-type', 'application/json');
			response.end(JSON.stringify(contacts.list()));
		}
		else
		{
			response.setHeader('content-type', 'application/json');
			response.end(JSON.stringify(
				contacts.query_by_arg(
					get_params.arg, get_params.value)
			));
		}
	}
);


app.get('/contacts/:number', function(request, response) {
	response.setHeader('content-type', 'application/json');
	response.end(JSON.stringify(contacts.query(request.params.number)));
});

app.get('/groups', function(request, response) {
	console.log ('groups');
	response.setHeader('content-type', 'application/json');
	response.end(JSON.stringify(contacts.list_groups()));
});

app.get('/groups/:name', function(request, response) {
	console.log ('groups');
	response.setHeader('content-type', 'application/json');
	response.end(JSON.stringify(
		contacts.get_members(request.params.name)));
});


http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});