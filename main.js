var Handlebars = require('handlebars'),
	path =  require('path'),
    fs = require('fs'),
    request = require('request')
    _ = require('underscore'),
    Q = require('q');


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

releaseTestResults().then(function (data) {

	console.log(template({teams: data }));

}).fail(function (err) {
	console.log(err);
});


function testCaseResultsPerTeam() {
	var result = [];

	result.push({
		name: 'API',
		status: 'ok',
		total: 10,
		passed: 50,
		failed: 5,
		inProgress: 6,
		notRun: 28
	});
	result.push({
		name: 'Cloudhub',
		status: 'ok',
		total: 103,
		passed: 54,
		failed: 5,
		inProgress: 6,
		notRun: 28
	});
	result.push({
		name: 'Connectors',
		status: 'failed',
		total: 10,
		passed: 50,
		failed: 5,
		inProgress: 6,
		notRun: 28
	});


	return result;
}


function releaseTestResults(){
	var prequest = Q.denodeify(request);

	return prequest('http://tcm-backend.cloudhub.io/metricsExecutedRls?rlsId=60', {json:true}).spread(function (response, body) {
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