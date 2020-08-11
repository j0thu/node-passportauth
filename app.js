if(process.env.NODE_ENV!='production'){
    require('dotenv').config();
}
//EXPRESS
const express = require('express');
const app = express();

const flash = require('connect-flash');
const session = require('express-session');

const passport = require('passport');
//Passport Config
require('./config/passport')(passport);

//DATABASE CONFIG
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {
    dbName: process.env.DB_NAME,
    user:process.env.DB_USER,
    pass:process.env.DB_PASS,
    useNewUrlParser:true,
    useUnifiedTopology:true
});
const db = mongoose.connection;
db.on('error', error=>console.log(error));
db.once('open', ()=>console.log('Connected To Mongoose'));

//EJS
const expressLayouts  = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('view engine', 'ejs');

//BODY-PARSER - Bodyparser is built in with express
app.use(express.urlencoded({extended: true}));

//Express Session
app.use(session({
    secret: 'secret',
    resave:true,
    saveUninitialized:true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global Flash Vars
app.use((req, res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//Importing Routes
const indexRoute = require('./routes/index');
const usersRoute = require('./routes/users');

//Route usage
app.use('/', indexRoute);
app.use('/users', usersRoute);

//SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, console.log(`Server running on PORT ${PORT}`));