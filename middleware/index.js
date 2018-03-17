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
        if(foundService.author.id.equals(req.user._id) || req.user.isAdmin) {
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
        if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
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
    if(req.user.isServiceProvider || req.user.isAdmin) {
      return next();
    }

    if(req.user.isCustomer) {
      req.flash("error", "You have a customer account, which means that you cannot add services.");
      return res.redirect("/login");
    }
  }
  req.flash("error", "You are not logged in, please log in.");
  res.redirect("/login");
}

middlewareObj.isLoggedInReviews = function(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.isCustomer || req.user.isAdmin) {
      return next();
    }

    if(req.user.isServiceProvider) {
      req.flash("error", "You are not allowed to add a review. Only customer accounts can add reviews.");
      return res.redirect("/login");
    }
  }
  req.flash("error", "You need to be logged in first. Please log in.");
  res.redirect("/login");
}


module.exports = middlewareObj
