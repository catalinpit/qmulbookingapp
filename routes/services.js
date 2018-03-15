var express     = require("express"),
    router      = express.Router(),
    Service     = require("../models/service"),
    middleware  = require("../middleware");

// display all services available
router.get("/services", function(req, res) {
  Service.find({}, function(err, services){
    if(err) {
      console.log(err);
    } else {
      res.render("services/homepage", {services: services});
    }
  });
});

// add a new service to the database
router.post("/services", middleware.isLoggedIn, function(req, res) {
  // retrieve the parameters from the form
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };

  // create a new service object
  var newService = {
    name: name,
    price: price,
    description: description,
    image: image,
    author: author
  };

  // add the service to the db
  // using the newService object
  Service.create(newService, function(err, newlyCreated) {
    if(err) {
      console.log(err);
    } else {
      res.redirect("/services");
    }
  })
});

// display the form to add new campgrounds
router.get("/services/new", middleware.isLoggedIn, function(req, res) {
  res.render("services/new")
});

// display one specific service
router.get("/services/:id", function(req, res) {
  Service.findById(req.params.id).populate("reviews").exec(function(err, foundService) {
    if(err || !foundService) {
      req.flash("error", "Service not found.");
      console.log(err);
      res.redirect("/services");
    } else{
      res.render("services/show", {service: foundService});
    }
  });
});

// edit a specific service
// if it belongs to the user logged in
router.get("/services/:id/edit", middleware.checkServiceOwnership, function(req, res) {
  Service.findById(req.params.id, function(err, foundService) {
    res.render("services/edit", {service: foundService});
  });
});

// update a specific service
// if it belongs to the user logged in
router.put("/services/:id", middleware.checkServiceOwnership, function(req, res) {
  Service.findByIdAndUpdate(req.params.id, req.body.service, function(err, updatedService) {
    if(err) {
      console.log(err);
      res.redirect("/services");
    } else {
      res.redirect("/services/" + req.params.id);
    }
  })
});

// delete route
// delete specific services
router.delete("/services/:id", middleware.checkServiceOwnership, function(req, res) {
  Service.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      res.redirect("/services");
    } else {
      res.redirect("/services");
    }
  });
});

module.exports = router;
