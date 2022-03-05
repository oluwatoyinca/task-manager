const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const Token = require('../src/models/token')
const {userOne, userOneId, userOneToken, setupDatabase} = require('./fixtures/db')

jest.setTimeout(20000)

beforeEach(setupDatabase)

// afterEach(() => {
//     console.log('after each')
// })

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'alexandradonalds@gmail.com',
        password: 'Oluwatoyin'
    }).expect(201)

    // Assert that the db was changed correctly
    const user = await User.User.findById(response.body.user._id)
    // checks that the user exists and is not null
    expect(user).not.toBeNull()

    // Assertions about the response
    const tokener = await Token.Token.find({owner: response.body.user._id})
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'alexandradonalds@gmail.com'
        },
        token: tokener[0].token
    })
    expect(user.password).not.toBe('Oluwatoyin')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    // const user = await User.User.findById(response.body.user._id)
    const tokener = await Token.Token.find({owner: response.body.user._id})
    expect(response.body.token).toStrictEqual(tokener[1].token)
})

test('Should not login nonexisting user', async () => {
    await request(app)
    .post('/users/login')
    .send({
        email: 'my@gmail.coma',
        password: 'loveeeee'
    })
    .expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOneToken.token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
    const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOneToken.token}`)
    .send()
    .expect(200)

    // console.log(response.body)

    const user = await User.User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not get delete account for unauthenticated user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
    .post('/upload/me/avatar')
    .set('Authorization', `Bearer ${userOneToken.token}`)
    .attach('avatar', 'tests/fixtures/testttttt.jpg')
    .expect(200)

    const user = await User.User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOneToken.token}`)
    .send({
        name: 'James'
    })
    .expect(200)

    const user = await User.User.findById(userOneId)
    expect(user.name).toEqual('James')
})

test('Should not update invalid user fields', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOneToken.token}`)
    .send({
        locantion: 'Philadelphia'
    })
    .expect(400)
})