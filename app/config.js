var options = {
  dev: 'mongodb://localhost/test',
  production: 'mongodb://MongoLab:57ATDZsN57ScOWD.ssUi7ZmL8DceZb7qolRngMP5QF0-@ds027758.mongolab.com:27758/MongoLab'
}

if (process.env.PORT) {
  var currentMongoPort = options.production;
} else {
  var currentMongoPort = options.dev;
}

var mongoose = require('mongoose');

mongoose.connect(currentMongoPort);


var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){

  var urlsSchema = mongoose.Schema({
    url: String,
    base_url: String,
    code: String,
    title: String,
    userID: String,
    visits: {type: Number, default: 0}
  });

  var usersSchema = mongoose.Schema({
    username: String,
    password: String
  });

  var Urls = mongoose.model('urls', urlsSchema);
  var Users = mongoose.model('users', usersSchema);
  exports.db = db;
  exports.Urls = Urls;
  exports.Users = Users;

});


