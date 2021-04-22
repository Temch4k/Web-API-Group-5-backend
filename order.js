// changing this to "order schema"
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var Food = require('/food.js');

mongoose.Promise = global.Promise;

try{
    mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"))
} catch(error){
    console.log("could not connect");
}

mongoose.set('useCreateIndex', true)

// order
var orderSchema = new Schema({
    userName: {type: String, required: true},
    amount: {type: Number,required: true},
    items: {type: [{food: Food}], required: true}, //???????
});

// return the model to server
module.exports = mongoose.model('Order', orderSchema);