// connects to the mongoose database
var mongoose = require('mongoose')
// need a schema to mess with it
var Schema = mongoose.Schema

mongoose.Promise = global.Promise;

// connect to the db
try{
    mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"))
} catch(error){
    console.log("could not connect");
}

mongoose.set('useCreateIndex', true)

// a food schema for the db
var charitySchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    imageUrl: {type: String, required: false }
});

// return it to the server
module.exports = mongoose.model('Charity', charitySchema);