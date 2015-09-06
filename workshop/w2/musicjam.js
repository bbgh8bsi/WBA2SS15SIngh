var express = require('express');
var bodyParser = require('body-parser'); /*ist ein Httpmodul um json anfragen zu verarbeiten*/
var jsonParser = bodyParser.json();
 
var app = express();
 
var data=[
    {title: "Name"},
    {title: "Vorname"},
	{title: "Funktion"},
	{title: "Kontaktdaten"}
	]

	
app.get('/index', function(reg, res){
    res.status(200).json(data);
});

/*JSON.parse() parst einen JSON-String in ein JavaScript-Objekt, 
wobei dieser optional noch einmal umgewandelt werden kann*/ 

app.post('/index', jsonParser, function(req,res){
    data.push(req.body);
	res.type('plain').send('Es hat geklappt!');
})
 
app.get('/',function(reg, res){
    res.send('<h1>check.</h1>');
});
 
app.listen(3000, function(){
    console.log('Server laeuft auf port 3000.');
});