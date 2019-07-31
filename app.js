/* 
NCI final project:  Higher Diploma in Science in Web technologies
Author:             ANDREA BACCOLINI
Student number:     18147518
Student email:      x18147518@student.ncirl.ie
*/
// definition of the constants to use in the main "app" which is the server side
const express = require("express");
const jwt = require("jsonwebtoken"); //used only if enabling the session by jsonwebtoken
const app = express(); //initialization of the application definition of the constant app
const mongo = require('mongodb'); // constant for the database 
const path = require("path");
const mongoose = require("mongoose"); // constant for the database 
const bcrypt = require("bcryptjs"); // constant for the password encryption
const flash = require("connect-flash"); //for messages
const router = express.Router(); //actual web server
const fs = require('fs'); //filesystem
const bodyParser = require("body-parser");
const multer = require("multer");
const GStorage = require("multer-gridfs-storage");
const GStream = require("gridfs-stream");
const mOver = require("method-override");
const session = require("express-session");
const validator = require("express-validator"); //for session validation
const cookiep = require("cookie-parser");
const passport = require("passport");
const socketIO = require('socket.io');

//var pop = require("popups"); // for message on the UI
require("./config/passport")(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); //body parser middleware
app.use(passport.initialize()); //passport middleware
app.use(cookiep());
app.use(mOver("_method")); //using query string to create the form for delete

app.use(session({ // using session for passport middleware
    secret: "supersecretsecret", // secret for session cookies
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//########### DB stuff START ###########
const conn = require('./config/dbase').mongoURI;
mongoose.connect(conn, { useNewUrlParser: true })
    .then(() => console.log("conncetion to " + db + " established"))
    .catch(err => console.log(err));

//########### DB stuff end ###########

//loading models for the two main pages, users, threads and friends
var User = require("./models/users");
var Thread = require("./models/threads");
var Friend = require("./models/friends");


// loading the views by using Pug and setting views and directory
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "static")));
app.use('/static', express.static('public'));
app.use("/static", express.static(path.join(__dirname, "static")));

app.set("view engine", "pug");

//########### Routers START###########
router.get("/", function(req, res) { //this is not used, the one in router is used
    session = req.ression //session from express
    if (sess.email) {
        console.log("session initiated for user");
        return res.redirect("/users/add")
    } else {
        res.sendFile("/")
    }
});

router.get("/", function(req, res) {
    res.render("index");
    console.log("where am i?");
});

module.exports = router;

const usersRouter = require("./routes/users_s");
const publicRouter = require("./routes/public");
app.use('/home', publicRouter);
app.use('/index', usersRouter);

//########### Routers END ###########

//########### STORAGE stuff START ###########

const storage = multer.diskStorage({
    destination: "./static/uploads/",
    filename: function(req, file, call_b) {
        call_b(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname), //using multer library for upload renaming the file with timestamp to make it unique
            console.log("file is created with name " + file.fieldname + "_" + Date.now() + path.extname(file.originalname)))
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 } //setting a limit for the filesize
}).single("img"); //using this variable for single image upload only

// upload to mongodb function to use when uploading the threads [uploading an image is optional in threads
// calling the upload function when uploading the threads, please see under forum_add post function below]

//########### STORAGE stuff END ###########



//########### Public routes START ###########
// initial route setup as following 
app.get("/", function(req, res) { //update code to read from the table in the mongodb table called users
    User.find({}, function(err, users) { //the User var here is the one in users.js [mongoose.model("User", userSchema);]
        if (err) {
            console.log(err)
        } else {
            res.render("index", {
                title: "rockonnect",
                users: users, //showing all the users
            });
            console.log("under /index now");
        }
    });
});

app.get("/users1", function(req, res) { //update code to read from the table in the mongodb table called users
    User.find({}, function(err, users) { //the User var here is the one in users.js [mongoose.model("User", userSchema);]
        if (err) {
            console.log(err)
        } else {
            res.render("users1", {
                title: "rockonnect",
                users: users, //showing all the users registered in the app
            });
            console.log("under /users1 now");
        }
    });
});

//get route to add a user
app.get("/users/add", function(req, res) {
    res.render("add_users");
    console.log("under /users/add page now!");
});

app.get("/users/register", function(req, res) {
    res.render("register");
    console.log("under /users/register page now");
});

