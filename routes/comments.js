var express =   require("express");
var router  =   express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware  =   require("../middleware/");

// All routes prepended with /campgrounds/:id/comments

// NEW COMMENT ROUTE
router.get("/new", middleware.isLoggedIn, function(req,res) {
    Campground.findById(req.params.id, function(err,campground) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

// COMMENT CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req,res) {
    // look up campground by id
    Campground.findById(req.params.id, function(err,campground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // create new comment
            Comment.create(req.body.comment, function(err,comment) {
                if(err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    // add username and ID to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    // redirect to campground show page
                    req.flash("success", "Comment added");
                    res.redirect("/campgrounds/" + campground._id);
                }
            })
        }
    });
});

// Comment EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req,res) {
    // Make sure campground in :id exists
    Campground.findById(req.params.id, function(err,foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        }
        // There is a campground, so get the comment to edit
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment });
            }
        });
    });
});

// Comment UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req,res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment) {
        if(err) {
            req.flash("error", "Something went wrong");
            res.redirect("back");
        } else {
            req.flash("success", "Comment edited");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// Comment DELETE route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        }
        req.flash("success", "Comment deleted");
        res.redirect("/campgrounds/" + req.params.id);
    })
});

module.exports = router;
