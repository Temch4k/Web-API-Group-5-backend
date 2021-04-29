/*
    Name : final project
    Project : Final
    Description : Final
 */
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Food = require('./Food');
var Charity = require('./Charity');
var mongoose = require('mongoose');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();


// copied from Shawn and homework 2
// goes to sign up, if a field is empty, it won't let the user to be created
router.post('/signup', function(req, res) {
    // checks if the fields are empty
    if (!req.body.username || !req.body.password) {
        res.status(400).json({success: false, msg: 'Please include both username and password to signup.'})
        //if they arent create a user
    }else {
        var user = new User()
        user.name = req.body.name
        user.username = req.body.username
        user.password = req.body.password

        // we save the user and if run into an error then we put the error out
        user.save(function(err){
            // if there is an error
            if (err) {
                if (err.code === 11000) 
                {
                    return res.status(403).json({success: false, message: 'A user with that username already exist'})
                }
                else
                    return res.status(400).json({success: false, message: "error guys!"})
            }
            // otherwise send a happy note
            console.log("created new user")
            return res.status(200).json({success: true, message: "Successfully created new user."});
        })
    }
});

// does a signin option
router.post('/signin', function (req, res) {
    // create a new temp user and get the request's information saved into it
    var userNew = new User();
    userNew.username = req.body.username
    userNew.password = req.body.password

    // we find the user's username
    User.findOne({username: userNew.username}).select('name username password').exec(function(err, user){
        if(err){
            res.send(err)
            throw err
        }

        // if the user returns as a null that means we never found the username
        if(user == null)
        {
            res.status(401).json({success: false, msg: 'No user found with the following username'})
        }
        else{
            // if we did find a user, then we compare the password that was in our databas to the input
            user.comparePassword(userNew.password, function(isMatch){
                // if its matched we create a user token and send it to them
                if(isMatch){
                    var userToken = {id: user.id, username: user.username}
                    var token = jwt.sign(userToken, process.env.SECRET_KEY)
                    res.status(200).json({success: true, token: 'JWT ' + token})
                }
                // otherwise wrong password
                else{
                    res.status(401).send({success: false, msg: 'Authentication failed.'})
                }
            })
        }
    })
});


// this is where we manipulate the database
router.route('/Group5')
    // gets all food
    .get(authJwtController.isAuthenticated, function (req, res) {
        // find the food using the request title
        // .select is there to tell us what will be returned
            Food.find().exec(function (err, food) {
            // if we have an error then we display it
                if(err) 
                {
                    return res.status(401).json({message: "Something is wrong: \n", error: err});
                }
                // otherwise just show the food that was returned
                else if(food == null)
                {
                    return res.status(404).json({success: false, message: "Error: food item not found."});
                }
                else
                {
                    return res.status(200).json(food);
                }
            })
    })
    // post adds a food
    .post(authJwtController.isAuthenticated, function(req,res){            // create new food
            let fod = new Food()
            fod.name = req.body.name;
            fod.cost = req.body.cost;
            fod.calories = req.body.calories;
            fod.imageUrl = req.body.imageUrl;

            // then call a save command,
            fod.save(function(err){
                // if error then something went wrong, like a food with the same name already exists
                if (err) {
                    console.log("sorry we ran into an error")
                    res.status(400).json({success: false, msg: 'we have an error posting'})
                    throw err
                }
                // otherwise we are good, and the food has been added
                else{
                    res.status(200).json({success: true, msg: 'Food Item added successfully'})
                }
            })
    })

    // delete, delets a move from the database, by looking up it's name
    .delete(authJwtController.isAuthenticated, function (req,res){          // delete food
        // we call findAndRemove, which finds a food using a title and removes it
        Food.findOneAndRemove({name: req.body.name}).exec(function(err, food){
            // if there is an error then something went wrong
            if (err)
            {
                res.status(400).json({success: false, msg: 'error occured'})
                console.log("could not delete")
                throw err
            }
            // if the food returned is not null then we deleted the food successfully
            else if(food !== null)
            {
                console.log("Food Deleted")
                res.status(200).json({success: true, msg: 'food deleted successfully'})
            }
            // if the food item is returned null then we never found it in the database with the same name
            else {
                res.status(400).json({success: false, msg: 'no food item was found'})
            }
        })
    })

    // put simply updates a food in our database by looking up a name
    .put(authJwtController.isAuthenticated, function (req,res) {        // updates a food item
        // if the body is empty then the user never submitted the request properly
        // if the title is empty then we can't look up the food we are editing
        // if the update is empty then we don't know what to update
        if(!req.body || !req.body.titleFind || !req.body.updateFind)
        {
            return res.status(403).json({success: false, message: "Error: Not all of the information is provided for an update"});
        }
        // we update the movie with given info
        else
        {
            // we update the movie by the title
            Movie.updateMany(req.body.titleFind, req.body.updateFind, function(err, movie)
            {
                JSON.stringify(movie);
                // if an error occured then we simply cancel the operation
                if(err)
                {
                    return res.status(403).json({success: false, message: "Error updating a movie"});
                    throw err;
                }
                // if movie is null then we never found the movie we were looking for
                else if(movie.n === 0)
                {
                    return res.status(404).json({success: false, message: "Error, can't find the movie"});
                    throw err;
                }
                // otherwise, if everything went well then we updated the movie
                else
                {
                    return res.status(200).json({success: true, message: "Succsessfully updated the movie"});
                    throw err;
                }
            })
        }
    })

