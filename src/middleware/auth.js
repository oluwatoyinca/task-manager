const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Token = require('../models/token')

// This is auth middleware for confirming token so will be called as the second parameter in the ../routers/user
// under GET user/me, POST user/logout, POST user/logoutAll
const auth = async (req, res, next) => {
   try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.User.findOne({_id: decoded._id})
        if(!user){
            throw new Error()
        }
        else{
            const tokener = await Token.Token.findOne({owner: decoded._id, token})

            if(!tokener) {
                throw new Error()
            }
    
            req.token = token
            req.user = user
            next()
        }
   } catch(e) {
       res.status(401).send({error: 'Please Authenticate.'})
   }
}

module.exports = {auth}