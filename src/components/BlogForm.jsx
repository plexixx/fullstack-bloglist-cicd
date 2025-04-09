import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogForm = ({ createNewBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleTitleChange = (event) => {
    setTitle(event.target.value)
  }

  const handleAuthorChange = (event) => {
    setAuthor(event.target.value)
  }

  const handleUrlChange = (event) => {
    setUrl(event.target.value)
  }

  const addBlog = (event) => {
    event.preventDefault()
    const blogObject = {
      title: title,
      author: author,
      url: url
    }
    createNewBlog(blogObject)
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <form onSubmit={addBlog}>
      <div>
        title:
        <input
          data-testid='title'
          type="text"
          value={title}
          name="Title"
          onChange={handleTitleChange}
          placeholder='Title'
        />
      </div>
      <div>
        author:
        <input
          data-testid='author'
          type="text"
          value={author}
          name="Author"
          onChange={handleAuthorChange}
          placeholder='Author'
        />
      </div>
      <div>
        url:
        <input
          data-testid='url'
          type="text"
          value={url}
          name="Url"
          onChange={handleUrlChange}
          placeholder='Url'
        />
      </div>
      <button type="submit">create</button>
    </form>
  )
}

BlogForm.propTypes = {
  createNewBlog: PropTypes.func.isRequired
}

export default BlogForm