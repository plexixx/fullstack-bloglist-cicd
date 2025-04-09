const _ = require('lodash')
const blog = require('../models/blog')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const indexOfFavoriteBlog = blogs.reduce((maxIndex, current, currentIndex, blog) => current.likes > blog[maxIndex].likes ? currentIndex : maxIndex, 0)
  console.log('Index of Favorite Blog:', indexOfFavoriteBlog)
  return ({
    title: blogs[indexOfFavoriteBlog].title,
    author: blogs[indexOfFavoriteBlog].author,
    likes: blogs[indexOfFavoriteBlog].likes
  })
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const authors = _.countBy(blogs, 'author')
  console.log('most blogs authors:', authors)
  const [author, blogsCount] = _.maxBy(_.toPairs(authors), ([, count]) => count)
  return ({
    author: author,
    blogs: blogsCount
  })
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const authors = _.mapValues(_.groupBy(blogs, 'author'), authorBlogs => _.sumBy(authorBlogs, 'likes'))
  console.log('most likes authors:', authors)
  const [author, likesCount] = _.maxBy(_.toPairs(authors), ([, count]) => count)
  return ({
    author: author,
    likes: likesCount
  })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}