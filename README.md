#debug_proxy

##Installation
Das Tool benötigt ein installiertes node.js (http://nodejs.org/).  
Nach dem Checkout/Cloning müssen die nötigen node-Module installiert werden:    

        $ git clone <url_for_resources_repo>    
        $ cd tools/debug_proxy    
        $ npm install  

##Benutzung
###SYNOPSIS
        node index.js <OPTIONS>

###DESCRIPTION
        Das Script lauscht auf dem gewünschten Port auf Verbindungen und leitet diese an das gewünschte Ziel weiter.
        In die Anfrage kann das Script ein Cookie einfügen welches z.B. den Debugger in PHPStorm triggert.
        Durch die Debug-Option kann man alle Anfragen und Antworten sehen die durch den Proxy laufen und diese in eine Datei schreiben lassen.

###OPTIONS
        --debug
            Gibt sämtliche Requests/Responses auf der Console aus, die über den Proxy laufen.

        -d or --destination
            Das Ziel an das die Anfragen weitergeleitet werden. Default: http://127.0.0.1:9999

        -p or --port
            Der Port auf dem der Proxy auf neue Verbindungen lauscht. Default: 9998
        
        -c or --cookie
            Der Cookie der in der Anfrage ergänzt werden soll.
            Um das Debugging in PHPStorm zu starten ist ein Cookie mit dem Namen "XDEBUG_SESSION" nötig.
            Der Wert den das Cookie haben muss (z.B. "PHPSTORM") muss man in PHPStorm einstellen.
               File -> Settings -> PHP -> Debug -> DBGp Proxy -> IDE Key
        
        -h or --help
            Zeigt diese Hilfe an :)
            
###EXAMPLES
        node index.js --debug -d http://127.0.0.1:8080 -p 9998 -c "XDEBUG_SESSION=PHPSTORM"
        