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
  var username = req.session.user;
  db.Users.findOne({username:username},function(error,found){
    if(error){
      console.log('Error finding your user for your fetching function',error)
    }else{
      var id = found._id;
      db.Urls.find({userID:id},function(err, models){
        if (err) {
          console.log('error getting your links from db', err);
          res.redirect('/')
        } else  {
          console.log('got your links dawg', models);
          res.send(200,models);
        }
      });      
    }
  })

};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  var user = req.session.user,id = 'Pending'

  db.Users.findOne({username:user},function(error,found){
    if(error){
      console.log('Error finding the current user',error);
    }else{
      id = found._id;
      console.log('Current ID is ', id);
      db.Urls.findOne({url:uri,userID:id},function(error,found){

        if (found) {
          res.send(200, found.attributes);
        } else {
          util.getUrlTitle(uri, function(err, title) {
            if (err) {
              console.log('Error reading URL heading: ', err);
              return res.send(404);
            }

            var link = Link.linkify(uri,title,req.headers.origin,id);

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
      }
    )
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
      console.log('User id is ',user._id);
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
  var givenUrl = req.params[0];
  db.Urls.findOne({code:givenUrl},function(err,url){
    if(err){
      console.log('failed to find link', err);
      res.redirect('/');
    } else{
      console.log('the url is', url);
      if (url !== null) {
        console.log('through the first hurdle!')
        console.log('current url visits', url.visits)
        var newVisits = url.visits +1
        console.log('new number:', newVisits)
        db.Urls.update({
          url : url.url
        },{
            visits: newVisits
        }, null, function(){
          res.redirect(url.url); 
        });
      }
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
