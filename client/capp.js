var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var ejs = require('ejs');
var fs = require('fs');
var http = require('http');

var app = express();
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({
  extended: true
}));

/*
    [GET] Userliste anzeigen
*/
app.get('/', jsonParser, function(req, res) {
		fs.readFile('./user.ejs', {encoding: 'utf-8'}, function (err, filestring){
		if (err){
			throw err;
		}else{
			var options={
				host:'localhost',
				port: 3000, // dienstgeber
				path:'/user',
				method:'GET',
				headers: {
					accept: 'application/json'
				}
			}
			var externalRequest = http.request(options, function(externalResponse){
				console.log('Connected');
				externalResponse.on('data', function(chunk){

					var userdata = JSON.parse(chunk);

					var html = ejs.render(filestring, { user:userdata });
					res.setHeader('content-type', 'text/html');
					res.writeHead(200);
					res.write(html);
					res.end();
				});
			});
			externalRequest.end();
		}
	});
});

/*
    [GET] Profil erstellen
*/
app.get('/create_user', jsonParser, function(req, res) {
		fs.readFile('./create_user.ejs', {encoding: 'utf-8'}, function (err, filestring){
		if (err){
			throw err;
		}else{
			var html = ejs.render(filestring);
			res.setHeader('content-type', 'text/html');
			res.writeHead(200);
			res.write(html);
			res.end();
		}
	});
});

/*
    [POST] Profil erstellen
*/
app.post('/create_user', jsonParser, function(req, res) {

	var options={
		host:'localhost',
		port: 3000, // dienstgeber
		path:'/user',
		method:'POST',
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json'
		}
	}
	var externalRequest = http.request(options, function(externalResponse){
		//console.log('Connected');

		externalResponse.on('data', function(chunk){
            console.log('Connected');

			res.status(externalResponse.statusCode).type('text').send(externalResponse.statusMessage);
		});
	});
	externalRequest.write(JSON.stringify(req.body));
	externalRequest.end();
});

/*
    [GET] Eventliste darstellen
*/
app.get('/user/:uid/event', jsonParser, function(req, res) {
		fs.readFile('./events.ejs', {encoding: 'utf-8'}, function (err, filestring){
		if (err){
			throw err;
		}else{
			var options={
				host:'localhost',
				port: 3000, // dienstgeber
				path:'/user/'+req.params.uid+'/event',
				method:'GET',
				headers: {
					accept: 'application/json'
				}
			}
			var externalRequest = http.request(options, function(externalResponse){
				console.log('Connected');
				externalResponse.on('data', function(chunk){
                    //get eventdata
					var eventdata = JSON.parse(chunk);

                    options = {
        				host:'localhost',
        				port: 3000, // dienstgeber
        				path:'/user/'+req.params.uid,
        				method:'GET',
        				headers: {
        					accept: 'application/json'
        				}
        			}
        			externalRequest2 = http.request(options, function(externalResponse){
        				externalResponse.on('data', function(chunk){
                            //get userdata
        					var userdata = JSON.parse(chunk);

        					var html = ejs.render(filestring, { event:eventdata, user:userdata });
        					res.setHeader('content-type', 'text/html');
        					res.writeHead(200);
        					res.write(html);
        					res.end();
        				});
        			});
        			externalRequest2.end();
				});
			});
			externalRequest.end();
		}
	});
});

/*
    [GET] Event darstellen
*/
app.get('/user/:uid/event/:eid', jsonParser, function(req, res) {
		fs.readFile('./event.ejs', {encoding: 'utf-8'}, function (err, filestring){
		if (err){
			throw err;
		}else{
			var options={
				host:'localhost',
				port: 3000, // dienstgeber
				path:'/user/'+req.params.uid+'/event/'+req.params.eid,
				method:'GET',
				headers: {
					accept: 'application/json'
				}
			}
			var externalRequest = http.request(options, function(externalResponse){
				console.log('Connected');
				externalResponse.on('data', function(chunk){

					var eventdata = JSON.parse(chunk);

					eventdata.user_vorhanden = false;
					if(eventdata.dienstleister)
					{
						eventdata.dienstleister.forEach(function(dl, index) {
							//ist array nicht null und
							//dienstleister.id ist gleich der aufrufendenen Benutzers
							if(dl != null && dl.id == req.params.uid)
							{
								eventdata.user_vorhanden = true;
							}
						});
					}

                    options = {
        				host:'localhost',
        				port: 3000, // dienstgeber
        				path:'/user/'+req.params.uid,
        				method:'GET',
        				headers: {
        					accept: 'application/json'
        				}
        			}
        			externalRequest2 = http.request(options, function(externalResponse){
        				externalResponse.on('data', function(chunk){
                            //get userdata
        					var userdata = JSON.parse(chunk);

        					var html = ejs.render(filestring, { event:eventdata, user:userdata });
        					res.setHeader('content-type', 'text/html');
        					res.writeHead(200);
        					res.write(html);
        					res.end();
        				});
        			});
        			externalRequest2.end();
				});
			});
			externalRequest.end();
		}
	});
});

/*
    [GET] Event erstellen
*/
app.get('/user/:uid/create_event', jsonParser, function(req, res) {
		fs.readFile('./create_event.ejs', {encoding: 'utf-8'}, function (err, filestring){
		if (err){
			throw err;
		}else{
            var options={
				host:'localhost',
				port: 3000, // dienstgeber
				path:'/user/'+req.params.uid,
				method:'GET',
				headers: {
					accept: 'application/json'
				}
			}
			var externalRequest = http.request(options, function(externalResponse){
				console.log('Connected');
				externalResponse.on('data', function(chunk){

					var userdata = JSON.parse(chunk);

                    //antihacking
                    if(userdata.rolle == 'veranstalter')
                    {
                        var html = ejs.render(filestring, { user_id:req.params.uid });
					    res.setHeader('content-type', 'text/html');
					    res.writeHead(200);
					    res.write(html);
					    res.end();
                    }
                    else {
                        res.status(404).type('text').send('Sie sind nicht dazu berechtigt!');
                    }
				});
			});
			externalRequest.end();
		}
	});
});

/*
    [POST] Event erstellen
*/
app.post('/user/:uid/create_event', jsonParser, function(req, res) {

	var options={
		host:'localhost',
		port: 3000, // dienstgeber
		path:'/user/'+req.params.uid+'/event/',
		method:'POST',
		headers: {
			accept: 'application/json',
			'Content-Type': 'application/json'
		}
	}
	var externalRequest = http.request(options, function(externalResponse){
		console.log('Connected');

        res.status(externalResponse.statusCode).type('text').send(externalResponse.statusMessage);
	});
	externalRequest.write(JSON.stringify(req.body));
	externalRequest.end();
});

/*
    [POST] Dienstleister eintragen/austragen
*/
app.post('/user/:uid/event/:eid', jsonParser, function(req, res) {
	var options={
		host:'localhost',
		port: 3000, // dienstgeber
		path:'/user/'+req.params.uid+'/event/'+req.params.eid,
		method:'PUT',
		headers: {
			accept: 'application/json'
		}
	}
	var externalRequest = http.request(options, function(externalResponse){
		console.log('Connected');
		externalResponse.on('data', function(chunk){

			res.status(externalResponse.statusCode).type('text').send(externalResponse.statusMessage);
		});
	});
	externalRequest.end();
});

app.listen(3001, function(){
console.log("Server listen on Port 3001");
});
