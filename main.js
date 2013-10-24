var Handlebars = require('handlebars'),
	path =  require('path'),
    fs = require('fs'),
    request = require('request')
    _ = require('underscore'),
    http = require('http'),
    express = require('express'),
    Q = require('q');
    var mysql      = require('mysql');
	var db_config = {
	  host     : 'dummy.amazonaws.com',
	  user     : 'root',
	  password : 'dummy',
	  database : 'dummy'
	};
	var juice = require('juice');
	

var nodemailer = require("nodemailer");
var transport = nodemailer.createTransport("SMTP", {
    host: "smtp.gmail.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "sebastian.gramano@mulesoft.com",
        pass: "dummy"
    }
});


var app = express();

//app.set('port', process.env.PORT || 9000);
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(express.methodOverride());
//app.use(express.static(__dirname + '/static'));



var partialsDir = __dirname + '/partials';
var partials = fs.readdirSync(partialsDir);
partials.forEach(function (name) {
	Handlebars.registerPartial(path.basename(name, '.hbs'), 
		fs.readFileSync(path.resolve(partialsDir, name), 'UTF8'));
});

var helpers = fs.readdirSync(__dirname + '/helpers');
helpers.forEach(function (name) {
	Handlebars.registerHelper(path.basename(name, '.js'), require('./helpers/' + name));
});


var template = Handlebars.compile(fs.readFileSync('template.hbs', 'UTF8'));

app.get('/build', function (req, res) {

	var rlsId = req.query.rlsId

	teamsTestResults(rlsId, function(err,rows, fields){
		
		connection.end();

		releaseTestResults(rlsId).then(function (data) {

			res.set('Content-Type', 'text/html');

			data.push(rows[0])

			var htmlMessage = new Handlebars.SafeString(template({rls: data, teams: data[1] }));
			//var htmlMessage = template({rls: data, teams: data[1] });
			juice.juiceContent(htmlMessage,{url:'http://'},function(err, html) {

				var mailOptions = {
				    from: "some", // sender address
				    to: "qa-leads@mulesoft.com",//"sebastian.gramano@mulesoft.com", // list of receivers
				    subject: "Hello", // Subject line
				    // text: texto, // plaintext body
				    html: html // html body
				}

				// send mail with defined transport object
				transport.sendMail(mailOptions, function(error, response){
				    if(error){
				        console.log(error);
				    }else{
				        console.log("Message sent: " + response.message);
				    }
				});
				// res.send(new Buffer(html));

			});



// var mailOptions = {
//     from: "some", // sender address
//     to: "sebastian.gramano@mulesoft.com", // list of receivers
//     subject: "Hello", // Subject line
//     // text: "Hello world", // plaintext body
//     html: inlinedcss // html body
// }

// // send mail with defined transport object
// transport.sendMail(mailOptions, function(error, response){
//     if(error){
//         console.log(error);
//     }else{
//         console.log("Message sent: " + response.message);
//     }
// });


			res.send(new Buffer(template({rls: data, teams: data[1] })));

		}).fail(function (err) {
			console.log(err);
		});
		
	})
});

function teamsTestResults(rlsId, callback){

		
		connection = mysql.createConnection(db_config);
		connection.connect();

		connection.query('call tcm.interopTeams('+rlsId+')', callback);

}

function releaseTestResults(rlsId){
	var prequest = Q.denodeify(request);

	return prequest('http://tcm-backend.cloudhub.io/metricsExecutedRls?rlsId=' + rlsId, {json:true}).spread(function (response, body) {
		var results = [];
    
        if (response.statusCode == 200) {

            var chartData = new Array();
            var rlsOveral = {
            	name: body[0].iterName,
            }

            delete body[0]['iterName'];
            var totala = 0

            _.each(body[0], function(value, key, list){
                chartData.push(new Array( key, value));
                totala += value
            });

            rlsOveral.inprogress = chartData[1][1]
            rlsOveral.notrun = chartData[0][1]
            rlsOveral.blocked = chartData[4][1]
            rlsOveral.failed = chartData[3][1]
            rlsOveral.passed = chartData[2][1]
            rlsOveral.total = totala

            results.push(rlsOveral);

        }
    	return results;
    });
}





console.log('Express running at 8080')
app.listen(8080)




// var email   = require("emailjs");
// var server  = email.server.connect({
//    user:    "sebastian.gramano", 
//    password:"Ibanez17", 
//    host:    "smtp.gmail.com", 
//    ssl:     true
// });

			// console.log(htmlMessage)emailjs
			// var message = {
			//    text:    "i hope this works", 
			//    from:    "InteropReports", 
			//    to:      "sebastian.gramano@mulesoft.com",
			//    // cc:      "else <else@gmail.com>",
			//    subject: "testing emailjs",
			//    attachment: 
			//    [
			//       {data:html, alternative:true}
			//    ]
			// };

			// // send the message and get a callback with an error or details of the message that was sent
			// server.send(message, function(err, message) { console.log("Email Sent.") });