var express     = require("express"),
    router      = express.Router(),
    Service     = require("../models/service"),
    Review      = require("../models/review"),
    middleware  = require("../middleware/index");

// add a new review
router.get("/services/:id/reviews/new", middleware.isLoggedIn, function(req, res) {
  Service.findById(req.params.id, function(err, service) {
    if(err) {
      console.log(err);
    } else {
        res.render("reviews/new", {service: service});
    }
  });
});

// add a new review
router.post("/services/:id/reviews", middleware.isLoggedIn, function(req, res) {
  Service.findById(req.params.id, function(err, service) {
    if(err) {
      console.log(err);
      res.redirect("/services")
    } else {
      Review.create(req.body.review, function(err, review) {
        if(err) {
          req.flash("error", "Something went wrong...");
          console.log(err);
        } else {
          // add username and id to comment
          review.author.id = req.user._id;
          review.author.username = req.user.username;

          // save comment
          review.save();

          // push the review to the service
          service.reviews.push(review);
          service.save();
          req.flash("success", "You successfully added the review.");
          res.redirect("/services/" + service._id);
        }
      })
    }
  });
});

// edit a specific a review
router.get("/services/:id/reviews/:review_id/edit", middleware.checkReviewOwnership, function(req, res) {
  Service.findById(req.params.id, function(err, foundService) {
    if(err || !foundService) {
      req.flash("error", "No service found.");
      res.redirect("back");
    }

    Review.findById(req.params.review_id, function (err, foundReview) {
      if(err) {
        res.redirect("back");
      } else {
        res.render("reviews/edit", {service_id: req.params.id, review: foundReview});
      }
    });
  });
});

// review update
router.put("/services/:id/reviews/:review_id", middleware.checkReviewOwnership, function(req, res) {
  Review.findByIdAndUpdate(req.params.review_id, req.body.review, function(err, updatedReview) {
    if(err) {
      res.redirect("back");
    } else {
      res.redirect("/services/" + req.params.id);
    }
  });
});

// delete a specific review
router.delete("/services/:id/reviews/:review_id", middleware.checkReviewOwnership, function(req, res) {
  Review.findByIdAndRemove(req.params.review_id, function(err) {
    if(err) {
      res.redirect("back");
    } else {
      req.flash("success", "Review deleted.");
      res.redirect("/services/" + req.params.id);
    }
  });
});

module.exports = router;
