const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./routes/api/auth');
const question = require('./routes/api/question');
const profile = require('./routes/api/profile');
const passport = require('passport');
const port = process.env.PORT || 5000;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//MongoDb configuration
const mongoURL = require('./setup/myurl').mongoURL;
mongoose.connect(mongoURL)
    .then(() => console.log('MongoDb connected!'))
    .catch(err => console.log(err));


app.use(passport.initialize());
require('./strategy/jwtStrategy')(passport);

app.get('/', (req, res) => {
    res.send('Ok');
});

app.use('/api/auth', auth);
app.use('/api/question', question);
app.use('/api/profile', profile);

app.listen(port, () => console.log(`Server up and running on port ${port}`));