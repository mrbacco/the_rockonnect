//creating a function to use for protected pages that I can call anytime I need
// exporting a module to ensure users are authenticated to view pages that require authentication

module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.status(401).send('Please log in to view that resource');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/forum_add');      
  }
};



/* original code from BAC to login the user without using passport

var {
        username,
        password
    } = req.body; //deconstructing again!!!
    User.findOne({
            username: username,
        },
        'username password',
        function(err, userBody) {
            if (!err) {
                var pwdcheck = bcrypt.compareSync(password, userBody.password); //decrypt
                password;
                if (pwdcheck) {
                    console.log( 
                        'pwdcheck returns ' +pwdcheck +' ... inserted is ' +userBody.password +' retrieved is ' +password
                    );
                    console.log(
                        'successfully logged in, ' + username + ' under the chat page now '
                    );
                    
                    //req.session.user = {
                    //    username: userBody.username,
                    //    password: userBody.password,
                    //};
                    //req.session.user.expires = new Date(Date.now() + 24 * 3600 * 60 * 1000); //giving a session duration for the user
                    //console.log('session active for user ' + username);
                    
                   res.render('chat');
                  } else {
                      res.status(401).send(' invalid password ' + username);
                  }
              } else {
                  res.status(401).send(' invalid credentials 2 ' + username);
              }
          }
      );
    var localS = require('passport-local').Strategy;
    passport.use(new localS(function(username, password, done) {
    User.findOne({username:username}, function (err, user) {
        if (err) { return done(err);}
        if (!user){
            return done(null, false, console.log("wrong udername"), res.send(400))
        }
        if(!user.validPassword(password)){
            return done(null, false, console.log("wrong udername"), res.send(400))
        }
        return done(null, user);
    });
    }));

  */

 