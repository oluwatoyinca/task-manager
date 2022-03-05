const mongoose = require('mongoose')
const validator = require('validator')

const tokenSchema = new mongoose.Schema({
    owner : { 
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User' 
    },
    createdAt: {
      type: Date,
      expires: 60*60*24*7,
      default: Date.now
    },
    token: {
        type: String,
        required: true
    }
})

const Token = mongoose.model('Token', tokenSchema)

module.exports= {Token}