// this is where we manipulate the database
router.route('/charities')
    // gets all food
    .get(authJwtController.isAuthenticated, function (req, res) {
        // find the food using the request title
        // .select is there to tell us what will be returned
        Charity.find().exec(function (err, charity) {
            // if we have an error then we display it
            if(err)
            {
                return res.status(401).json({message: "Something is wrong: \n", error: err});
            }
            // otherwise just show the food that was returned
            else if(charity == null)
            {
                return res.status(404).json({success: false, message: "Error: charity not found."});
            }
            else
            {
                return res.status(200).json(charity);
            }
        })
    })
    // post adds a food
    .post(authJwtController.isAuthenticated, function(req,res){            // create new food
        let chary = new Charity()
        chary.name = req.body.name;
        chary.description = req.body.description;
        chary.imageUrl = req.body.imageUrl;

        // then call a save command,
        chary.save(function(err){
            // if error then something went wrong, like a food with the same name already exists
            if (err) {
                console.log("sorry we ran into an error")
                res.status(400).json({success: false, msg: 'we have an error posting'})
                throw err
            }
            // otherwise we are good, and the food has been added
            else{
                res.status(200).json({success: true, msg: 'Charity added successfully'})
            }
        })
    })

    // delete, delets a move from the database, by looking up it's name
    .delete(authJwtController.isAuthenticated, function (req,res){          // delete food
        // we call findAndRemove, which finds a food using a title and removes it
        Charity.findOneAndRemove({name: req.body.name}).exec(function(err, charity){
            // if there is an error then something went wrong
            if (err)
            {
                res.status(400).json({success: false, msg: 'error occured'})
                console.log("could not delete")
                throw err
            }
            // if the food returned is not null then we deleted the food successfully
            else if(charity !== null)
            {
                console.log("Charity Deleted")
                res.status(200).json({success: true, msg: 'charity deleted successfully'})
            }
            // if the food item is returned null then we never found it in the database with the same name
            else {
                res.status(400).json({success: false, msg: 'no charity was found'})
            }
        })
    })

    // put simply updates a food in our database by looking up a name
    .put(authJwtController.isAuthenticated, function (req,res) {        // updates a food item
        // if the body is empty then the user never submitted the request properly
        // if the title is empty then we can't look up the food we are editing
        // if the update is empty then we don't know what to update
        if(!req.body || !req.body.titleFind || !req.body.updateFind)
        {
            return res.status(403).json({success: false, message: "Error: Not all of the information is provided for an update"});
        }
        // we update the movie with given info
        else
        {
            // we update the movie by the title
            Movie.updateMany(req.body.titleFind, req.body.updateFind, function(err, movie)
            {
                JSON.stringify(movie);
                // if an error occured then we simply cancel the operation
                if(err)
                {
                    return res.status(403).json({success: false, message: "Error updating a movie"});
                    throw err;
                }
                // if movie is null then we never found the movie we were looking for
                else if(movie.n === 0)
                {
                    return res.status(404).json({success: false, message: "Error, can't find the movie"});
                    throw err;
                }
                // otherwise, if everything went well then we updated the movie
                else
                {
                    return res.status(200).json({success: true, message: "Succsessfully updated the movie"});
                    throw err;
                }
            })
        }
    })


router.route('/Group5/:foodId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        // find the food using food id
        Food.findOne({_id: req.params.foodId}).exec(function (err, food) {
            // if we have an error then we display it
            if(err)
            {
                return res.status(401).json({message: "Something is wrong: \n", error: err});
            }
            // otherwise just show the food that was returned
            else if(food == null)
            {
                return res.status(404).json({success: false, message: "Error: your food item is not found."});
            }
            else
            {
                return res.status(200).json(food);
            }
        })
    })




app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only
