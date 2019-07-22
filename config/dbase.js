db = 'mongodb+srv://mrbacco:mongodb001@cluster0-goutv.mongodb.net/users?retryWrites=true';

module.exports = { mongoURI: db }; //using this as mongodb is deprecating the URL not parsed, so I have to pass an object instead

//mongoose.connect("mongodb+srv://mrbacco:mongodb001@cluster0-goutv.mongodb.net/users?retryWrites=true&w=majority");
// connecting to a db ... mongodb: database is called users: to connect to a local mongodb, 
// replace "mongodb+srv://mrbacco:mongodb001@cluster0 ... " with "mongodb://localhost/users"