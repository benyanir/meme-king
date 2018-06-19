const _ = require('lodash');
const passport = require('passport');


// services
const passportService = require('./services/passport');
const DbService = require('./dataBase/DbService');

// helpers
const helpers = require('./helpers/helpers');

// controllers
const Authentication = require('./controllers/auth');

const requireAuth = passport.authenticate('jwt', { session: false });
const requireSignIn = passport.authenticate('local', { session: false });


module.exports = function(app) {




    app.get('/api/user', requireAuth,  function(req, res) {
        res.send(req.user);
    });

    app.post('/api/personal-meme', requireAuth,  function(req, res) {

        const user = req.user || {};

        DbService.addPersonalMeme({ id: user.id, meme: req.body}).then(data => {
            res.send(helpers.arrayToObjById(data.personalMemes));
        })

    })

    app.post('/api/remove-personal-memes', requireAuth,  function(req, res) {

        const user = req.user || {};

        DbService.removePersonalMemes({ id: user.id }).then(data => {
            res.send(200)
        })

    })

    app.delete('/api/personal-meme', requireAuth,  function(req, res) {

        const user = req.user || {};

        DbService.addPersonalMeme({ id: user.id, meme: req.body}).then(data => {
            res.send(helpers.arrayToObjById(data.personalMemes));
        })

    })


    app.post('/api/sign-up', Authentication.signUp);


    app.post('/api/sign-in', requireSignIn, Authentication.signIn);

}