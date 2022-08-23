const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");



const app = express(); 

const mongoose = require("mongoose");
const cors = require('cors');

const Models = require("./models.js");

const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
 const Users = Models.User;
 

 //mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  //useNewUrlParser: true, 
   //useUnifiedTopology: true });

   mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

   



// middleware 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use (morgan("common"));
app.use(express.static("public"));



const allowedOrigins = ['http://localhost:8080', 'https://intense-ridge-76926.herokuapp.com/', 'http://localhost:1234', 'https://stunning-cheesecake-1fd213.netlify.app'];
app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            //if specified origin isn't found on the list of allowed origins
            let message = `The CORS policy for this application doesn't allow access from origin ${origin}`;
            return callback(new Error(message), false); 
        }
        return callback(null, true);
    }
}));


let auth = require("./auth")(app);


const passport = require("passport");
require("./passport");





// GET requests

app.get("/", (req, res) => {
  res.send("Welcome To My Top Ten Marvel Movies!");
});

app.get("/documentation", (req, res) => {                  
  res.sendFile("public/documentation.html", { root: __dirname });
});


app.get ("/movies", passport.authenticate("jwt", {session:false}),(req, res)=> {
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
  Movies.findOne({ Title: req.params.title })
    .then((movieTitle)=> {
      res.status(201).json(movieTitle);
    })
    .catch((err)=> {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });

// Return data about a genre (description) by name/title (e.g., “Thriller”).
app.get("/genre/:name", passport.authenticate("jwt", {session:false}), (req, res)=> {
  Movies.findOne({ "Genre.Name": req.params.name})
  .then((movies)=> {
    res.status(201).json(movies.Genre)
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " + err);
  });
});

// Return data about a director (bio, birth year, death year) by name.
app.get("/directors/:directorName", passport.authenticate("jwt", {session:false}), (req, res) =>{
  Movies.findOne({ "Director.Name": req.params.directorName})
    .then((movies) => {
      res.status(201).json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get all users
app.get("/users",  passport.authenticate("jwt", {session:false}), (req, res) => {
  Users.find()
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//Get user by username
app.get("/users/:Username", passport.authenticate("jwt", {session:false}), (req, res) =>{
  Users.findOne({ Username: req.params.Username})
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
  check("Username", "Username is required").isLength({ min: 5 }),
  check("Username", "Username contains non alphanumeric characters - not allowed").isAlphanumeric(),
  check("Password", "Password is required").not().isEmpty(),
  check ("Email", "Email does not appear to be valid").isEmail()
  ], (req,res) => {
    
    // check the validation object for errors
    
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json ({ errors: errors.array() });      
  } 
   let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne({ Username: req.body.Username })
  .then((user) => {
  if (user) {
    return res.status(400).send (req.body.Username + "already exists");
  } else {
    Users
    .create({
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
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
  Users.findOneAndUpdate({ Username: req.params.Username }, 
    {
      $push: { FavoriteMovies: req.params.MovieID }
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
app.put("/users/:Username", passport.authenticate("jwt", {session:false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username},
    {
      $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    {new: true}, //Ensures document is returned
    (err, userUpdated) => {
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
app.delete("/users/:Username/movies/:Moviesid",passport.authenticate("jwt", {session:false}),  (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username}, 
    {$pull:
      { FavoriteMovies: req.params.Moviesid }
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
app.delete("/users/:Username", passport.authenticate("jwt", {session:false}), (req, res) =>{
  Users.findOneAndRemove({ "Username": req.params.Username})
    .then((user)  => {
      if(user) {
        res.status(400).send(req.params.Username + ' was not found');
      }else{
        res.status(200).send(req.params.Username + ' was deleted.');
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
