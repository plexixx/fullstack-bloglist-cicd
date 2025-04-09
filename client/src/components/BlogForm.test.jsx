import React from 'react'
import '@testing-library/jest-dom'
import { assert, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('submitting the form calls the event handler with the right details', async () => {
  const createNewBlog = vi.fn()
  const user = userEvent.setup(render(<BlogForm createNewBlog={createNewBlog} />))
  const title = screen.getByPlaceholderText('Title')
  const author = screen.getByPlaceholderText('Author')
  const url = screen.getByPlaceholderText('Url')
  await user.type(title, 'Component testing is done with react-testing-library')
  await user.type(author, 'Test Author')
  await user.type(url, 'http://test.com')
  await user.click(screen.getByText('create'))
  expect(createNewBlog.mock.calls).toHaveLength(1)
  //console.log(createNewBlog.mock.calls)
  expect(createNewBlog.mock.calls[0][0].title).toBe('Component testing is done with react-testing-library')
  expect(createNewBlog.mock.calls[0][0].author).toBe('Test Author')
  expect(createNewBlog.mock.calls[0][0].url).toBe('http://test.com')
})