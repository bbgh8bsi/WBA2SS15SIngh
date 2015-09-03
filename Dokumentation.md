#Dokumentation

##Inhaltsverzeichnis
  * [Einleitung] (https://github.com/Mr-Kabelbruch/WBA2SS15SinghSchmiedebergMathesdorf/blob/master/Dokumentation.md#einleitung)
  * [Dokumentation des Service] (https://github.com/Mr-Kabelbruch/WBA2SS15SinghSchmiedebergMathesdorf/blob/master/Dokumentation.md#dokumentation-des-service)
   * User
   * Event
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
Im folgenden wird eine Webanwendung beschrieben, in dem Veranstalter eine Event (Name der Veranstaltung, Datum, Uhrzeit, Musikrichtung und Raumkapazitäten) bekannt machen kann und Frei Dienstleister wie Caterer, Sicherheit und Techniker, sich  für das event eintragen können.</br> 
Das wird über die webanwendung organisiert, der Vorteil ist es sind keine dritten Agenturen involviert. </br>

Ziel der Webanwendung ist es hauptsächlich organisationstechnische Fragen im vorraus zu klären und dem Veranstalter eine Liste mehrer qualifzierter Dienstleister zu erstellen und den Diestleister ein Plattform zu bieten, in dem sie die Veranstalter sofort ohne Umwege (Agenturen) anfragen können.

Jeder Nutzer hat sein eigenes Profil, dass ihn als einzelne Person, oder als Firma verkörpert. In dem Profil werden Obligatorische Daten wie Kontaktdaten und Rolle angezeigt. Jeder Akteur kann sich über die Startseite, in sein Account einloggen. 

Das System soll zudem, über eine Suche verfügen und einem Bewertungsystem, damit jeder erkennen kann wer z.b zuverlässig, gut bezahlt oder gut organisiert ist.

</br>

####Dokumentation des Service:</br>
  * Angabe der Ressourcen, der dafür vorgesehenen http Verben und deren Semantik 

    Es wurden folgende zwei Objekte generalisiert User und das Event.</br>
    
    ######User sowohl veranstalter als auch Dienstleister
    
    | Ressourcen        | Jeweilige Verb | Ressourccen Pfad | Content_typ (req)      | Content_typ (res)  |
    | -------------     |:-------------: | -----------------|----------------------  |-----------------   | 
    |Profil erstellen   | mit einem Post | /user            |                        |                    |
    |Profil ändern      | mit einem Put  | /user/:id        |                        |                    |
    |Profil anzeigen    | mit einem Get  | /user/:id        |                        |                    |
    |Profil löschen     |mit einem Delete| /user/:id        |                        |                    |
    |Alle Profil zeigen |mit einem Get   | /user            |                        |                    | 
    
    </br>
    
    ######Event welches nur von Veranstalter erstellt werden kann
    
    | Ressourcen       | Jeweilige Verb | Ressourccen Pfad                   |Content_typ (req)      | Content_typ (res)  |
    | -------------    |:-------------: | ---------------------------------  |---------------------- |-----------------   | 
    |Event erstellen   | mit einem Post | /user/:uid/event/                  |                       |                    |
    |Event ändern      | mit einem Put  | /user/:uid/event/:eid              |                       |                    |
    |Event löschen     |mit einem Delete| /veranstaltung/:veruserID/:EventID |                       |                    |
    |Event anzeigen    |mit einem get   | user/:uid/event/:eid               |                       |                    |
    |alle Events zeigen|mit einem get   | event                              |                       |                    |
     
     
    
    * Überlegungen die angestellt wurden zur Definition der Ressourcen, Alternativen die betrachtet wurden </br>
    
    Mit Hilfe eines Anwendungfalls, indem das Szenario eines Veranstalters der eine Event erstellen möchte durchgespielt wird, kann man die Ressourcen ausfindig machen. So entstehen die Ressourcen fast automatisch, indem gefragt wird welche Funktionen und Verben benötigt der Veranstalter um eine Veranstaltung zu erstellen. Die Funktionen Veranstaltung erstellen, Veranstaltung ändern, Veranstaltung anzeigen und veranstaltung löschen, werden über den User abgewickelt. Dann kann man die die Verben definiert siehe oben Tabelle [user](https://github.com/Mr-Kabelbruch/WBA2SS15SinghSchmiedebergMathesdorf/blob/master/Dokumentation.md#user).
     </br>
    Die Dienstleister und die veranstalter bekommen jeweils ein Profil, diese werden über die Ressource /user abgerufen. Die veranstalter und Dienstleister müssen eine Rolle angeben z.b {"Rolle":"Veranstalter"} die in der Datenbank unter user hinterlegt wird. Nach der Rolle wird gefiltert, wenn z.b ein Veranstalter ein Event ertellen möchte, macht er dies über die Ressource /user/:uid/event/. Es muss vorher sichergestellt sein, dass der Veranstalter auch ein Veranstalter ist, weil nur ein Veranstalter hat die rechte dazu ein Event zu erstellen. Das gleiche gilt für das löschen von eines Event nur das die Ressource etwas anders aufgebaut sind user/:uid/event/:eid.
    
    
    
    Der Dienstleister kann sich nur aus einem Event löschen, oder eintragen über die Ressource /user/:uid/event/:eid, a 
 
    

  * Beschreibung der Anwendungslogik und der Datenhaltung mit Überlegungen dazu </br>
 
    Es gibt eine Key User in diesen werden die Profile gespeichert und die jeweiligen gruppen. Es gibt noch einen Key der Event heist, in der werden die vom Veranstalter erzeugten Events gespeichert. 

  * Beschreibung der Funktionalität, die aus Zeitmangel nicht umgesetzt werden konnte </br>
  
    Suche, Bewertung, Nachrichten verschicken (Vermutlich)

####Dokumentation des Dienstnutzers:
  * Beschreibung der Anwendungslogik und der Datenhaltung mit Überlegungen dazu </br>
  * Umsetzung der Präsentationslogik und Überlegungen dazu </br>
  * ggfs. Beschreibung der asynchron implementierten Teile der Nutzungsschnittstelle und Begründungen dazu </br>
  * Beschreibung der Funktionalität, die aus Zeitmangel nicht umgesetzt werden konnte </br>

####Dokumentation des Prozesses:
  * Beschreibung der Vorgehensweise, auch der Irrwege </br>
  * Eine kritische Reflexion des Erreichten und des Nicht-Erreichten in einem Fazit </br>
  * Eine Arbeitsmatrix, aus der hervorgeht, wer im Team an welchen Aktivitäten zu welchem Grad (%) beteiligt war </br>

 
|               | Carolina Singh    | Florian Schmiedeberg| Robin Mathesdorf|**gesamt**|
|---------------|------------       | ------------------  |---------------- |----------|
|Idee & Projekt | 33%               | 33%                 | 33%             | **100%** |
|Layout         | 0 %               | 0%                  | 0%              | **0 %**  |
|Code           | 50%               | 0%                  | 50%             | **100%** |

