let envPath = __dirname + "/../.env";               
require('dotenv').config({path:envPath});    
let chai = require('chai') ;                        
let chaiHttp = require('chai-http');                
let server = require('../server');                  
let User = require('../Users');

var token = '';
chai.should();
chai.use(chaiHttp);        

// trying to login and sign up with this user
let login_details = {
    name : 'testtt',
    username : 'ethanaaa',
    password : 'badGuyyyy'
}

// playing around with this movie
let movie_details = {
    title : 'Underworld',
    review :'true',
}
// movie_details.characters.push({
//     characterName:'vonathan',
//     actorName:'anathan'
// });

let reviewdetails = {
    name : 'Robr',
    comment : "yes",
    rating : "4.4",
    title : "Avatar"
}


    // // sign up operation
    // describe('/signup', () => {
    //     it('it should register, login and check our token', (done) => {
    //         chai.request(server)
    //             .post('/signup')
    //             .send(login_details)
    //             .end((err, res) =>{
    //                 console.log(JSON.stringify(res.body))
    //             })
    //     })
    // })

    // signin operation
    describe('/signin', () => {
        it('will check our log in info', (done) => {   
            chai.request(server)
                .post('/signin')                            
                .send(login_details)                        
                .end((err, res) =>{                         
                    console.log(JSON.stringify(res.body))
                    // saves us the token
                    if(res.body.msg !== 'Authentication failed.') {
                        token = res.body.token;
                    }
                    done();
                })
        })
    })

    // describe('/reviews', () => {
    //     it('adds review', (done) => {
    //         chai.request(server)
    //             .post('/reviews')
    //             .set('Authorization', token)
    //             .send(reviewdetails)
    //             .end((err, res) =>{
    //                 console.log(JSON.stringify(res.body))
    //                 done();
    //             })
    //     })
    // })

    // //adds a movie to the database
    // describe('/moviecollection', () => {
    //     it('adds a movie to the database', (done) => {
    //         chai.request(server)
    //             .post('/moviecollection')
    //             .set('Authorization', token)
    //             .send(movie_details)
    //             .end((err, res) =>{
    //                 console.log(JSON.stringify(res.body))
    //                 done();
    //             })
    //     })
    // })
    //
    // // delets a movie from a database
    // describe('/moviecollection', () => {
    //     it('deletes a movie from a database', (done) => {
    //         chai.request(server)
    //             .delete('/moviecollection')
    //             .set('Authorization', token)
    //             .send(movie_details)
    //             .end((err, res) =>{
    //                 console.log(JSON.stringify(res.body))
    //                 done();
    //             })
    //     })
    // })
    //
    //returns a movie from a database
    describe('/moviecollection', () => {
        it('adds a movie to the database', (done) => {
            chai.request(server)
                .get('/moviecollection?review=true')
                .set('Authorization', token)
                .send(movie_details)
                .end((err, res) =>{
                    console.log(JSON.stringify(res.body))
                    done();
                })
        })
    })
    //
    // //updates a movie in the database
    // describe('/moviecollection', () => {
    //     it('updates a movie in the database', (done) => {
    //         chai.request(server)// do a chai request on our server
    //             .put('/moviecollection')
    //             .set('Authorization', token)
    //             .send(movie_details)
    //             .end((err, res) =>{
    //                 console.log(JSON.stringify(res.body))
    //                 done();
    //             })
    //     })
    // })
