var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function(){
//     this.on('creating', function(model, attrs, options){
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

var linkify = function(url, title, base_url,userID){
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  var code = shasum.digest('hex').slice(0,5);
  console.log('I got this information',url,title,base_url,userID);
  return new db.Urls({
    url: url,
    code: code,
    title: title,
    base_url: base_url,
    userID:userID
  })
};

// var Link = mongoose.model('users', usersSchema);


// module.exports = Link;

exports.linkify = linkify;



