var fs = require('fs');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require('redis');
var db = redis.createClient();
var app = express();

app.use(bodyParser.json());


var capp = express();
// LOg mit Pfad und Zeitangabe
capp.use(function(req, res, next){
	console.log('Time:%d' + 'Request-pfad:' +req.path, Date.now());
	next();
});

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
   app.use(express.static(__dirname + '/public'));

	app.use(function(err, req, res, next) {
		console.error(err.stack);
		res.end(err.status + ' ' + err.messages);
	});
}

//Connecting to redis Server
db.on('connect', function() {
    console.log('connected to redis');
});

db.on("error", function (err) {
    console.log("Error " + err);
});



// Neuer Nutzer wird angelegt mit einer passenden ID 
app.post('/user/id', function(req, res) {
	var newUser = req.body;
	db.incr('id:user', function(err, rep) {
		newUser.id = rep;
		db.set('user:'+newUser.id, JSON.stringify(newUser), function(err, rep) {
			res.json(newUser);
		});
	});
});

// Profil eines Nutzers wird ausgegeben
app.get('/user/:id', function(req, res) {
	db.get('user:'+req.params.id, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			res.type('json').send(rep);
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden')
		}
	});
});

// Profil eines Nutzers verändern
app.put('/user/:id', function(req, res) {
	db.exists('user:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			var updatedUser = req.body;
			updatedUser.id = req.params.id;
			db.set('user:' + req.params.id, JSON.stringify(updatedUser), function(err, rep) {
				res.json(updatedUser);
			});
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden');
		}
	});
});

// Profil eines Nutzers löschen
app.delete('/user/:id', function(req, res) {
	db.del('user:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			res.status(200).type('text').send('Der User wurde gelöscht');
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden');
		}
	});
});

//alle nutzer werden ausgegeben
app.get('/user', function(req, res) {
	db.keys('user:*', function(err, rep) { // LAlle keys holen, die mit user: beginnen
		var user = []; //leeres array um user zwischen zu speichern

		if(rep.length == 0) {
			res.json(user);
			return;
		}
		db.mget(rep, function(err, rep) {
			rep.forEach(function(val) {
				user.push(JSON.parse(val));
		});

		user = user.map(function(user) {
			return {id: user.id, name: user.name};
		});
		res.json(user);
		});
	});
});

//neue Favoriten hinzufügen
app.put('/user/:uid/fav/:fid', function(req, res) {
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var user = JSON.parse(rep);
			var vorhanden = false;
			user.favliste.forEach(function(fav, index) {
				//ist array nicht null und
				//fav.id gleich der gesuchte Favorit
				if(fav != null && fav.id == req.params.fid) 
				{
					vorhanden = true;
				}
			});
			
			if(vorhanden)
			{
				res.status(404).type('text').send('Dieser Favorit existiert bereits!')
			}
			else
			{
				//füge neuen Favoriten ein
				user.dienstleister.push({"id": user.id})
				db.set('user:' + req.params.uid, JSON.stringify(user), function(err, rep) {
					res.json(user);
				});
			}
		} 
		else {
			res.status(404).type('text').send('Dieser User existiert nicht!')
		}
	});
});

//Favoriten löschen
app.delete('/user/:uid/fav/:fid', function(req, res) {
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var user = JSON.parse(rep);
			var vorhanden = false;
			user.favliste.forEach(function(fav, index) {
				//ist array nicht null und
				//fav.id gleich der gesuchte Favorit
				if(fav != null && fav.id == req.params.fid) 
				{
					vorhanden = true;
					user.favliste.splice(index, 1);//lösche an Stelle index ein Element
				}
			});
			
			if(vorhanden)
			{
				//füge neuen Favoriten ein
				user.dienstleister.push({"id": user.id})
				db.set('user:' + req.params.uid, JSON.stringify(user), function(err, rep) {
					res.json(user);
				});
			}
			else
			{
				res.status(404).type('text').send('Dieser Favorit existiert nicht!')
			}
		} 
		else {
			res.status(404).type('text').send('Dieser User existiert nicht!')
		}
	});
});




