const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const Token = require('../models/token')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail } = require('../emails/account')
const { sendCancelEmail } = require('../emails/account')

const upload = multer({
    limits: {
        //this restricts filesize upload. 1,000,000 = 1mb
        fileSize: 1000000 //mb
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be picture'))
        }

        cb(undefined, true)
    }
})

router.post('/users', async (req, res) => {
    const user = new User.User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name).catch(console.error)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        // findByCred below is a self-created function not from Mongoose library to search for user by email and password
        const user = await User.User.findByCred(req.body.email, req.body.password)
        await user.populate('tokens')

        // To make sure one can not log in on more than 6 devices
        if(user.tokens.length < 6) {
            // generateAuthToken is a self-created function to create and save a new token for the user on signin or login on diff device
            const token = await user.generateAuthToken()
            res.status(200).send({user, token})
        }
        else {
            res.status(400).send('You have reached max of 6 devices')
        }
    } catch(e) {
        res.status(400).send(e.message)
    }
})

router.post('/users/logout', auth.auth, async (req, res) => {
    try {
        const token = req.token
        
        await Token.Token.findOneAndDelete({owner: req.user._id, token})

        res.status(200).send('Logged Out Succcess')
    } catch(e) {
        res.status(500).send('Could not Logout')
    }
})

router.post('/users/logoutAll', auth.auth, async (req, res) => {
    try {
        await Token.Token.deleteMany({owner: req.user._id})

        res.status(200).send('Logged out all accounts')
    } catch(e) {
        res.status(500).send('Could not Logout')
    }
})

// upload.single() is a multer middleware to upload pictures to destination defined in upload
router.post('/upload/me/avatar', auth.auth, upload.single('avatar'), async (req, res) => {
    //.png() converts the file passed to .png format
    // .resize() resizes the file to the dimensions we set
    // .toBuffer() converts it to binary
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send('Avatar Uploaded')
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/me', auth.auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error('No avatar found')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send(e.message)
    }
})

// test below on the browser not postman
router.patch('/users/me', auth.auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValid = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValid) {
        return res.status(400).send({error: 'Invalid Update'})
    }

    try {
        
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()

        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth.auth, async (req, res) => {
    try {

        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name).catch(console.error)
        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.delete('/upload/me/avatar', auth.auth, async (req, res) => {
    try {
        if(!req.user.avatar)
        {
            throw new Error('No Avatar to delete')
        }
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send('Avatar Deleted')
    } catch(e) {
        res.status(400).send(e.message)
    }
})

// This route below was added to intially read all users in db and while this is no longer needed for our app, 
// it can be used in an app with SuperAdmins to view all users
// router.get('/users', async (req, res) => {
//     // User.User.find({}).then((users) => {
//     //     res.send(users)
//     // }).catch((e) => {
//     //     res.status(500).send()
//     // })

//     try {
//         const users = await User.User.find({})
//         res.send(users)
//     } catch(e) {
//         res.status(500).send(e)
//     }
// })

// This route below was added to intially call a user by id from db and while this is no longer needed for our app,
// because you should be able to call only your own details and that is done by /users/me above,
// it can be used in an app with SuperAdmins to view a particular user's detail
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     // User.User.findById(_id).then((user) => {
//     //     if(!user) {
//     //         return res.status(404).send()
//     //     }
//     //     res.send(user)
//     // }).catch((e) => {
//     //     res.status(500).send(e)
//     // })

//     try {
//         const user = await User.User.findById(_id)
//         if(!user) {
//             return res.status(404).send('This user does not exist')
//         }
//         res.send(user)
//     } catch(e) {
//         res.status(500).send(e)
//     }
// })

module.exports = {router}