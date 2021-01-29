const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app.js')
const Task = require('../src/models/task');
const { userOne, userTwo, taskOne, setUpDatabase } = require('./fixtures/db');

beforeEach(setUpDatabase)

afterAll(async () => {
    await mongoose.connection.close()
})

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should return all tasks by user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Should not delete tasks from other users', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('User should delete task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})