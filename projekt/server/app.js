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
// Log mit Pfad und Zeitangabe
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
//Logt fehler der DB
db.on("error", function (err) {
    console.log("Error " + err);
});



/*
	Profil erstellen
		req = application/json
		res = empty
*/
app.post('/user', function(req, res) {
	var newUser = JSON.parse(JSON.stringify(req.body));
	
	db.incr('id:user', function(err, rep) {
		if (err) res.status(404).type('text').send('Fehler in der DB.');
		else {
			newUser.id = rep;
			newUser.events = [];
			db.set('user:'+newUser.id, JSON.stringify(newUser), function(err, rep) {
				if (err) res.status(404).type('text').send('Der User konnte nicht angelegt werden');
				else res.status(200).type('text').send('Der User angelegt mit ID: ' + newUser.id);
			});
		}
	});
});

/*
	Profil ändern
		req = application/json
		res = empty
*/
app.put('/user/:id', function(req, res) {
	db.exists('user:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			var updatedUser = req.body;
			updatedUser.id = req.params.id;
			db.set('user:' + req.params.id, JSON.stringify(updatedUser), function(err, rep) {
				if (err) res.status(404).type('text').send('Der User konnte nicht geändert werden');
				else res.status(200).type('text').send('Der User ' + updatedUser.id + ' wurde verändert');
			});
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden');
		}
	});
});

/*
	Profil anzeigen
		req = application/json
		res = application/json
*/
app.get('/user/:id', function(req, res) {
	db.get('user:'+req.params.id, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			res.type('json').send(rep);
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden')
		}
	});
});

/*
	Profil löschen
	req = application/json
	res = empty
*/
app.delete('/user/:id', function(req, res) {
	db.del('user:'+req.params.id, function(err, rep) {
		if(rep == 1) {
			res.status(200).type('text').send('Der User wurde gelöscht');
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden');
		}
	});
});

/*
	Alle Profil zeigen
		req = application/json
		res = application/json
*/
app.get('/user', function(req, res) {
	db.keys('user:*', function(err, rep) { // LAlle keys holen, die mit user: beginnen
		var user = []; //leeres array um user zwischen zu speichern

		if(rep.length == 0) {
			//Es gibt keine User
			res.json(user);
			return;
		}
		db.mget(rep, function(err, rep) {
			//füge alle User ins array
			rep.forEach(function(val) {
				user.push(JSON.parse(val));
			});
			
			// das ist ein filter, wenn man den raus nimmt dann alle felder
			user = user.map(function(user) {
				return {id: user.id, vorname: user.vorname, nachname: user.nachname, rolle: user.rolle};
			});
			//sortieren
			user.sort(compareId);
			res.json(user);
		});
	});
});

