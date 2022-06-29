const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passportJwt = require('passport-jwt');
const key = require('../../setup/myurl');

const Person = require('../../models/Person');
const myurl = require('../../setup/myurl');
const passport = require('passport');


router.get('/', (req, res) => {
    res.json({ test: 'Auth is success' });
});

router.post('/register', (req, res) => {
    Person.findOne({ email: req.body.email })
        .then(person => {
            if (person) {
                return res.status(400).json({ message: 'User with given email already exists' });
            } else {
                const newPerson = new Person({
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPerson.password, salt, (err, hash) => {
                        if (err) {
                            throw err;
                        } else {
                            newPerson.password = hash;
                            newPerson.save(newPerson)
                                .then(person => res.json(person))
                                .catch(err => console.log(err));
                        }
                    });
                });
            }
        })
        .catch(err => console.log(err));
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({ email })
        .then(person => {
            if (!person) {
                return res.status(404).json({ message: 'User with given email does not exist!' });
            }
            bcrypt.compare(password, person.password)
                .then(isCorrectMatch => {
                    if (isCorrectMatch) {
                        const payload = {
                            id: person.id,
                            name: person.name,
                            email: person.email
                        }
                        jwt.sign(payload,
                            myurl.secret,
                            { expiresIn: '1h' },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                });
                            });
                    } else {
                        return res.status(400).json({ message: 'Wrong credentials!' });
                    }
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});


router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {

    const id = req.user.id;
    Person.findById(id)
        .then(person => {
            if (person) {
                return res.status(200).json(person);
            }
            return res.status(400).json({ message: 'Unknown id!' });
        })
        .catch(err => console.log(err));
});

module.exports = router;
