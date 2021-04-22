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
var movieSchema = new Schema({
    title: {type: String, required: true},
    release: {type: Date, required: true},
    genre: {type: String,required: true, enum: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western']},
    characters: { type: [{actorName: String, characterName: String}], required: true },
    review:{type: Number},
    imageUrl: { type: String, required: false }
});

// return it to the server
module.exports = mongoose.model('Movie', movieSchema);
