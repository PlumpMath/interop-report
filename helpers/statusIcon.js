var Handlebars = require('handlebars');

module.exports = function (data) {
	return new Handlebars.SafeString('<div class="status-light success"></div>');	
};