//add POST route to register a user through the form @ add_users with crypted pwd
app.post("/users/add", (req, res) => {
    // assigning a new variable called user that gets the values for the new  
    // user with relative attributes from the registration form and checking if username already exists
    var {
        username,
        name,
        email,
        password,
        about
    } = req.body; //deconstructing !!!
    User.findOne({ username: username }).then(user => { //looking if the username is already present
        if (user) {
            //res.status(500).send("username " + req.body.username + " already in use, please chose another username"); //implementing logic to check if a username is already in the db
            console.log("username " + req.body.username + " already in use, please chose another username");
            return res.redirect("/users/add");
        } else {
            var userBody = { //creating the user as username is NOT already present
                username,
                name,
                email,
                password,
                about
            };
            var newUser = new User(userBody); //definition of a new user from the class object
            console.log("new username " + newUser + " created");
            // have to encrypt the password at this stage before sending it to the db
            bcrypt.genSalt(10, function(err, salt) { //using salt by bcryptjs to encrypt password as from tutorial bcrypts
                bcrypt.hash(newUser.password, salt, function(err, crypt) {
                    if (err) {
                        console.log(err);
                    }
                    newUser.password = crypt // setting the new password = crypt from the value in clear entered before    
                    console.log("original password is encrypted! with value " + crypt + " ...super!!")

                    // now I am ready to save the new user in db as I encrypted the password  
                    newUser.save(function(err) {
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            res.render("signin_users");
                            console.log("under /signin_users page now user " + newUser + " has been saved into mongodb!!!");
                        }
                    });
                });
            });
        }
    });
});


let view_u; //global variable
let view_id; //global variable
// route to get a single user [user "a" wants to look profile of user "b"]
app.get("/users_list/:id", isLoggedIn, function(req, res) { //only logged in users can see other users full profile
    User.findById(req.params.id, function(err, newUser) {
        if (err) {
            console.log(err)
        } else {
            view_u = newUser.username;
            view_id= newUser._id;
            Friend.find({username: view_u}, function(err, friends) { //the User var here is the one in users.js [mongoose.model("User", userSchema);]
            if (err) {
                console.log(err)
            } else {
                res.render("users_list", {
                    user: newUser, //showing the selected users profile
                    image: "/static/default.png",
                    title: "my friends list",
                    friends: friends //showing all the users
                });
                console.log("under /update_friends now");
            }
        });
            console.log("bravo bacco, showing " + newUser.username + " now under /users_list/");
            console.log(view_u);
            return;
        }

    });
});



// route to get a single thread [user "a" wants to look thread "b" details]
app.get("/threads_list/:id", function(req, res) { //same code as above for threads...
    Thread.findById(req.params.id, function(err, newThread) {
        if (err) {
            console.log(err)
        } else {
            res.render("threads_list", { //showing the selected thread profile
                thread: newThread,
                image: req.file
            });
            console.log("bravo bacco, showing " + newThread.title + " now under /threads_list/");
            return;
        }
    });
});

// add route for registered user to be able sign in
app.get("/users/signin", function(req, res) {
    res.render("signin_users");
    console.log("under users/signin page now");
});
// add route for homepage
app.get("/home", function(req, res) {
    res.render("home");
    console.log("under /home page now");
});

// add route to get the forum list page
app.get("/forum", function(req, res) {
    Thread.find({}, function(err, threads) {
        if (err) {
            console.log(err)
        } else {
            res.render("forum", {
                title: "threads",
                threads: threads, //showing all the threads
            });
            console.log("forum page now, ok");
        }
    });
});
//########### Public routes END ###########

//############# Login START #############

/*//the following is BAC code for the login, does not use passport and any of its strategies
app.post('/users/signin', function(req, res, next) {
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
                        'successfully logged in, ' + username + ' under the forum page now '
                    );
                    
                   res.render('forum');
                } else {
                    res.status(401).send(' invalid password ' + username);
                }
            } else {
                res.status(401).send(' invalid credentials 2 ' + username);
            }
        }
    );

});
*/

// USERS LOGIN WITH PASSPORT AND TOKEN ...
/*
app.post("/users/signin", function(req, res) {
    passport.authenticate('local', (err, user) => {
        if (!err && user) {
            console.log("new JWT token generated for " + user);
            var tk = jwt.sign({user: user}, "supersecretprivatepersonalkey", (err, token) => {
                console.log("Token generated is " + token);
                if (!err) {
                    console.log("token now to be used as cookie");
                    res.cookie('token', token); //setting token as cookie
                    res.status(200);
                    res.redirect("/forum");
                    res.send();
                    console.log("user " + user + " properly redirected to /forum");
                }
                res.status(500).send();
            })
        } else {
            res.render("signin_users", {error : true});
        }
    })(req, res);
});
*/

// USERS LOGIN WITH PASSPORT only ...
app.post("/users/signin", passport.authenticate("local", {
    successRedirect: "/forum_add", // redirect to secure page forum_add
    failureRedirect: "/users/signin/", // redirect back to the signup page if there is an error
    failureMessage: isLoggedIn // allow failure messages
}));

//############# Login ENDS #############

