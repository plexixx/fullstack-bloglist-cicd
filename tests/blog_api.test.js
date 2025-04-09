const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const crypto = require('crypto')
const supertest = require('supertest')
const app = require('../app')
const { url } = require('node:inspector')
const listHelper = require('../utils/list_helper')

const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')

let header = {}

beforeEach(async () => {
  const response = await api
    .post('/api/login')
    .send({ username: 'root', password: 'sekret' })
    .expect(200)
  header = { 'Authorization': `Bearer ${response.body.token}` }

  await Blog.deleteMany({})
  await api
    .post('/api/blogs')
    .send(helper.initialBlogs[0])
    .set(header)
    .expect(201)
  await api
    .post('/api/blogs')
    .send(helper.initialBlogs[1])
    .set(header)
    .expect(201)
})

describe('when there is initially some blogs saved', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier property of the blog posts is named id', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect(response => {
        response.body.forEach(blog => {
          assert.notEqual(blog.id, undefined)
          assert.equal(blog._id, undefined)
        })
      })
  })

  describe('addition of a new blog', () => {
    test ('a valid blog can be added', async () => {
      const newBlog = {
        title: crypto.randomBytes(20).toString('hex'),
        author: crypto.randomBytes(20).toString('hex'),
        url: 'http://'.concat(crypto.randomBytes(20).toString('hex'), '.com'),
        likes: Math.floor(Math.random() * 100)
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .set(header)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs').expect(200)
      const lastBlog = response.body[response.body.length - 1]
      assert.strictEqual(lastBlog.title, newBlog.title)
      assert.strictEqual(lastBlog.author, newBlog.author)
      assert.strictEqual(lastBlog.url, newBlog.url)
      assert.strictEqual(lastBlog.likes, newBlog.likes)
    })

    test('if the likes property is missing from the request, it will default to the value 0', async () => {
      const newBlog = {
        title: crypto.randomBytes(20).toString('hex'),
        author: crypto.randomBytes(20).toString('hex'),
        url: 'http://'.concat(crypto.randomBytes(20).toString('hex'), '.com')
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .set(header)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs').expect(200)
      const lastBlog = response.body[response.body.length - 1]
      assert.strictEqual(lastBlog.likes, 0)
    })

    test('if the title and url properties are missing from the request data, \
      the backend responds to the request with the status code 400 Bad Request', async () => {
      const blogWithoutTitle = {
        author: crypto.randomBytes(20).toString('hex'),
        url: 'http://'.concat(crypto.randomBytes(20).toString('hex'), '.com')
      }
      const blogWithoutUrl = {
        title: crypto.randomBytes(20).toString('hex'),
      }

      await api
        .post('/api/blogs')
        .send(blogWithoutTitle)
        .expect(400)
        .set(header)
      await api
        .post('/api/blogs')
        .send(blogWithoutUrl)
        .expect(400)
        .set(header)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      console.log('blogToDelete:', blogToDelete)

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set(header)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
    })
  })

  describe('updating a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedBlog = {
        likes: blogToUpdate.likes + 1
      }
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)
        .set(header)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})