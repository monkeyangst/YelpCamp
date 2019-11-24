var express =   require("express");
var router  =   express.Router();
var Campground = require("../models/campground");
var middleware  =   require("../middleware/");

var NodeGeocoder = require("node-geocoder");

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

// All routes prepended with /campgrounds

// INDEX route - show all campgrounds
router.get("/",  function(req,res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    // get campgrounds that match search query
    Campground.find({ name: regex }, function(err,foundCampgrounds) {
        if (err) {
            console.log(err);
        } else {
          if (foundCampgrounds.length < 1) {
            res.render("campgrounds/index", {
              page: 'campgrounds',
              campgrounds: [],
              notFound: 'No Campgrounds found that match that criteria'
            });
          } else {
            res.render("campgrounds/index", {
              page: 'campgrounds',
              campgrounds: foundCampgrounds,
              notFound: false
            });

          }

        }
    });
  } else {
    // get all campgrounds from db
    Campground.find({}, function(err,allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {
              page: 'campgrounds',
              campgrounds: allCampgrounds,
              notFound: false
            });
        }
    });
  }
});

// NEW route - display new-campground form
router.get("/new", middleware.isLoggedIn, function(req,res) {
    res.render("campgrounds/new");
});

// CREATE route - add new campground to db
 router.post("/", middleware.isLoggedIn, async function(req,res) {
    console.log('READY TO CREATE CAMPGOUND');
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
    let data = await geocoder.geocode(req.body.location);
    console.log("GOT GEOCODING DATA BACK");
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground =
        {
            name: name,
            price: price,
            image: image,
            description: desc,
            author: author,
            location: location,
            lat: lat,
            lng: lng
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
    // geocode the location info
    geocoder.geocode(req.body.location, function(err, data) {
        if (err || !data.length) {
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;
