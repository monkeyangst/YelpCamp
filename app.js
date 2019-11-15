// Variable Declarations
var express         =   require("express"),
    app             =   express(),
    bodyParser      =   require("body-parser"),
    mongoose        =   require("mongoose"),
    passport        =   require("passport"),
    flash           =   require("connect-flash"),
    localStrategy   =   require("passport-local"),
    methodOverride  =   require("method-override"),
    Campground      =   require("./models/campground"),
    Comment         =   require("./models/comment"),
    User            =   require("./models/user"),
    seedDB          =   require("./seeds");

var commentRoutes       =   require("./routes/comments"),
    campgroundRoutes    =   require("./routes/campgrounds"),
    indexRoutes         =   require("./routes/index");

// App Setup
mongoose.connect(process.env.DATABASEURL, {
    useNewUrlParser: true ,
    useUnifiedTopology: true,
    useFindAndModify: false
});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// Passport Configuration
app.use(require("express-session")({
    secret: "flooble-flooble-flooble",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Seed initial data
//seedDB();

// Pass currentUser to all templates
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// Routes
app.use(indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

// Server
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The YelpCamp server has started on port " + this.address().port);
});
