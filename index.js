const express = require('express');
const morgan = require('morgan');
const app = express();

let movies = [
  {
    title: 'Captin Marvel',
    director: 'Anna Boden & Ryan Fleck'
  },
  {
    title: 'Iron Man 3',
    director: 'Shane Black'
  },
  {
    title: 'Gurdians Of The Galaxy',
    director: 'James Gunn'
  },
  {
    title: 'Ant-Man ',
    director: 'Peyton Reed'
  },
  {
    title: 'Black Widow',
    director: 'Cate Shortland'
  },
  {
    title: 'Black Panther',
    director: 'Ryan Coogler'
  },
  {
    title: 'Doctor Strange',
    director: 'Scott Derrickson'
  },
  {
    title: 'Spider-Man: Far From Home',
    director: 'Jon Watts'
  },
  {
    title: 'Avengers: Infinity War',
    director: 'Anthony Russo & Joe Russo'
  },
  {
    title: 'Thor: Ragnarok',
    director: 'Taika Waititi'
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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('An error has been detected')
});

// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});