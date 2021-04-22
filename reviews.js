var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

try{
    mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"))
} catch(error){
    console.log("could not connect");
}

mongoose.set('useCreateIndex', true)

// review
var reviewSchema = new Schema({
    name: {type: String, required: true},
    comment: {type: String},
    rating: {type: Number,required: true},
    title: {type: String, required: true},
    movieid: {type: mongoose.Types.ObjectId, required: true}
});

// return the model to server
module.exports = mongoose.model('Review', reviewSchema);