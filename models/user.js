var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  email: String,
  telephone: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  isCustomer: {
    type: Boolean,
    default: true
  },
  isServiceProvider: {
    type: Boolean,
    default: false
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