//############# Middleware for verifying is users are logged in START #############
/*
// middleware function to be used if login is with jwt to verify the token and split it as per jsonwebtoken documentation
function verifyT(req, res, next) {
    const bHeader = req.headers.token; // get auth header value of the token
    if (typeof bHeader !== "undefined") { //check the token if undefined
        const bear = bHeader.split(" "); //taking token out of the bearer, turning string into arrays and separate them into 2 by a space
        const bearT = bear[1]; //get token from the array in position
        req.token = bearT;
        console.log("bHeader split in " + bear + "and " + bearT);
        next();
    } else {
        res.json({message: "please login first verifyT"}); //forbidden
    }
};
*/
// middleware function to be used if login is with passport only fro supervisor code
/*
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
	if (req.isAuthenticated())
    return next();
    // if users not logged in, then redirect them to the home page
    res.redirect("/users/signin/");
}
*/
//other isLoggedIn function from BAC
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next(),
            console.log("under a protected page now forum_add, because u are logged in ");
    else {
        res.render("signin_users", { error: true }),
            console.log("please login first ... using isLoggedIn function");
    }
};




//############# Middleware for verifying is users are logged in END #############

//############# FORUM THREADS and protected views START #############


app.get("/forum_add", isLoggedIn, (req, res) => {
    res.render("forum_add", {
        user: req.user // user from session on passport only
        }, console.log("viewing a protected page forum_add for user " + req.user.username)),
        console.log("/forum_add page now with isLoggedIn function, please sign in to view this page");
});


// add users to list
// app.get("/update_friends", isLoggedIn, (req, res) =>{
//     Friend.find({username: req.user.username}, function(err, friends) { //the User var here is the one in users.js [mongoose.model("User", userSchema);]
//         if (err) {
//             console.log(err)
//         } else {
//             res.render("update_friends", {
//                 title: "my friends list",
//                 friends: friends, //showing all the users
//             });
//             console.log("under /update_friends now");
//         }
//     });
// });

app.post("/update_friends", isLoggedIn, (req, res) =>{
    res.render("home", 
        {
        user:req.user, // user from session on passport
        id: req.user.id,
        
        }, console.log("updating the friends' list of  " + req.user.username));
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb+srv://mrbacco:mongodb001@cluster0-goutv.mongodb.net/users?retryWrites=true";
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("users");
            dbo.collection("friends").insertOne({
                username:req.user.username, // user from session on passport, loggedin user
                // friend_name: need to put the username of the user whose page is visualized  
                view_u: view_u,
                view_id: view_id
                }, function(err, res, next) {
                if (err) {
                    console.log(err + " what error is sthis");
                    return;
                } else {
                    console.log("under friends page now, new friend has been added to the list");
                }
            });
        });
    });


/*
app.get("/forum_add", (req, res, next) => {
    if (isLoggedIn(req, res, next)) {
      res.render("forum_add", 
      {
        user:req.user,
        username: req.user.username,
      },
        console.log("viewing a protected page forum_add for user " + req.user.username)
      );
    } else {
        res.render("signin_users", {error : true});
    }
  });
*/

/* //this is to use only with jsonwebtoken
app.get("/forum_add", function(req, res, next) {
    jwt.verify(req.token, "secretkey", (err, authData)=>{
        if (!err){
            res.render("forum_add");
            console.log("/forum_add page now with authdata = " + authData);
            
        } else{
            res.json({message: " please login first to get to see forum_add"}), console.log("login needed to get to see forum_add"); //forbidden
        }
        next;
    });
});
*/

//route to get the forum_add page and update the threads
app.post("/forum", upload, (req, res) => { //posting a new thread, this should be a protected view visible only after login
    var {
        user,
        title,
        content,
        image
    } = req.body; //deconstructing again!!!
    var threadBody = {
        user,
        title,
        content,
        image: req.file.path
    };
    var newThread = new Thread(threadBody); //definition of a new thread from the class object
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb+srv://mrbacco:mongodb001@cluster0-goutv.mongodb.net/users?retryWrites=true";

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("users");
        upload(req, res, (err) => { //calling the upload method define before
            if (err) {
                console.log("file not uploaded...");;
            } else {
                console.log("file " + req.file + " uploaded, thanks ");
                console.log(req.file);
            }
            newThread.file = req.file;
            dbo.collection("threads").insertOne(newThread, function(err, res, next) {
                if (err) {
                    console.log(err + " what error is sthis");
                    return;
                } else {
                    console.log("under thread page now, new thread " + newThread.title + " has been created");
                }
            });
        });


    });
    res.render("home");
});


// forum threads post new threads


//logout abd destroy the session for the authenticated user with passport
app.get("/users/signout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/home");
            console.log("session destroyed for user " + req.session + " redirected /home");
        }
    });
});
//############# FORUM THREADS and protected views END #############

// FINAL LINES to run the Server // never write below these lines as Liam said
app.listen(process.env.PORT || 3020, process.env.IP || "0.0.0.0", function() {
    console.log("app is running on app.js which is the server side app on http://localhost:3020");
});