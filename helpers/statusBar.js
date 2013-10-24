var Handlebars = require('handlebars');

module.exports = function (data) {

		var propgressBar = '<div class="progress">'
		var cellWidth = 100 / parseInt(data.total);
		
var passed = (data.passed * 100) / parseInt(data.total);
var blocked = (data.blocked) * 100 / parseInt(data.total);
var failed = (data.failed) * 100 / parseInt(data.total);
var inprogress = (data.inprogress) * 100 / parseInt(data.total);
var notrun = (data.notrun) * 100 / parseInt(data.total);


		// for(var i=0; i<parseInt(data.passed);i++){
            propgressBar += '<div class="bar bar-success" style="width: '+passed+'%;"></div>'
        // }
        
        // for(var i=0; i<parseInt(data.blocked);i++){
            propgressBar += '<div class="bar bar-warning" style="width: '+blocked+'%;"></div>'
        // }
        // for(var i=0; i<parseInt(data.failed);i++){
            propgressBar += '<div class="bar bar-danger" style="width: '+failed+'%;"></div>'
        // }
        // for(var i=0; i<parseInt(data.inprogress);i++){
            propgressBar += '<div class="bar bar-info" style="width: '+inprogress+'%;"></div>'
        // }
        // for(var i=0; i<parseInt(data.notrun);i++){
            propgressBar += '<div class="bar bar-notrun" style="width: '+notrun+'%;"></div>'
        // }

		propgressBar += '</div>'

	return new Handlebars.SafeString(propgressBar);	
};