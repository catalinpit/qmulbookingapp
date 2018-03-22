var express     = require("express"),
    router      = express.Router(),
    Service     = require("../models/service"),
    paypal      = require("paypal-rest-sdk"),
    middleware  = require("../middleware");

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AbDmll1Dso9HWV62exqxJtV6fHYRxs8EMTkbR323GXUGfId7sBsrLSI4PEkfCIBqfJb4W4BhtfeKfduV',
  'client_secret': 'ELTkU_SB5592CBLQh4meKOgx60PO80-wrLwAqig8j3CzsW5T9ynijQE6w1d1HPmMFyoCeJ7Pd83myeMN'
});

// display all services available
router.get("/services", function(req, res) {
  var noMatch = null;
  if(req.query.search) {
    var regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Service.find({name: regex}, function(err, services) {
      if(err) {
        console.log(err);
      } else {
        if(services.length < 1) {
          noMatch = "No services match that query, please try again.";
        }
        res.render("services/homepage", {services: services, noMatch: noMatch});
      }
    });
  } else {
    // Retrieve all the services
    Service.find({}, function(err, services){
      if(err) {
        console.log(err);
      } else {
        res.render("services/homepage", {services: services, noMatch: noMatch});
      }
    });
  }
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
    } else {
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

// Paypal payment route
router.post("/services/:id/pay", function(req, res) {
  Service.findById(req.params.id, function(err, foundService) {
    if(err) {
      console.log(err);
    } else {
      var create_payment_json = {
          "intent": "sale",
          "payer": {
              "payment_method": "paypal"
          },
          "redirect_urls": {
              "return_url": "http://localhost:3000/services/" + foundService.id + "/success",
              "cancel_url": "http://localhost:3000/services/" + foundService.id + "/cancel"
          },
          "transactions": [{
              "item_list": {
                  "items": [{
                      "name": foundService.name,
                      "sku": foundService.id,
                      "price": foundService.price,
                      "currency": "GBP",
                      "quantity": 1
                  }]
              },
              "amount": {
                  "currency": "GBP",
                  "total": foundService.price
              },
              "description": foundService.description
          }]
    };

    // create Paypal payment
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
            console.log(error);
        } else {
          for(var i = 0; i < payment.links.length; i++)
          {
            if(payment.links[i].rel === 'approval_url'){
              res.redirect(payment.links[i].href);
            }
          }
          console.log(payment);
        }
    });
    }
  })
});

router.get("/services/:id/success", function(req, res) {
  Service.findById(req.params.id, function(err, foundService) {
    if(err) {
      console.log(err);
    } else {
      var payerId = req.query.PayerID;
      var paymentId = req.query.paymentId;

      console.log(payerId);
      console.log(paymentId);

      var execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "GBP",
                "total": foundService.price
            }
        }]
      }

      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log("Get Payment Response");
          console.log(JSON.stringify(payment));
          req.flash("success", "We received your payment, thank you!");
          res.redirect("/services/" + foundService.id);
        }
      });
    }
  });
});

router.get("/services/:id/cancel", function(req, res) {
  Service.findById(req.params.id, function(err, foundService) {
    if(err) {
      req.flash("error", err);
      console.log(err);
    } else {
    req.flash("error", "The payment did not go through. Please retry.");
    res.redirect("/services/" + foundService.id)
    }
  })
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");
}

module.exports = router;
