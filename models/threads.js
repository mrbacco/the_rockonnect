var mongoose = require("mongoose");

// needs to give some structured for the non structured db like mongodb
var threadSchema = mongoose.Schema({
    user: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },

});

//export the db schema to be used in the threads creation etc ...
var Threads = module.exports = mongoose.model("Thread", threadSchema);