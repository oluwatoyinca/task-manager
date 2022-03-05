const mongoose = require('mongoose')

const dbName = 'tasker'
const connectionURL = process.env.MONGODB_URL

mongoose.connect(connectionURL, {useNewUrlParser: true})
