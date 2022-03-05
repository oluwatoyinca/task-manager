const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOne, userOneId, userOneToken, setupDatabase, userTwoToken, taskOne, taskTwo, taskThree} = require('./fixtures/db')

jest.setTimeout(20000)

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOneToken.token}`)
    .send({
        description: "Play thiufh out"
    })
    .expect(201)

    const task = await Task.Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should fetch user tasks', async () => {
    const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOneToken.token}`)
    .send()
    .expect(200)

    expect(response.body.length).toEqual(2)
})

test('Should not delete task by unauthorized user', async () => {
    const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwoToken.token}`)
    .send()
    .expect(404)

    const task = Task.Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})