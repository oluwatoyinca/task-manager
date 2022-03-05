const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Token = require('../../src/models/token')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Toyin',
    email: 'alexandradonalds@gmail.coma',
    password: 'Oluwatoyin'
}
const userOneToken = {
    owner: userOneId,
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Boze',
    email: 'alexandradonalds@gmail.comss',
    password: 'Oluwatoyin1'
}
const userTwoToken = {
    owner: userTwoId,
    token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First Task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second Task',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third Task',
    completed: true,
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.User.deleteMany()
    await Token.Token.deleteMany()
    await Task.Task.deleteMany()
    await new User.User(userOne).save()
    await new User.User(userTwo).save()
    await new Task.Task(taskOne).save()
    await new Task.Task(taskTwo).save()
    await new Task.Task(taskThree).save()
    await new Token.Token(userOneToken).save()
    await new Token.Token(userTwoToken).save()
}

module.exports = {
    userOneId,
    userOne,
    userOneToken,
    userTwoId,
    userTwo,
    userTwoToken,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}