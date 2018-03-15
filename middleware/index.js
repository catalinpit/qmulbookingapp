var Service = require("../models/service"),
    Review  = require("../models/review");

// all the middlware
var middlewareObj = {};

// middleware to check if the user owns the service
middlewareObj.checkServiceOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {
    Service.findById(req.params.id, function(err, foundService) {
      if(err) {
        req.flash("error", "Service not found.");
        console.log(err);
        res.redirect("back");
      } else {
        // does the user own the service
        if(foundService.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You are not allowed to do that.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in first. Please login.");
    res.redirect("/login");
  }
}

// middleware to check if the user owns the review
middlewareObj.checkReviewOwnership = function(req, res, next) {
  if(req.isAuthenticated()) {
    Review.findById(req.params.review_id, function(err, foundReview) {
      if(err || !foundReview) {
        req.flash("error", "Review not found.");
        console.log(err);
        res.redirect("back");
      } else {
        // does the user own the service
        if(foundReview.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You are not allowed to do that.");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in first. Please login.")
    res.redirect("/login");
  }
}

// middleware to check if the user is logged in
middlewareObj.isLoggedIn = function(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in first. Please log in.");
  res.redirect("/login");
}


module.exports = middlewareObj