//erstellt event
app.post('/user/:uid/event/', function(req, res) {
	//ist user ein veranstalter
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var obj = JSON.parse(rep);
			if(obj.Rolle == 'veranstalter')
			{
				//ist verantstalter
				
				var newEvent = req.body;
				db.incr('id:event', function(err, rep) {
					newEvent.id = rep;
					newEvent.veranstalter = obj.id;
					db.set('event:'+newEvent.id, JSON.stringify(newEvent), function(err, rep) {
						res.status(200).type('text').send('Event erstellt mit ID:' + newEvent.id)
						//res.json(newEvent);
					});
				});
			}
			else
			{
				res.status(404).type('text').send('Dieser User ist kein Veranstalter!')
			}
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden')
		}
	});
});

//ruft event ab
app.get('/event/:id', function(req, res) {
	db.get('event:'+req.params.id, function(err, rep) {
		if(rep) {
			res.type('json').send(rep);
		} else {
			res.status(404).type('text').send('Das Event ist nicht vorhanden')
		}
	});
});

//U andert event
app.put('/user/:uid/event/:eid', function(req, res) {
	//ist user ein veranstalter
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var user = JSON.parse(rep);
			if(user.Rolle == 'veranstalter' && user.id == req.params.id)// wird festgestellt ob in der db der key Rolle =veranstaltuer ist und holt dann die id
			{
				//ist verantstalter
				db.exists('event:'+req.params.eid, function(err, rep) {
					if(rep == 1) {
						var updatedEvent = req.body;
						updatedEvent.id = req.params.eid;
						db.set('event:' + req.params.eid, JSON.stringify(updatedEvent), function(err, rep) {
							res.json(updatedEvent); //event wird geändert
						});
					} else {
						res.status(404).type('text').send('Das Event ist nicht vorhanden');
					}
				});
			}
			else
			{
				//ist dienstleister
				db.get('event:'+req.params.eid, function(err, rep) {
					if(rep) {
						var event = JSON.parse(rep);
						var vorhanden = false;
						event.dienstleister.forEach(function(dl, index) {
							//ist array nicht null und
							//dienstleister.id ist gleich der aufrufendenen Benutzers
							if(dl != null && dl.id == user.id) 
							{
								vorhanden = true;
								event.dienstleister.splice(index, 1);//lösche an Stelle index ein Element
							}
						});
						
						if(vorhanden)
						{
							//Dienstleister möchte sich austragen
							db.set('event:' + req.params.eid, JSON.stringify(event), function(err, rep) {
								res.json(event);
							});
						}
						else
						{
							//Dienstleister möchte sich eintragen
							//adding Dienstleister in array
							event.dienstleister.push({"id": user.id})
							db.set('event:' + req.params.eid, JSON.stringify(event), function(err, rep) {
								res.json(event);
							});
						}
						
					} 
					else {
						res.status(404).type('text').send('Dieses Event ist nicht vorhanden!')
					}
				});
			}
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden')
		}
	});
});

//löscht event
app.delete('user/:uid/event/:eid', function(req, res) {
	//ist user ein veranstalter
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var obj = JSON.parse(rep);
			if(obj.Rolle == 'veranstalter' && obj.id == req.params.id)
			{
				//ist verantstalter
				
				db.del('event:'+req.params.id, function(err, rep) {
					if(rep == 1) {
						res.status(200).type('text').send('Das Event wurde gelöscht');
					} else {
						res.status(404).type('text').send('Das Event ist nicht vorhanden');
					}
				});
			}
			else
			{
				res.status(404).type('text').send('Dieser User ist nicht der Veranstalter dieses Events!')
			}
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden')
		}
	});
	
});

//gibt alle evente aus
app.get('/event', function(req, res) {
	db.keys('event:*', function(err, rep) {
		var event = [];

		if(rep.length == 0) {
			res.json(event);
			return;
		}
		db.mget(rep, function(err, rep) {
			rep.forEach(function(val) {
				event.push(JSON.parse(val));
		});

		event = event.map(function(event) {
			return {id: event.id, name: event.name};
		});
		res.json(event);
		
		});
	});
});


//Starting node Server on localhost:3000
app.listen(3000);