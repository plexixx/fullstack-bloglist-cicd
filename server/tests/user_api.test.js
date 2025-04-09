const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const userWithSameUsername = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }
    const userWithShortUsername = {
      username: 'ro',
      name: 'Superuser',
      password: 'salainen'
    }
    const userWithShortPassword = {
      username: 'aaa',
      name: 'Superuser',
      password: 'sa'
    }
    const userWithoutUsername = {
      name: 'Superuser',
      password: 'salainen'
    }

    await api
      .post('/api/users')
      .send(userWithSameUsername)
      .expect(400)

    await api
      .post('/api/users')
      .send(userWithShortUsername)
      .expect(400)
    
    await api
      .post('/api/users')
      .send(userWithShortPassword)
      .expect(400)

    await api
      .post('/api/users')
      .send(userWithoutUsername)
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})