import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, updateBlog, deleteBlog, user }) => {
  const [blogDetailsVisible, setBlogDetailsVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const hideWhenVisible = { display: blogDetailsVisible ? 'none' : '' }
  const showWhenVisible = { display: blogDetailsVisible ? '' : 'none' }

  const updateLikes = (event) => {
    event.preventDefault()
    const updatedBlog = {
      title: blog.title,
      author: blog.author ? blog.author : undefined,
      url: blog.url,
      likes: blog.likes + 1
    }
    updateBlog(blog.id, updatedBlog)
  }

  const removeBlog = (event) => {
    event.preventDefault()
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      deleteBlog(blog.id)
    }
  }

  return (
    <div style={blogStyle} className='blog'>
      <div>
        <div style={hideWhenVisible} className='whenHidden'>
          {blog.title} {blog.author}
          <button onClick={() => setBlogDetailsVisible(true)}>view</button>
        </div>
        <div style={showWhenVisible} className='whenShown'>
          {blog.title} {blog.author}
          <p>{blog.url}</p>
          <p>
            likes {blog.likes} <button onClick={updateLikes}>like</button>
          </p>
          <p>{blog.user.name}</p>
          {blog.user.username === user.username ?
            <p> <button onClick={removeBlog}>remove</button> </p>
            : null}
          <button onClick={() => setBlogDetailsVisible(false)}>hide</button>
        </div>
      </div>
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.object.isRequired,
  updateBlog: PropTypes.func.isRequired,
  deleteBlog: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired
}

export default Blog