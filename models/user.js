const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  plantingZone: String,
  userGarden: [
    {
      name: String,
      datePlanted: String
    }
  ]
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email'});


const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(user);
}


module.exports = { User, validate: validateUser };
