var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  email: {type: String, unique: true},
  phone: {type: String},
  cart: Array,
  address: {
    street: {type: String, trim: true},
    unit: String,
    city: String,
    state: String,
    zip: Number
  },
  farmer: Number,
  favorites: Array,
  hash: String,
  salt: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default:Date.now }
});

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  return jwt.sign({
    _id: this._id,
    username: this.username,
    email: this.email,
    phone: this.phone,
    address: this.address,
    farmer: this.farmer,
    cart: this.cart,
    favorites: this.favorites,
    exp: parseInt(exp.getTime() / 1000),
  }, process.env.JWT_SECRECT);
};

UserSchema.methods.formatPhoneNumber = function(phone){
  return phone.split('-').join('').split('.').join('').split(' ').join('');
}

UserSchema.statics.search = function(term,cb){
  return this.find({ username: { "$regex": term, "$options": "i" } })
  .select('username email phone')
  .limit(10)
  .exec(cb)
}

mongoose.model('User', UserSchema);