/*
	Event erstellen
		Veranstalter: Event erstellen
		Dienstnehmer: nichts
		req = application/json
		res = empty
*/
app.post('/user/:uid/event/', function(req, res) {
	//ist user ein veranstalter
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var user = JSON.parse(rep);
			if(user.rolle == 'veranstalter')
			{
				//ist verantstalter
				
				var newEvent = req.body;
				db.incr('id:event', function(err, rep) {
					if (err) res.status(404).type('text').send('Fehler in der DB');
					else {
						newEvent.id = rep;
						newEvent.veranstalter = user.id;
						db.set('event:'+newEvent.id, JSON.stringify(newEvent), function(err, rep) {
							if (err) res.status(404).type('text').send('Das Event konnte nicht geändert werden.');
							else {
								user.events.push(newEvent.id);
								db.set('user:' + req.params.uid, JSON.stringify(user), function(err, rep) {
									if (err) res.status(404).type('text').send('Das Event konnte dem User nicht zugeordnet werden.');
									else res.status(200).type('text').send('Event erstellt mit ID:' + newEvent.id);
								});
							}
						});
					}
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

/*
	Event ändern
		Veranstalter: Ändern Eventdaten
		Dienstnehmer: Eintragen/Austragen im Event
		req = application/json
		res = empty
*/
app.put('/user/:uid/event/:eid', function(req, res) {
	//ist user ein veranstalter
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var user = JSON.parse(rep);
			if(user.rolle == 'veranstalter' && user.id == req.params.uid)// wird festgestellt ob in der db der key Rolle =veranstaltuer ist und holt dann die id
			{
				//ist verantstalter
				db.exists('event:'+req.params.eid, function(err, rep) {
					if(rep == 1) {
						var updatedEvent = req.body;
						updatedEvent.id = req.params.eid;
						db.set('event:' + req.params.eid, JSON.stringify(updatedEvent), function(err, rep) {
							if (err) res.status(404).type('text').send('Das Event konnte nicht geändert werden.');
							else res.status(200).type('text').send('Event ID ' + newEvent.id + ' wurde verändert.');
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
						if(event.dienstleister)
						{
							event.dienstleister.forEach(function(dl, index) {
								//dienstleister.id ist gleich der aufrufendenen Benutzers
								if(dl == user.id) 
								{
									vorhanden = true;
									event.dienstleister.splice(index, 1);//lösche an Stelle index ein Element
								}
							});
						}
						else
						{
							vorhanden = false;
							event.dienstleister = [];
						}
						
						if(vorhanden)
						{
							//Dienstleister möchte sich austragen
							db.set('event:' + req.params.eid, JSON.stringify(event), function(err, rep) {
								if (err) res.status(404).type('text').send('Dienstleister konnte nicht ausgetragen werden.');
								else res.status(200).type('text').send('Dienstleister wurde ausgetragen.');
							});
						}
						else
						{
							//Dienstleister möchte sich eintragen
							//adding Dienstleister in array
							event.dienstleister.push(user.id)
							db.set('event:' + req.params.eid, JSON.stringify(event), function(err, rep) {
								if (err) res.status(404).type('text').send('Dienstleister konnte nicht eintragen werden.');
								else res.status(200).type('text').send('Dienstleister wurde eintragen.');
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

/*
	Event löschen
		Veranstalter: Event erstellen
		Dienstnehmer: nichts
		req = application/json
		res = empty
*/
app.delete('user/:uid/event/:eid', function(req, res) {
	//ist user ein veranstalter
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var obj = JSON.parse(rep);
			if(obj.rolle == 'veranstalter' && obj.id == req.params.id)
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


/*
	Event anzeigen
		req = application/json
		res = application/json
*/
app.get('/user/:uid/event/:eid', function(req, res) {
	db.get('event:'+req.params.eid, function(err, rep) {
		if(rep) {
			var event = JSON.parse(rep);
			var userlist = [];
			var user = [];
			
			//Gibt es eine liste
			if(Array.isArray(event.dienstleister)) {
				//erstelle user abfrage
				event.dienstleister.forEach(function(val, index) {
					userlist.push('user:'+val);
				});
				
				db.mget(userlist, function(err, rep) {
					rep.forEach(function(val) {
						user.push(JSON.parse(val));
					});

					user = user.map(function(user) {
						return {id: user.id, vorname: user.vorname, nachname: user.nachname};
					});
					
					event.dienstleister = user;
					
					res.json(event);
				});
			
			}
			else {
				res.json(event);
			}
			
		} else {
			//Kein Event vorhanden
			res.json({});
		}
	});
});

/*
	Alle Events zeigen
		Veranstalter: Sieht nur seine erstellten Events
		Dienstnehmer: Sieht alles Events
		req = application/json
		res = application/json
*/
app.get('/user/:uid/event/', function(req, res) {
	//ist user ein veranstalter
	db.get('user:'+req.params.uid, function(err, rep) {// User mit entsprechender ID aufrufen
		if(rep) {
			var obj = JSON.parse(rep);
			if(obj.rolle == 'veranstalter')
			{
				//ist verantstalter
				var eventlist = [];
				var event = [];
				
				//Gibt es eine liste und ist diese nicht leer?
				if(Array.isArray(obj.events) && obj.events.length > 0) {
					//erstelle event abfrage
					obj.events.forEach(function(val, index) {
						eventlist.push('event:'+val);
					});
					
					db.mget(eventlist, function(err, rep) {
						rep.forEach(function(val) {
							event.push(JSON.parse(val));
						});

						event = event.map(function(event) {
							return {id: event.id, name: event.name};
						});
						//sortieren
						event.sort(compareId);
						
						res.json(event);
					});
				
				}
				else
				{
					//Liste ist leer
					res.json(event);
				}
			}
			else
			{
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
						//sortieren
						event.sort(compareId);
						
						res.json(event);
					});
				});
			}
		} else {
			res.status(404).type('text').send('Dieser User ist nicht vorhanden')
		}
	});
});


/*
	Favoriten hinzufügen
	req = application/json
	res = empty
*/
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
					if (err) res.status(404).type('text').send('Der Favorit konnte nicht eintragen werden.');
					else res.status(200).type('text').send('Der Favorit wurde eintragen.');
				});
			}
		} 
		else {
			res.status(404).type('text').send('Dieser User existiert nicht!')
		}
	});
});

/*
	Favoriten löschen
	req = application/json
	res = empty
*/
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
					if (err) res.status(404).type('text').send('Der Favorit konnte nicht gelöscht werden.');
					else res.status(200).type('text').send('Der Favorit wurde gelöscht.');
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


/*
	Sortierfunktion
	hilft 2 verschiedene Objekte anhand ihrer ID zu vergleichen
*/
function compareId(a, b) {
	//a ist größer
	if(a.id > b.id) {return 1;}
	//b ist größer
	if(b.id > a.id ) {return -1;}
	//beide sind gleich groß
	return 0;
}


//Starting node Server on localhost:3000
app.listen(3000);