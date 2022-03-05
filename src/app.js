const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
//all the routes from routers/user.js and routers/task.js
app.use(userRouter.router)
app.use(taskRouter.router)

module.exports = app