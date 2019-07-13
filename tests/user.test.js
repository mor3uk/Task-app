const request  = require('supertest');
const app      = require('../src/app.js');
const User     = require('../src/models/user.js');
const {
    userOne,
    userOneId,
    refreshDb 
} = require('./fixtures/db.js');

beforeEach(refreshDb);

test('Must sign up a new user', async () => {
    let res = await request(app)
        .post('/users')
        .send({
            name: 'oldegs',
            email: 'oldegs2017@gmail.com',
            password: 'brhfrfcbkb',
            age: 19
        })
        .expect(201);

    let user = await User.findById(res.body.user._id);

    expect(user).not.toBeNull();
    expect(res.body).toMatchObject({
        user: {
            name: user.name,
            email: user.email
        },
        token: user.tokens[0].token
    });
    expect(user.password).not.toBe('brhfrfcbkb');
});

test('Must login an existing user', async () => {
    let res = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

    let user = await User.findById(res.body.user._id);

    expect(user.tokens[1].token).toBe(res.body.token);
});

test('Must not login a non-existing user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'dick@dick.dick',
            password: 'dickdick'
        })
        .expect(400);
});

test('Must read an authenticated user\'s profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Must not read an unauthenticated user\'s profile', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Must delete an authenticated user\'s profile', async () => {
    let res = await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
    
    let user = await User.findById(res.body._id);

    expect(user).toBeNull();
});

test('Must not delete an unauthenticated user\'s profile', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);
});

test('Must save an authenticated user\'s avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    let user = await User.findById(userOneId);

    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Must update valid user\'s fields ', async () => {
    await request(app)
        .patch(`/users/${userOneId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Danya',
            email: 'dan@ex.com'
        })
        .expect(200);

    let user = await User.findById(userOneId);

    expect(user.name).toBe('Danya');
    expect(user.email).toBe('dan@ex.com');
});

test('Must update valid user\'s fields ', async () => {
    await request(app)
        .patch(`/users/${userOneId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'dan@ex'
        })
        .expect(500);
});

test('Must not update invalid user\'s fields ', async () => {
    await request(app)
        .patch(`/users/${userOneId}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            surname: 'crazy'
        })
        .expect(400);
});