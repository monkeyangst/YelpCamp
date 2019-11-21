var express     =   require("express"),
    router      =   express.Router(),
    passport    =   require("passport"),
    User        =   require("../models/user");

// Root route
router.get("/", function(req,res) {
    res.render("landing");
});

//-------------------
// AUTHENTICATION ROUTES
//-------------------

// show register form
router.get("/register", function(req,res) {
    res.render("register", {page: 'register'});
});
//signup logic
router.post("/register", function(req,res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err,user) {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Welcome to YelpCamp, " + user.username + "! Thanks for signing up!");
            res.redirect("/campgrounds");
        });
    });
});

// show login form
router.get("/login", function(req,res) {
    res.render("login", {page: 'login'});
});

// login logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "Welcome, camper!"
    }), function(req,res) {
        // This should never be hit
});

// LOGOUT ROUTE
router.get("/logout", function(req,res) {
    req.logout();
    req.flash("success", "Logged you out.");
    res.redirect("/campgrounds");
})

// MIDDLEWARE
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router;
