var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  db.Urls.findAll(function(err, models){
    res.send(200, models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  db.Urls.findOne({url:uri},function(error,found){

    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = Link.linkify(uri,title,req.headers.origin);

        link.save(function(err,linkSaved){
          if (err) {
            console.log('error saving link: ', err);
            res.redirect('/links');
          } else {
            console.log('link added to collection:', linkSaved);
            res.redirect('/links');
          }
        });
      });
    }

  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  db.Users.findOne({username:username},function(err,user){
    if(err){
      console.log('Error querying database',err);
      res.redirect('/login');
    }else if (user === null) {
      console.log('No such user');
      res.redirect('/signup');
    } else{
      console.log('passed the first hurdle', user);
      User.comparePassword(username, password, function(match){
        if(match){
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  db.Users.find({username:username}, function(err,user){
    if (!err && user[0]){
      console.log('Account already exists',user);
      res.redirect('/login');
    } else {
      console.log('creating new user')
      var newUser = User.userify(username, password);
      newUser.save(function(err,newUser){
        if (err) {
          console.log("user couldn't be saved", err);
        }
        util.createSession(req,res, newUser);
      });
    }
  });
};


exports.navToLink = function(req, res) {
  console.log(req.url, "IMPORTANT");
  var givenUrl = req.params[0];
  db.Urls.findOne({code:givenUrl},function(err,url){
    if(err){
      console.log('failed to find link', err);
      res.redirect('/');
    } else{
      console.log('the url is', url);
      db.Urls.update({
        url : url.url
      },{
        $set:{
          visits:url.visits + 1
        }
      });
      res.redirect(url.url);
    }
  });
};



//   new Link({ code: req.params[0] }).fetch().then(function(link) {
//     if (!link) {
//       res.redirect('/');
//     } else {
//       link.set({ visits: link.get('visits') + 1 })
//         .save()
//         .then(function() {
//           return res.redirect(link.get('url'));
//         });
//     }
//   });
// };
