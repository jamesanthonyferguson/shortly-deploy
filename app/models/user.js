var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

// var User = db.Model.extend({
//   tableName: 'users',
//   hasTimestamps: true,
//   initialize: function(){
//     this.on('creating', this.hashPassword);
//   },
//   comparePassword: function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.get('password'), function(err, isMatch) {
//       callback(isMatch);
//     });
//   },
//   hashPassword: function(){
//     var cipher = Promise.promisify(bcrypt.hash);
//     return cipher(this.get('password'), null, null).bind(this)
//       .then(function(hash) {
//         this.set('password', hash);
//       });
//   }
// });

var userify = function(username, password){

  var hashed = bcrypt.hashSync(password,null);

  return new db.Users({
    username: username,
    password: hashed,
  });
};

var comparePassword = function(user,entryPassword,callback){
  db.Users.findOne({username:user}, function(err,result){
    if (err) {
      console.log('error accessing db');
    }
    console.log(result);
    console.log(result.password);
    bcrypt.compare(entryPassword, result.password, function(err,result){
      if (err) {
        console.log('Error comparing passwords',err);
      } else {
        console.log(result, "password compare result");
        callback(result);
      }
    });
  });
};


exports.userify = userify;
exports.comparePassword = comparePassword;



