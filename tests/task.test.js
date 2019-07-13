const request  = require('supertest');
const app      = require('../src/app.js');
const Task     = require('../src/models/task.js');
const {
    userOne,
    userTwo,
    taskTwo,
    refreshDb
} = require('./fixtures/db.js');

beforeEach(refreshDb);

test('Must create a new task', async () => {
    let res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Learn git commands'
        })
        .expect(201);

    let task = await Task.findById(res.body._id);

    expect(task).not.toBeNull();
    expect(task.completed).toBe(false);
});

test('Must read a user\'s tasks ', async () => {
    let res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    let tasks = res.body;

    expect(tasks.length).toBe(2);
});

test('Must not delete a wrong user\'s task', async () => {
    await request(app)
        .delete(`/tasks/${taskTwo._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    let task = await Task.findById(taskTwo._id);

    expect(task).not.toBeNull();
});