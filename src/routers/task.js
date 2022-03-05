const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth.auth, async (req, res) => {
    const task = new Task.Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

//GET /tasks?completed=true will be used to pass completed value to filter by
//GET /taks?limit is used to limit the number of results that show per page
//GET /taks?skip is used to skip over some results to show a certain point of page. skip should be in multiples of limit to skip pages
//GET /tasks?limit=10&skip=10 will show 10 results per page and will skip 10 results to show the second page
//GET /tasks?sortBy=createdAt:asc can be used to sort createdAt column in asc. The ':' is for splitting the string. 'desc' should be used for descending
router.get('/tasks', auth.auth, async (req, res) => {
    const match = {}
    const sort = {}
    var skip = 0
    var limit = 0

    if(req.query.skip && parseInt(req.query.skip) > 0) {
        skip = parseInt(req.query.skip)
    }

    if(req.query.limit && parseInt(req.query.limit) > 0) {
        limit = parseInt(req.query.limit)
    }

    if(req.query.completed) {
        // The trinary operator below is used as a mini if else statement. by default, if condition is true, 
        // it returns true if not it returns false
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        // the trinary operator below is used as a mini if else statement. if condition is true, '-1' is returned, if not, it returns '1'
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            // match below is used to narrow down of filter the kind of tasks we call. match was defined above
            match,
            // options below is used to sort and get pagination done
            options: {
                limit,
                skip,
                //when sorting, 1 signifies asc while -1 signiies desc. sort was defined above
                sort
            }
        })
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send(e.message)
    }
})

router.get('/tasks/:id', auth.auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.Task.findOne({_id, owner: req.user._id})
        if(!task) {
            return res.status(404).send('No such task')
        }
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth.auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValid = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValid) {
        return res.status(400).send({error: 'Invalid Update'})
    }

    try {

        const task = await Task.Task.findOne({_id: req.params.id, owner: req.user._id})

        if(!task) {
            return res.status(404).send('This task does not exist')
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()

        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth.auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.Task.findOneAndDelete({_id, owner: req.user._id})

        if(!task) {
            return res.status(404).send('This task does not exist')
        }
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

module.exports = {router}