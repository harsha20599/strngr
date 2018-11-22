const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortid = require('shortid');
const UserSchema = new Schema({
  handle : {
    type : String,
    default : shortid.generate
  },
  name : {
    type : String,
    required : true
  },
  entries : [
    {
      text : {
        type : String,
      },
      name : {
        type : String,
        default : 'Anonymous'
      }
    }
  ]
});

module.exports = User = mongoose.model('User', UserSchema);