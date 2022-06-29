const express = require('express');
const pasport = require('passport');
const mongoose = require('mongoose');

const Profile = require('./../../models/Profile');
const Person = require('./../../models/Person');


const router = express.Router();

router.get('/', pasport.authenticate('jwt', { session: false }), (req, res) => {
    const userID = req.user.id;
    Profile.findOne({ user: userID })
        .then(profile => {
            if (!profile) {
                return res.status(404).json({ message: 'Unknown userId' });
            }
            return res.status(200).json(profile);
        })
        .catch(err => console.log(err));
});

router.post('/', pasport.authenticate('jwt', { session: false }), (req, res) => {

    const profileValues = {}

    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if (Array.isArray(req.body.languages) && req.body.languages.length > 0) {
        profileValues.languages = req.body.languages;
    }
    profileValues.social = {};
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;


    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (profile) {
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileValues },
                    { new: true })
                    .then(profile => res.status(200).json(profile))
                    .catch(err => console.log(err));
            } else {
                new Profile(profileValues).save()
                    .then(profile => {
                        res.status(201).json(profile);
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
});

router.get('/:username', (req, res) => {
    Profile.findOne({ username: req.params.username })
        .populate('user', ['name', 'profilepic'])
        .then(profile => {
            if (!profile) {
                return res.status(404).json({ message: `Unknown username: ${req.params.username}` });
            }
            return res.status(200).json(profile);
        })
        .catch(err => console.log(err));
});

router.get('/find/everyone', (req, res) => {
    Profile.find()
        .populate('user', ['name', 'profilepic'])
        .then(profiles => {
            if (!profiles) {
                return res.status(404).json({ message: 'No enties in DB' });
            }
            return res.status(200).json(profiles);
        })
        .catch(err => console.log(err));
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;

    Profile.findByIdAndRemove(id)
        .then(() => res.status(200).json({ message: 'Record deleted!' }))
        .catch(err => {
            console.log(err);
            return res.status(500).json({ message: 'Something went wrong!' });
        });

});

module.exports = router;
