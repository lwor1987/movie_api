const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.Users;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

let movies = [
  {
    title: 'Captin Marvel',
    genre: ['Action', 'Superhero', 'Science Fiction'],
    director: 'Anna Boden & Ryan Fleck'
  },
  {
    title: 'Iron Man 3',
    genre: ['Action', 'Comedy', 'Adventure', 'Superhero', 'Science Fiction'],
    director: 'Shane Black'
  },
  {
    title: 'Gurdians Of The Galaxy',
    genre: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Superhero', 'Science Fiction'],
    director: 'James Gunn'
  },
  {
    title: 'Ant-Man ',
    genre: ['Action', 'Adventure', 'Comedy', 'Thriller', 'Heist', 'Superhero', 'Science Fiction'],
    director: 'Peyton Reed'
  },
  {
    title: 'Black Widow',
    genre: ['Action', 'Fantasy', 'Superhero', 'Thriller','Science Fiction', 'Spy', 'Adventure'],
    director: 'Cate Shortland'
  },
  {
    title: 'Black Panther',
    genre: ['Action', 'Fantasy', 'Superhero', 'Science Fiction', 'Adventure'],
    director: 'Ryan Coogler'
  },
  {
    title: 'Doctor Strange',
    genre: ['Action', 'Fantasy', 'Superhero', 'Adventure', 'Science Fiction'],
    director: 'Scott Derrickson'
  },
  {
    title: 'Spider-Man: Far From Home',
    director: 'Jon Watts'
  },
  {
    title: 'Avengers: Infinity War',
    genre: ['Action', 'Superhero', 'Science Fiction'],
    director: 'Anthony Russo & Joe Russo'
  },
  {
    title: 'Thor: Ragnarok',
    genre: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Superhero', 'Buddy', 'Science Fiction'],
    director: 'Taika Waititi'
  },
  {
    title: 'Gurdians Of The Galaxy Vol. 2',
    genre: ['Action', 'Adventure', 'Comedy', 'Fantasy', 'Superhero', 'Science Fiction'],
    director: 'James Gunn'
  }
];
// middleware
app.use(morgan('common'));
app.use(express.static('public'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my top ten Marvel movies!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/movies', (req, res) => {
  res.json(movies);
});
// Return data about a genre (description) by name/title (e.g., “Thriller”).
app.get('/movies/:title/genre', (req, res) => {
  res.send('Successful GET request returning data about a genre.');
});

// Return data about a director (bio, birth year, death year) by name.
app.get('/movies/director/:name', (req, res) => {
  res.send('Successful GET request returning data about a director.');
})

// PUT Request.

// Allow new users to register.
app.post('/newUser', (req, res) => {
  res.send('Successful POST request user was able to register.');
});

// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later)
app.post('/newUser/:id/favorites', (req, res) => {
  res.send('Successful POST request movie has been added to favorites.');
});

// PUT Request.

// Allow users to update their user info (username, password, email, date of birth).
app.put('/newUser/:id/info', (req, res) => {
  res.send('Successful PUT request user info updated.');
});

// DELETE Request.

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later)
app.delete('/newUser/:id/favorites', (req, res) => {
  res.send(
    'Successful DELETE request movie has been deleted from user list of favorites.'
  );
});

// Allow existing users to deregister
app.delete('/newUser', (req, res) => {
  res.send('Successful DELETE request existing user has been deregistered.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been detected')
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

