var User = require('../models/user');

var mongoose = require('mongoose');

var config = require('../config/all');

mongoose.connect('localhost:27017/shopping');


var newUser = new User();
newUser.email = config.defaultAdmin.email;
newUser.password = newUser.encryptPassword(config.defaultAdmin.password);
newUser.save(function(err, result) {
  mongoose.disconnect();
});