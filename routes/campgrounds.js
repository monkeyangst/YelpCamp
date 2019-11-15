var express =   require("express");
var router  =   express.Router();
var Campground = require("../models/campground");
var middleware  =   require("../middleware/");

// All routes prepended with /campgrounds

// INDEX route - show all campgrounds
router.get("/", function(req,res) {
    // get all campgrounds from db
    Campground.find({}, function(err,allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

// NEW route - display new-campground form
router.get("/new", middleware.isLoggedIn, function(req,res) {
    res.render("campgrounds/new");
});

// CREATE route - add new campground to db
router.post("/", middleware.isLoggedIn, function(req,res) {
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    // save user info into new campground
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground =
        {
            name: name,
            price: price,
            image: image,
            description: desc,
            author: author
        };
    // create a new campground and save to database
    Campground.create(newCampground, function(err,newlyCreated) {
        if(err) {
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
});

// SHOW route - show one campground
router.get("/:id", function(req,res) {
    // find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res) {
    // is user logged in at all
    Campground.findById(req.params.id, function(err,foundCampground) {
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE route
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res) {
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground) {
        if (err) {
            console.log(err);
        } else {
            //redirect to Show page
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        res.redirect("/campgrounds");
    })
});


module.exports = router;
