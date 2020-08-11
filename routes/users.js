const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
//User Model
const User = require('../models/User');
const passport = require('passport');


//Login Page
router.get('/login', (req, res)=>{
    res.render('login');
})

//Register Page
router.get('/register', (req, res)=>{
    res.render('register');
})

//Register Handle
router.post('/register', (req, res)=>{
    // console.log(req.body) 
    // -> These are the details coming from the form
    const{name, email, password, password2} = req.body;
    let errors = [];
    
    //Check required Fileds
    if(!name || !email|| !password|| !password2){
        errors.push({msg: 'Please fill in all the fields'});
    }

    //Check passwords match
    if(password!==password2){
        errors.push({msg:'Passwords do not match'});
    }

    //Check password length
    if(password.length<6){
        errors.push({msg: 'Password should be atleast 6 characters'});
    }

    if(errors.length>0){
        res.render('register', {errors, name, email, password, password2  });
    }

    else{
        //Validation Passed
        User.findOne({email:email}) //Checking if the user already registered
        .then(user=>{
            if(user){
                //User already exists
                errors.push({msg:'Email is already registered'});
                res.render('register', {errors, name, email, password, password2});
            }
            else{
                const newUser = new User({
                    name:name,  //The es6 variant of these below lines are name, email and password
                    email:email,
                    password:password
                })
                
                //HASH Password
                bcrypt.genSalt(10, (err, salt)=>
                 bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    if(err) throw err;
                    //Set password to hashed password
                    newUser.password = hash;
                    //Save User
                    newUser.save()
                    .then(user=>{
                        req.flash('success_msg', 'You are now registered and can login');
                        res.redirect('/users/login');
                    })
                    .catch(err=>console.log(err));
                }))
            }
        })
    }
})

//Login Post Route
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res, next);
})

//Logout Handle
router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', 'You are Logged Out')
    res.redirect('/users/login');
})

module.exports = router;
