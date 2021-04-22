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

// a movie schema for the db
var foodSchema = new Schema({
    cheeseburger: {type: String, required: true},
    fries: {type: String, required: true},
    soda: {type: String, required: true},
    nuggets: {type: String, required: true},
    burrito: {type: String, required: true},
    taco: {type: String, required: true},
    cost: {type: Number, required: true},
    imageUrl: { type: String, required: false }
});

// return it to the server
module.exports = mongoose.model('Movie', foodSchema);
