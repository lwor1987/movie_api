const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");


const app = express(); 

const mongoose = require("mongoose"); 
const Models = require("./model.js");

const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
 const Users = Models.User;
 

 //mongoose.connect("mongodb://localhost:27017/myFlixDB", {
 // useNewUrlParser: true, 
   //useUnifiedTopology: true });

   mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

   



// middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use (morgan("common"));
app.use(express.static("public"));


const cors = require("cors");
app.use(cors());



let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");





// GET requests

app.get("/", (req, res) => {
  res.send("Welcome to my top ten Marvel movies!");
});

app.get("/documentation", (req, res) => {                  
  res.sendFile("public/documentation.html", { root: __dirname });
});


app.get ("/movies", passport.authenticate("jwt", {session:false}), (req, res) => {
  Movies.find()
    .then((movies) =>  {
      res.status(201).json(movies);
    })
    .catch((error)  => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});
// Return data about a movie
app.get("/movies/:title", passport.authenticate("jwt", {session:false}),(req, res)=> {
  Movies.findOne()
    .then((movieTitle)=> {
      res.status(201).json(movieTitle);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });

// Return data about a genre (description) by name/title (e.g., “Thriller”).
app.get("/movies/genre/:name", passport.authenticate("jwt", {session:false}), (req, res)=> {
  Movies.find({"genre.name": req.params.name})
  .then((genreName)=> {
    res.status(201).json(genreName)
  })
  .catch((err)=> {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// Return data about a director (bio, birth year, death year) by name.
app.get("/movies/directors/:name", passport.authenticate("jwt", {session:false}), (req, res) =>{
  Movies.find({"director.name": req.params.name})
    .then((directors)=> {
      res.status(201).json(directors);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get all users
app.get("/users",  passport.authenticate("jwt", {session:false}), (req, res) => {
  Users.find()
    .then((user)=> {
      res.status(201).json(user);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Get user by username
app.get("/users/:username", passport.authenticate("jwt", {session:false}), (req, res) =>{
  Users.findOne({username: req.params.username})
    .then((user)=> {
      res.status(201).json(user);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



// Allow new users to register.
app.post("/users", 
[
  check("Username", "Username is required").isLength({min:5}),
  check("Username", "Username contains nonalphanumeric characters - not allowed").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check ("Email", "Email does not appear to be valid").isEmail()
  ], (req,res) => { // check the validation object for errors
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json ({ errors: errors.array() } 
        );      
  } 
   let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne({ username: req.body.username })
  .then((user) => {
  if (user) {
    return res.status(400).send (req.body.username + "already exists");
  } else {
    Users.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      birthday: req.body.birthday
    })
    .then((user) =>{
      res.status(201).json(user) })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
  });
 }
})
.catch((error) => {
console.error(error);
res.status(500).send("Error: " + error);
  });
});



// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later)

app.post("/users/:Username/movies/:MovieID", passport.authenticate("jwt", {session:false}), (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, 
    {
      $push: { favoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (error, updatedUser) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    } else {
      res.json(updatedUser);
    }
  });
});

//update user info
app.put("/users/:id", passport.authenticate("jwt", {session:false}), (req, res) => {
  Users.findOneAndUpdate({id: req.params.id},
    {$set:
      {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday
      }
    },
    {new: true}, //Ensures document is returned
    (err, userUpdated)=> {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      }else {
        res.json(userUpdated);
      }
    });
});


  
// DELETE Request.

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later)
app.delete("/users/:username/movies/:Moviesid",passport.authenticate("jwt", {session:false}),  (req, res) => {
  Users.findOneAndUpdate({username: req.params.username}, 
    {$pull:
      {favoriteMovies: req.params.Moviesid}
    },
    { new: true }, //Returns document
    (err, removeFavorite) => {
      if (err){
        console.error(err);
        res.status(500).send("Error: " + err);
      }else{
        res.json(removeFavorite);
      }
    });
  });

// Allow existing users to deregister
app.delete("/users/:username", passport.authenticate("jwt", {session:false}), (req, res) =>{
  Users.findOneAndRemove({username: req.params.username})
    .then((user)=> {
      if(user) {
        res.status(400).send(req.params.username + ' was not found');
      }else{
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
      .catch((err)=> {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});



app.use((err, req, res, next ) => {
  console.error(err.stack);
  res.status(500).send("An error has been detected")
});

// listen for requests
//app.listen(8080, () => {
 // console.log( "Listening on Port 8080.");
//});
 const port = process.env.PORT || 8080; 
       app.listen(port, "0.0.0.0", () => {
         console.log("Listening on Port" + port);
       });
