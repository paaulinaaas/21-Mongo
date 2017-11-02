var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csurf = require('csurf');
var express = require('express');
var extend = require('xtend');
var forms = require('forms');
var mongoose = require('mongoose');
var User = require('./models'); 

var profileForm = forms.create({
    givenName: forms.fields.string({ required: true }),
    surname: forms.fields.string({ required: true }),
});

function renderForm(req, res, locals) {
    res.render('profile', extend({
        title: 'My Profile',
        csrfToken: req.csrfToken(),
        givenName: req.user.givenName,
        surname: req.user.surname,        
    }, locals || {}));
}

module.exports = function profile() {

    var router = express.Router();
        router.use(cookieParser());
        router.use(bodyParser.urlencoded({ extended: true }));
        router.use(csurf({ cookie: true }));

        router.all('/', function(req, res) {
        profileForm.handle(req, {
        success: function(form) {
            req.user.givenName = form.data.givenName;
            req.user.surname = form.data.surname;            
            var user = new User();
                user.givenName = req.user.givenName;
                user.surname = req.user.surname;
                user.address =req.user.address;

                user.save(function(err) {
                    if (err) {
                        if (err.developerMessage){
                            console.error(err);
                         }
                        renderForm(req, res, {
                            errors: [{
                                error: err.userMessage ||
                                err.message || String(err)
                            }]
                        });
                    } else {
                        renderForm(req, res, {
                            saved: true
                        });
                    }
                });
            },
            empty: function() {
                renderForm(req, res);
            }
        });
    });
    return router;
};