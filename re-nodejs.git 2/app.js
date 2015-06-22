// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express');
var https = require('https');
var url = require('url');
var querystring = require('querystring');
var xmlescape = require('xml-escape');

// setup middleware
var app = express();
app.use(express.errorHandler());
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(app.router);

app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

main = require('./routes/main')

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// defaults for dev outside bluemix
var service_url = 'https://gateway.watsonplatform.net/relationship-extraction-beta/api';
var service_username = '718eb92f-a874-4f3d-9ee1-248ba08692fd';
var service_password = 'C0faRjAwX0Dp';

Date.prototype.lessHours= function(h){
    this.setHours(this.getHours()-h);
    return this;
}

function httpGetTwitterSentiment(latitude,longitude)
{
    
    url = "https://iipbeta.digitalglobe.com/monocle-3/app/broker/sma/sma/rss/sentences?bbox=-" + latitude + "," + longitude + "&datetimerange=" + Date()+ "," + new Date().lessHours(4) + "&dimensions=topten"
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function getGeoJSON(url)
{
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function nltkServer(url1,url2,url3) {

  url = "http://localhost:8080/nltk?url_one=" + url1 + "&url2=" + url2 + "&url3=" + url3;
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false );
  xmlHttp.send( null );
  return xmlHttp.responseText;

}

function equilibrate() {

  leverage1 = httpGetTwitterSentiment(req.body.latitude,req.body.longitude);
  leverage2 = getGeoJSON("http://opendata.arcgis.com/datasets/267b6c8cdee749bf90bb2737d9e07fc8_0.geojson");
  leverage3 = getGeoJSON("http://opendata.arcgis.com/datasets/9a080c2c001e48e0af2ab8d629cf982f_0.geojson");
  nltkServer(leverage1,leverage2,leverage3);

}

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
if (process.env.VCAP_SERVICES) {
  console.log('Parsing VCAP_SERVICES');
  var services = JSON.parse(process.env.VCAP_SERVICES);
  //service name, check the VCAP_SERVICES in bluemix to get the name of the services you have
  var service_name = 'relationship_extraction';
  
  if (services[service_name]) {
    var svc = services[service_name][0].credentials;
    service_url = svc.url;
    service_username = svc.username;
    service_password = svc.password;
  } else {
    console.log('The service '+service_name+' is not in the VCAP_SERVICES, did you forget to bind it?');
  }

} else {
  console.log('No VCAP_SERVICEX found in ENV, using defaults for local development');
}

console.log('service_url = ' + service_url);
console.log('service_username = ' + service_username);
console.log('service_password = ' + new Array(service_password.length).join("X"));

var auth = 'Basic ' + new Buffer(service_username + ':' + service_password).toString('base64');

// render index page
app.get('/', function(req, res){

    console.log(req.param('url'));
    res.render('index');
});

// render index page
app.get('/main', function(req, res){
    equilibrate()
    res.render('main');
});

// Handle the form POST containing the text to identify with Watson and reply with the language
app.post('/', function(req, res){

  var parts = url.parse(service_url);

  // create the request options from our form to POST to Watson
  var options = { 
    host: parts.hostname,
    port: parts.port,
    path: parts.pathname,
    method: 'POST',
    headers: {
      'Content-Type'  :'application/x-www-form-urlencoded',
      'X-synctimeout' : '30',
      'Authorization' :  auth }
  };

  // Create a request to POST to Watson
  var watson_req = https.request(options, function(result) {
    result.setEncoding('utf-8');
    var resp_string = '';

    result.on("data", function(chunk) {
      resp_string += chunk;
    });

    result.on('end', function() {
      console.log(resp_string);
      //res.writeHead( 200, resp_string, {'content-type' : 'text/plain'});
      return res.render('index',{'xml':xmlescape(resp_string), 'text':req.body.txt});
      //return res.render('index',{'xml':xmlescape(resp_string), 'text':req.body.txt})
    })

  });

  watson_req.on('error', function(e) {
    return res.render('index', {'error':e.message})
  });

  // Whire the form data to the service
  watson_req.write(querystring.stringify(req.body));
  watson_req.end();
});


// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);