import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'



const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [blogFormVisible, setBlogFormVisible] = useState(false)
  const [refreshBlog, setRefreshBlog] = useState(false)

  useEffect(() => {
    blogService.getAll().then(blogs => {
      blogs.sort((a,b) => b.likes - a.likes)
      setBlogs( blogs )
    })
  }, [refreshBlog])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const hideWhenVisible = { display: blogFormVisible ? 'none' : '' }
  const showWhenVisible = { display: blogFormVisible ? '' : 'none' }

  const addBlog = (blogObject) => {
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setRefreshBlog(!refreshBlog)
        setSuccessMessage(`a new blog ${returnedBlog.title} by ${returnedBlog.author} added`)
        setTimeout(() => {
          setSuccessMessage(null)
        }, 5000)
        setBlogFormVisible(false)
      })
  }

  const updateBlog = (id, blogObject) => {
    blogService
      .update(id, blogObject)
      .then(() => {
        setRefreshBlog(!refreshBlog)
      })
  }

  const deleteBlog = (id) => {
    blogService
      .remove(id)
      .then(() => {
        setRefreshBlog(!refreshBlog)
      })
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })
      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong username or password')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }


  if (user === null) {
    return (
      <div>
        <h2>log in to application</h2>
        <Notification message={errorMessage} className={'error'} />
        <form onSubmit={handleLogin}>
          <div>
            username
            <input
              data-testid='username'
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
            <input
              data-testid='password'
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }
  return (
    <div>
      <h2>blogs</h2>
      <Notification message={successMessage} className={'success'} />
      <p> {user.name} logged in </p>
      <button onClick={handleLogout}>logout</button>
      <br />
      <div style={hideWhenVisible}>
        <button onClick={() => setBlogFormVisible(true)}>new blog</button>
      </div>
      <div style={showWhenVisible}>
        <h2>create new</h2>
        <BlogForm
          createNewBlog={addBlog}
        />
        <button onClick={() => setBlogFormVisible(false)}>cancel</button>
      </div>
      {blogs.map(blog =>
        <Blog key={blog.id}
          blog={blog}
          updateBlog={updateBlog}
          deleteBlog={deleteBlog}
          user={user}/>
      )}
    </div>
  )
}

export default App