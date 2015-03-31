var express        = require("express"),
    app            = express(),
    argv           = require('minimist')(process.argv.slice(2)),
    debug          = argv.debug || false,
    destination    = argv.d || argv.destination || 'http://127.0.0.1:9999',
    cookie         = argv.c || argv.cookie || '',
    port           = argv.p || argv.port || 9998,
    showHelp       = argv.h || argv.help || false,
    request        = require('request'),
    server         = require('http').createServer(app),
    FormUrlencoded = require('form-urlencoded')
    ;

printLogo();

if (showHelp) {
    printUsageAndExit();
}


if (debug) {
    var bodyParser = require('body-parser');

    // Body Parser
    // parse various different custom JSON types as JSON
    app.use(bodyParser.json({type: 'application/*+json'}));
    app.use(bodyParser.json({type: 'application/json'}));
    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({type: 'application/x-www-form-urlencoded', extended: true}));

    // parse an HTML body into a string
    app.use(bodyParser.text({type: 'text/html'}));
    app.use(bodyParser.text({type: 'text/plain'}));

    require('request-debug')(request);
}


/**
 * Anfragen umleiten und ggfs. erweitern
 */
app.use(function (req, res) {

    if (cookie !== '') {
        req = addCookieToRequest(req);
    }

    var url = getApiUrl(req);

    //console.log('url: ' + url);
    req.pipe(request(requestObjFromExpressReq(req, url),
        function (error, response, body) {
            if (error) {
                if (error.code === 'ECONNREFUSED') {
                    console.error('Refused connection');
                    res.status(500).send({
                        "error": "connection refused: " + url
                    });
                } else {
                    throw error;
                }
            }
        })).pipe(res);
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

server.listen(port);
console.log('Now listening at http://localhost:' + port + '/ forwarding requests to ' + destination);


/***************************
 * Helper Functions        *
 ***************************/

/**
 * Baut ein Config-Objekt zum Erstellen eines Requests mit dem Original-Express-Request als Vorbild
 *
 * @param req   express request object
 * @param url   destination url
 * @returns {{method: (req.method|*), uri: *, headers: (req.headers|*)}}
 */
function requestObjFromExpressReq(req, url) {
    var request = {
        method: req.method,
            uri: url,
        headers: req.headers,
    };

    switch (req.headers["content-type"]) {
        case 'application/json':
            request.body = req.body;
            request.json = true;
            break;
        case 'application/x-www-form-urlencoded':
            request.body = FormUrlencoded.encode(req.body);
            break;
        default:
            request.body = JSON.stringify(req.body);
    }

    return request;
}

/**
 * Fügt einem request ein Cookie hinzu
 *
 * @param req   express request object
 * @returns {*}
 */
function addCookieToRequest (req) {
    if (req.headers.cookie) {
        req.headers.cookie = req.headers.cookie + ';' + cookie;
    } else {
        req.headers.cookie = cookie;
    }

    return req;
}

/**
 * Liefert die Ziel-URL für einen Request
 *
 * @param req   express request object
 * @returns {*|string}
 */
function getApiUrl (req) {
    var path_elements = req.url.split('/'),
        url = destination;

    for (var i = 1, max = path_elements.length; i < max; i++) {
        url = url + '/' + path_elements[i];
    }

    return url;
}

/**
 * Liefert die Hilfe und beendet das Script
 */
function printUsageAndExit () {
    console.log("NAME");
    console.log("   debug_proxy");
    console.log("");
    console.log("SYNOPSIS");
    console.log("   node index.js <OPTIONS>");
    console.log("");
    console.log("DESCRIPTION");
    console.log("   Das Script lauscht auf dem gewünschten Port auf Verbindungen und leitet diese an das gewünschte Ziel weiter.");
    console.log("   In die Anfrage kann das Script ein Cookie einfügen welches z.B. den Debugger in PHPStorm triggert.");
    console.log("   Durch die Debug-Option kann man alle Anfragen und Antworten sehen die durch den Proxy laufen und diese in eine Datei schreiben lassen.");
    console.log("");
    console.log("OPTIONS");
    console.log("   --debug");
    console.log("       Gibt sämtliche Requests/Responses auf der Console aus, die über den Proxy laufen.");
    console.log("");
    console.log("   -d or --destination");
    console.log("       Das Ziel an das die Anfragen weitergeleitet werden. Default: http://127.0.0.1:9999");
    console.log("");
    console.log("   -p or --port");
    console.log("       Der Port auf dem der Proxy auf neue Verbindungen lauscht. Default: 9998");
    console.log("");
    console.log("   -c or --cookie");
    console.log("       Der Cookie der in der Anfrage ergänzt werden soll.");
    console.log("       Um das Debugging in PHPStorm zu starten ist ein Cookie mit dem Namen 'XDEBUG_SESSION' nötig.");
    console.log("       Der Wert den das Cookie haben muss (z.B. 'PHPSTORM') muss man in PHPStorm einstellen.");
    console.log("          File -> Settings -> PHP -> Debug -> DBGp Proxy -> IDE Key");
    console.log("");
    console.log("   -h or --help");
    console.log("       Zeigt diese Hilfe an :)");
    console.log("");
    console.log("EXAMPLES");
    console.log("       node index.js --debug -d http://127.0.0.1:8080 -p 9998 -c 'XDEBUG_SESSION=PHPSTORM'");

    process.exit(0);
}

/**
 * Ausgabe des Logos
 */
function printLogo () {

    console.log('________  _____________________ ____ ___  ________    ____________________ ________  ____  ________.___.');
    console.log('\\______ \\ \\_   _____/\\______   \\    |   \\/  _____/    \\______   \\______   \\\\_____  \\ \\   \\/  /\\__  |   |');
    console.log(' |    |  \\ |    __)_  |    |  _/    |   /   \\  ___     |     ___/|       _/ /   |   \\ \\     /  /   |   |');
    console.log(' |    `   \\|        \\ |    |   \\    |  /\\    \\_\\  \\    |    |    |    |   \\/    |    \\/     \\  \\____   |');
    console.log('/_______  /_______  / |______  /______/  \\______  /____|____|    |____|_  /\\_______  /___/\\  \\ / ______|');
    console.log('        \\/        \\/         \\/                 \\/_____/                \\/         \\/      \\_/ \\/');

}