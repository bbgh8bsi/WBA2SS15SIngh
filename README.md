#Dokumentation

##Inhaltsverzeichnis
  * [Einleitung] (https://github.com/Mr-Kabelbruch/WBA2SS15SinghSchmiedebergMathesdorf/blob/master/Dokumentation.md#einleitung)
  * [Dokumentation des Service] (https://github.com/Mr-Kabelbruch/WBA2SS15SinghSchmiedebergMathesdorf/blob/master/Dokumentation.md#dokumentation-des-service)
   * Angabe der Ressourcen, der dafür vorgesehenen http Verben und deren Semantik
   * Überlegungen die angestellt wurden zur Definition der Ressourcen, Alternativen die betrachtet wurden
   * Beschreibung der Anwendungslogik und der Datenhaltung mit Überlegungen dazu
   * Beschreibung der Funktionalität, die aus Zeitmangel nicht umgesetzt werden konnte
  * [Dokumentation des Dienstnutzers] (https://github.com/Mr-Kabelbruch/WBA2SS15SinghSchmiedebergMathesdorf/blob/master/Dokumentation.md#dokumentation-des-dienstnutzers)
   * Beschreibung der Anwendungslogik und der Datenhaltung mit Überlegungen dazu
   * Umsetzung der Präsentationslogik und Überlegungen dazu
   * ggfs. Beschreibung der asynchron implementierten Teile der Nutzungsschnittstelle und Begründungen dazu
   * Beschreibung der Funktionalität, die aus Zeitmangel nicht umgesetzt werden konnte
  * [Dokumentation des Prozesses] (https://github.com/Mr-Kabelbruch/WBA2SS15SinghSchmiedebergMathesdorf/blob/master/Dokumentation.md#dokumentation-des-prozesses)
   * Beschreibung der Vorgehensweise, auch der Irrwege
   * Eine kritische Reflexion des Erreichten und des Nicht-Erreichten in einem Fazit
   * Eine Arbeitsmatrix, aus der hervorgeht, wer im Team an welchen Aktivitäten zu welchem Grad (%) beteiligt war


####Einleitung
Im folgenden wird eine Webanwendung beschrieben, in dem Veranstalter eine Event bekannt machen kann und frei Dienstleister wie Caterer, Sicherheit und Techniker, usw. sich  für das event eintragen können.</br> 
Die Vorteile dies als eine Webanwendung zu organisieren sind es werden keine dritten Agenturen involviert und man hat am Ende eine Liste mit zuverlässigen Personal, die bei gelegenheit wieder für ein Veranstalter arbeiten kann. </br>

Ziel der Webanwendung ist es hauptsächlich organisationstechnische Fragen im vorraus zu klären und dem Veranstalter eine Liste mehrer qualifzierter Dienstleister zu erstellen und den Diestleister ein Plattform zu bieten, in dem sie die Veranstalter sofort ohne Umwege (Agenturen) anfragen können.

Jeder Nutzer hat sein eigenes Profil, dass ihn als einzelne Person, oder als Firma verkörpert. In dem Profil werden Obligatorische Daten wie Kontaktdaten und Rolle angezeigt, sowie Qualifikationen. Jeder Akteur kann sich über die Startseite, in sein Account einloggen. 

Das System soll zudem, über eine Suche verfügen und einem Bewertungsystem, damit jeder erkennen kann wer z.b zuverlässig, gut bezahlt oder gut organisiert ist.

</br>

####Dokumentation des Service:</br>
  * Angabe der Ressourcen, der dafür vorgesehenen http Verben und deren Semantik 

    Es wurden folgende zwei Objekte generalisiert User und das Event.</br>
    
    ######User sowohl veranstalter als auch Dienstleister
    
    | Ressourcen        | Jeweilige Verb | Ressourccen Pfad | Content_typ (req)      | Content_typ (res)  |
    | -------------     |:-------------: | -----------------|----------------------  |-----------------   | 
    |Profil erstellen   | mit einem Post | /user            | application/json       | empty              |
    |Profil ändern      | mit einem Put  | /user/:id        | application/json       | empty              |
    |Profil anzeigen    | mit einem Get  | /user/:id        | application/json       | application/json   |
    |Profil löschen     |mit einem Delete| /user/:id        | application/json       | empty              |
    |Alle Profil zeigen |mit einem Get   | /user            | application/json       | application/json   | 
    
    </br>
    
    ######Event welches nur von Veranstalter erstellt werden kann
    
    | Ressourcen       | Jeweilige Verb | Ressourccen Pfad                   |Content_typ (req)      | Content_typ (res)  |
    | -------------    |:-------------: | ---------------------------------  |---------------------- |-----------------   | 
    |Event erstellen   | mit einem Post | /user/:uid/event/                  |  application/json     | empty              |
    |Event ändern      | mit einem Put  | /user/:uid/event/:eid              |  application/json     | empty              |
    |Event löschen     |mit einem Delete| /user/:uid/event/:eid              |  application/json     | empty              |
    |Event anzeigen    |mit einem get   | /user/:uid/event/:eid              |  application/json     | application/json   |
    |alle Events zeigen|mit einem get   | /user/:uid/event                   |  application/json     | application/json   |
     
    ######Favorietenliste
    
    | Ressourcen       | Jeweilige Verb | Ressourccen Pfad                   |Content_typ (req)      | Content_typ (res)  |
    | -------------    |:-------------: | ---------------------------------  |---------------------- |-----------------   | 
    |fav hinzufügen    | mit einem Put  | /user/:uid/fav/:fid                |   application/json    | empty              |
    |fav   löschen     |mit einem Delete| /user/:uid/fav/:fid                |   application/json    | empty              |
    
    
    * Überlegungen die angestellt wurden zur Definition der Ressourcen, Alternativen die betrachtet wurden 
    </br>
    
    Es wurde festgestellt, dass ein Veranstalter und der Dienstleister jeweils Ressourcen sind, allerdings aus der
    realen Welt, die sich im System als Profile wieder finden. Aus den Profilen heraus werden die Rollen in  Veranstalter und
    Dienstleister raus selektiert, um die verschieden Authentifizierungen zu ermöglichen, die jede Rolle mit sich bringt z.b
    {"Rolle":"Veranstalter"} die in der Datenbank unter User hinterlegt wird. Nach der Rolle wird gefiltert, wenn z.b ein
    Veranstalter ein Event erstellen möchte, macht er dies über die Ressource /user/:uid/event/. Es muss vorher
    sichergestellt sein, dass der User auch ein Veranstalter ist, weil nur dieser das Recht ein
    Event zu erstellen. Das gleiche gilt für das löschen von eines Events, nur das die Ressource etwas anders aufgebaut sind
    user/:uid/event/:eid.</br>
    
    
    Daraus können wiederrum Subressourcen entstehen. Der Veranstalter Erstellt ein Event und in dem können sich die
    Dienstleister eintragen, somit ist das Event die Subressource des Veranstalters, aber auch des Dienstleisters den dieser
    kann sich in ein Event eintragen.</br> 
    
    
    In dem man sich in ein Event einträgt wird eine Listenressource erstellt aus der man dann später alle z.b Köche die sich
    für das jeweilige Event eingetragen haben auflisten kann und somit auf eine Vielzahl qualifizierter Mitarbeiter zugreifen
    kann.</br>
    Die Überlegung war welche Entitäten werden benötigt um am Ende eine Liste mit guten Personal zu bekommen und generell
    eine Auflistung von allen Events.
    
    * Beschreibung der Anwendungslogik und der Datenhaltung mit Überlegungen dazu </br>
 
    Über die Anwendungslogik kann man Profile erstellen, abrufen,  verändern,  löschen und alle Profile abrufen, das wäre die
    Basis. Man kann unter anderem Event erstellen, abrufen,  verändern,  löschen und alle Events abrufen. Allerdings können,
    wie zuvor schon erwähnt, nur die Veranstalter ein Event erstellen und löschen. Der Dienstleister kann sich dagegen für   
    das jeweilige Event ein- und austragen. Während ein einzelnes Event beide Rollen sehen können, wird bei der Funktion
    “alle Events anzeigen” dem Veranstalter nur seine eigenen Events angezeigt, damit er diese besser verwalten kann und dem
    Dienstleister alle Events, damit er sich auch dort eintragen kann.
    
    Des Weiteren soll der User,  in dem Fall Veranstalter und Dienstleister in der Lange
    sein eine Favoritenliste zu erstellen und z.b ein besonders guter Mitarbeiter wird darauf gesetzt, damit in Zukunft
    wieder mit diesem gearbeitet werden kann. Das gleiche Prinzip gilt für die Dienstleister die gute Veranstalter auf ihre
    Liste setzen können. So kann man nach und nach ein Netzwerk aufbauen.
    Die Anwendungslogik wird sowohl wom Dienstgeber als auch vom Dienstnehmer benutzt.
    
    Die User bekommen eine Datensatz, in dem sowohl eine eindeutige id vergeben wird, als auch Vorname, Nachname,
    Evnets(damit der Veranstalter direkt auf seine erstellten Events zurgreifen kann ) und
    Rolle gespeichert wird und man kann mit der jeweiligen rolle verschiedene Funktionen ausführen. 
    Wie schon erwähnt hat die Rolle Veranstalter, das recht ein Event zu erstellen und zu löschen, während der Dienstleister
    nur das recht hat sich ein und auszutragen.
    Das Event bekommt ein Datensatz mit den Inhalt: Id, Name, Datum, Info, Veranstalte r(um den Veranstalter zuordnen zu
    können) und Dienstleister (der die eingetragenen Dienstleister enthält).</br>
    
    
    Für die Datenstruktur wurde wie gefordert Redis-Datenbank verwendet,welche mit dem "redis" Modul angebunden wurde.
    Die oben genannten Datensätze sind obligatorisch. Es können optional auch noch andere Daten für die User verwendet werden
    wie Qualifikation, Ort, Erfahrung, Alter, usw. Das gleiche gilt auch für  das Event, da wären Optional Raumkapazität, Art
    der Veranstaltung, Musikrichtung, Ort.


  * Beschreibung der Funktionalität, die aus Zeitmangel nicht umgesetzt werden konnte </br>
  
    Die Favoritenliste, Suche, Bewertung und Nachrichten verschicken konnten leider nicht realisiert werden.
    Die Dienstleister sollten eine Listenressource erstellt in dem hervorgeht für welche Event sie sich eingetragen haben.

####Dokumentation des Dienstnutzers:
  * Beschreibung der Anwendungslogik und der Datenhaltung mit Überlegungen dazu </br>
    
    In der Dienstnutzer-Anwendung der capp.js, kann man neue Benutzer erstellen und muss dazu ein Dokument ausfüllen und
    Stammdaten angeben wie Vorname, Nachname und Rolle, diese werden dann an den Dienstnehmer gesendet, der wiederum diese in
    die Datenbank übertragen und gespeichert. 
    
    Der User kann sich einloggen, dass wird so dargestellt, dass der User aus einer Liste aller angelegten Profilen, einen
    auswählt kann, mit der er siche dann einloggt. Wenn ein Veranstalter sich eingeloggt hat, bekommt dieser eine Auflistung
    seiner Events und hat die MÖglichkeit sich ein erstelltes Event anzeigen zu lassen, oder ein neues zu
    erstellen. Beim Erstellen eines Events muss der Name des Events,das Datum und Infos zum Event in einem Dokument  
    ausgefüllt werden.Sobald die Daten in der Datenbank sind und das Event ertellt wurde steht dieses ebenfalls in der Liste
    der selbsterstellten Events des Veranstalters.
    
    Wenn ein Dienstleister sich einloggt, bekommt er eine liste aller events die es gibt. Er kann sich dort dann per klick
    auf “Auswählen” ein Event anzeigen lassen und enthält dort dann die eingetragenen Informationen zum Event und eine
    Auflistung von eingetragenen Dienstleistern. Auf dieser Seite kann er sich ebenfalls für das Event ein- und austragen
    
    
  * Umsetzung der Präsentationslogik und Überlegungen dazu </br>
    
    Die Präsentationslogik des Dienstnehmers stellt die Informationen in HTML und mit der Template-Engin ejs dar.
    
  * Beschreibung der Funktionalität, die aus Zeitmangel nicht umgesetzt werden konnte </br>
    
    Die Favoritenliste und Benutzerverwaltung wurden nicht realiesiert, stattdessen wird mit einer Liste gearbeitet auf den
    alle User aufgelistet sind, dafür werden werder Benutzername noch passwöter benutzt. Die Profile von den Nutzern dienen 
    zur veranschaulichung der Funktionen.
    

####Dokumentation des Prozesses:
    
  * Eine kritische Reflexion des Erreichten und des Nicht-Erreichten in einem Fazit </br>
    
    Node.js ist noch eine relativ junges Framework, was die Arbeit mit diesem interessant gestaltet hat. Leider gibt es bei
    Problemen, wie etwas dort abläuft im Internet noch recht wenig aussagekräftige Hilfe. Ebenfalls hat die Umstellung von
    relationale Datenbanken zu NoSQL einiges Kopfzerbrechen gemacht.
    Es gab vorallem Probleme bei der Umsetzung der Anwendungslogik in Verbindung mit der Präsentationslogik. 
    
    




