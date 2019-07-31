
var mongoose = require("mongoose");

// needs to give some structured for the non structured db like mongodb
var userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    about:{
        type: String,
        required: true
    },
    userImage : {
		type:String,
		default:"static/uploads/default1.png"
    },
    friends: [{
        id: String,
        username : String
    }]
});

//export the db schema to be used in the registration etc ...
var Users = module.exports = mongoose.model("User", userSchema);