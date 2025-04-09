import React from 'react'
import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders content before clicking view', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 0,
    user: { name: 'Test User' }
  }
  const user = {
    name: 'Test User',
    username: 'testuser'
  }
  const updateBlog = vi.fn()
  const deleteBlog = vi.fn()

  const { container } = render(<Blog blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} user={user} />)

  const div = container.querySelector('.whenHidden')
  expect(div).toHaveTextContent('Component testing is done with react-testing-library')
  expect(div).toHaveTextContent('Test Author')
  expect(div).not.toHaveTextContent('http://test.com')
  expect(div).not.toHaveTextContent('likes 0')
})

test('renders content after clicking view', () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 0,
    user: { name: 'Test User' }
  }
  const user = {
    name: 'Test User',
    username: 'testuser'
  }
  const updateBlog = vi.fn()
  const deleteBlog = vi.fn()

  const { container } = render(<Blog blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} user={user} />)

  const div = container.querySelector('.whenShown')
  expect(div).toHaveTextContent('Component testing is done with react-testing-library')
  expect(div).toHaveTextContent('Test Author')
  expect(div).toHaveTextContent('http://test.com')
  expect(div).toHaveTextContent('likes 0')
})

test('clicking the like button twice calls the event handler twice', async () => {
  const blog = {
    title: 'Component testing is done with react-testing-library',
    author: 'Test Author',
    url: 'http://test.com',
    likes: 0,
    user: { name: 'Test User' }
  }
  const userLoggedin = {
    name: 'Test User',
    username: 'testuser'
  }
  const updateBlog = vi.fn()
  const deleteBlog = vi.fn()

  const { container } = render(<Blog blog={blog} updateBlog={updateBlog} deleteBlog={deleteBlog} user={userLoggedin} />)

  const div = container.querySelector('.whenShown')
  const user = userEvent.setup(div)
  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)
  expect(updateBlog).toHaveBeenCalledTimes(2)
})