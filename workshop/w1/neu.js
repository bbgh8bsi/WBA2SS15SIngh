var fs = require ('fs'); /* reguier auslagern bzw laden der fs.readfile Funktion*/
var chalk = require('chalk');/*requier auslagern bzw. laden der chalk*/

/*die Module fs und chalk wurden installiert in node*/

/* Die Funktion fs.readFile(__dirname+"/dateiname", function(err, data) { ... }); ermöglicht das asynchrone Auslesen von Dateien.
Die Variable __dirname enthält den Namen des Verzeichnisses, in dem das aktuelle Programm liegt. Er wird in diesem Beispiel vor den Pfad angehängt, um eine vollständige Pfadangabe zu vermeiden.
Der Parameter data ist normalerweise ein Buffer mit Binärdaten, der mittels data.toString() in einen String umgewandelt werden kann. */

fs.readFile(__dirname+"/wolkenkratzer.json", function(err, data) {

if (err) throw err;
/**/
var obj = JSON.parse(data);
/*Konvertiert eine Zeichenfolge der JSON-Objekte (JavaScript-Objekt-Notation) in ein Objekt.*/
obj.wolkenkratzer.sort(function(a, b){
/*die objekte werden sotiert*/
return b.hoehe-a.hoehe});
/*und ausgegeben*/

fs.writeFile('wolkenkratzer_sortiert.json', JSON.stringify(obj),function(err){
/*neu Datei schreiben um sortiert auszugeben*/
if (err) throw err; 

/*farben werden vergeben*/
obj.wolkenkratzer.forEach(function(wk) {

console.log(chalk.blue('Name: '+wk.name));
console.log(chalk.red('stadt: '+wk.stadt));
console.log(chalk.yellow('hoehe: '+wk.hoehe));
console.log('------------------');

			});
		});
});

 