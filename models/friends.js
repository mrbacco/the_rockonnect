var mongoose = require("mongoose");

// needs to give some structured for the non structured db like mongodb
var friendSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    view_u:{
        type: String,
        required: true
    },
    view_id:{
        type: String,
        required: true
    }
});

//export the db schema to be used in the add friends etc ...
var Friends = module.exports = mongoose.model("Friends", friendSchema);