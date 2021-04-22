/*
    Name : Artsiom Skarakhod
    Project : Homework 4
    Description : Reviews
 */
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./reviews');
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
                    return res.status(400).json(err)
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
router.route('/moviecollection')
    // gets all movies
    .get(authJwtController.isAuthenticated, function (req, res) {
        // find the movie using the request title
        // .select is there to tell us what will be returned
        if(req.query == null || req.query.review !== "true"){
            Movie.find().exec(function (err, movie) {
            // if we have an error then we display it
                if(err) 
                {
                    return res.status(401).json({message: "Something is wrong: \n", error: err});
                }
                // otherwise just show the movie that was returned
                else if(movie == null)
                {
                    return res.status(404).json({success: false, message: "Error: movies not found."});
                }
                else
                {
                    return res.status(200).json(movie);
                }
            })
        }
        else 
        {
            Movie.aggregate()
            .match(req.body)
            .lookup({from: 'reviews', localField: '_id', foreignField: 'movieid', as: 'reviews'})
            .exec(function (err, movie) {
                if (err)
                {
                    return res.send(err);
                }
                // find average reviews four our movies
                var numOfMovies = movie.length;
                if (movie && numOfMovies > 0) 
                {
                    movie.forEach(function(mp)
                    {
                        var totalSum = 0;
                        mp.reviews.forEach(function(rp)
                        {
                            // add the reviews together into one variable
                            totalSum = totalSum + rp.rating;
                        });


                        if(mp.reviews.length > 0){
                            Object.assign(mp, {avgRating: totalSum/mp.reviews.length});
                        }
                    });
                    movie.sort((a,b) => {
                        return b.avgRating - a.avgRating;
                    });
                    return res.status(200).json({result: movie});
                }
                else {
                    return res.status(403).json({success: false, message: "Movies not found."});
                }
            });
        }
    })
    // post adds a movie
    .post(authJwtController.isAuthenticated, function(req,res){            // create new movie
        var numOfChars = req.body.characters.length;
        var error = false;
        // goes thru character array inside of the body and makes sure that all the info is there
        for(var i = 0; i< numOfChars;i++) {
            if(req.body.characters[i].characterName === ''|| req.body.characters[i].characterName === '')
            {
                error = true;
                if(error)
                {
                    break;
                }
            }
        }
        // if there are less than 3 characters in a movie it won't let you add that movie
        if(numOfChars<3)
        {
            res.status(400).json({success: false, msg: 'Must have at least 3 movie characters'})
        }
        // if one of the fields are empty it won't let you add the movie
        else if (req.body.title === ''|| req.body.release === '' || req.body.genre === ''|| error ){
            res.status(400).json({success: false, msg: 'Please make sure you have entered all fields'})
            // otherwise we simply add the movie request into a temp movie
        } else {
            let mov = new Movie()
            mov.title = req.body.title
            mov.release = req.body.release
            mov.genre = req.body.genre
            mov.characters = req.body.characters;
            mov.imageUrl = req.body.imageUrl;

            // then call a save command,
            mov.save(function(err){
                // if error then something went wrong, like a movie with the same name already exists
                if (err) {
                    console.log("sorry we ran into an error")
                    res.status(400).json({success: false, msg: 'we have an error posting'})
                    throw err
                }
                // otherwise we are good, and the movie has been added
                else{
                    res.status(200).json({success: true, msg: 'Movie added successfully'})
                }
            })
        }
    })

    // delete, delets a move from the database, by looking up it's name
    .delete(authJwtController.isAuthenticated, function (req,res){          // delete movie
        // we call findAndRemove, which finds a movie using a title and removes it
        Movie.findOneAndRemove({title: req.body.title}).select('title genre release characters').exec(function(err, movie){
            // if there is an error then something went wrong
            if (err)
            {
                res.status(400).json({success: false, msg: 'error occured'})
                console.log("could not delete")
                throw err
            }
            // if the movie returned is not null then we deleted the movie successfully
            else if(movie !== null)
            {
                console.log("Movie Deleted")
                res.status(200).json({success: true, msg: 'movie deleted successfully'})
            }
            // if the mvie is returned null then we never found a movie in the database with the same name
            else {
                res.status(400).json({success: false, msg: 'no movie was found'})
            }
        })
    })

    // put simply updates a movie in our database by looking up a name
    .put(authJwtController.isAuthenticated, function (req,res) {        // updates a movie
        // if the body is empty then the user never submitted the request properly
        // if the title is empty then we can't look up the movie we are editing
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

router.route('/moviecollection/:movieid')
    .get(authJwtController.isAuthenticated, function (req, res) {
        // find the movie using the request title
        // .select is there to tell us what will be returned
        if(req.query == null || req.query.review !== "true"){
            Movie.findOne({_id: req.params.movieid}).select("title year genre actors").exec(function (err, movie) {
                // if we have an error then we display it
                if(err) 
                {
                    return res.status(401).json({message: "Something is wrong: \n", error: err});
                }
                // otherwise just show the movie that was returned
                else if(movie == null)
                {
                    return res.status(404).json({success: false, message: "Error: movies not found."});
                }
                else
                {
                    return res.status(200).json(movie);
                }
            })
        }
        else 
        {
            Movie.aggregate()
            .match({_id: mongoose.Types.ObjectId(req.params.movieid)})
            .lookup({from: 'reviews', localField: '_id', foreignField: 'movieid', as: 'reviews'})
            .exec(function (err, movie) {
                if (err)
                {
                    return res.send(err);
                }
                // find average reviews four our movies
                var numOfMovies = movie.length;
                if (movie && numOfMovies > 0) 
                {
                    // add all of the average values together
                    for (let i = 0; i < numOfMovies; i++) 
                    {
                        let sum = 0;
                        // go through all of the review values and add them
                        for (let k = 0; k < movie[i].reviews.length; k++) 
                        {
                            sum = sum + movie[i].reviews[k].rating;
                        }
                        // adds the avg review to the movie
                        if (movie[i].reviews.length > 0) 
                        {
                            movie[i] = Object.assign({},movie[i],{avgRating: (sum/movie[i].reviews.length).toFixed(2)});
                        }
                    }
                    movie.sort((a,b) => {
                        return b.avgRating - a.avgRating;
                });
                return res.status(200).json({
                    result: movie
                });
            }
                else {
                    return res.status(404).json({success: false, message: "Not found."});
                }
            });
        }
    })

router.route('/reviews')
    .post(authJwtController.isAuthenticated, function(req, res){
        Movie.findOne({title: req.body.title}).select('title').exec(function (err, movie) {

            // My friend Oleksiy helped me with it
            let usertoken = req.headers.authorization;
            let token = usertoken.split(' ');
            let decoded = jwt.verify(token[1], process.env.SECRET_KEY);

            // if we have an error then we display it
            if (err)
            {
                res.status(400).json({message: "Something is wrong: \n", error: err});
            }
            // otherwise just show the review that was returned
            else
            {
                if(movie != null)
                {
                    let review = new Review()
                    review.name = decoded.username;
                    review.comment = req.body.comment;
                    review.rating = req.body.rating;
                    review.title = req.body.title;
                    review.movieid = movie.id;

                    console.log(review);
                    // then call a save command,
                    review.save(function (err) {
                        // if error then something went wrong, like a review with the same name already exists
                        if (err) {
                            return res.status(401).json({success: false, msg: 'we have an error posting'})
                        }
                        // otherwise we are good, and the movie has been added
                        else {
                            return res.status(200).json({success: true, msg: 'Review added successfully'})
                        }
                    })
                }
                else
                {
                    return res.status(404).json({success: false, msg:'Error. Movie not found'});
                }
            }
        })
    });


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only