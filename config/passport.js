const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

//adaptation of the passport code from the passport js community

// Load User model
const User = require("../models/users");

module.exports = function(passport) { //exporting function passport to be used for user login
    passport.use(
        new localStrategy((username, password, done) => {
            // Match user by username, email can be the same for 2 or more users
            User.findOne({ username: username }).then(user => {
                if (!user) { // if there is no username, then register first
                    return done(null, false,
                        console.log("user not registered"));
                }
                console.log("user found! ");
                // Match password, comparing using brcypt compare
                var pwdcheck = bcrypt.compare(password, user.password, function(err, match) {
                    if (err) throw err;
                    if (!match) {
                        return done(null, false,
                            console.log("passowrd not correct"));
                    } else {
                        return done(null, user),
                            console.log("user " + user + " successfully logged in and redirected ");
                    }
                });
                console.log("pwdcheck returns " + pwdcheck),
                    // serialization and deserialization from passport docs
                    passport.serializeUser(function(user, done) {
                        done(null, user.id);
                        console.log("user serialized as per passport specs with user id = " + user.id)
                    });
                passport.deserializeUser(function(id, done) {
                    User.findById(id, function(err, user) {
                        done(err, user);
                        //console.log("user deserialized as per passport specs for user " + user);
                    })
                });
            });
        }));
};