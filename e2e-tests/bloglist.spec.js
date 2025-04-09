const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3001/api/testing/reset')
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Superuser',
        username: 'admin',
        password: 'admin'
      }
    })
    await page.goto('')
  })

  test('Login form is shown', async ({ page }) => {
    const locator = await page.getByText('log in to application')
    await expect(locator).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'root', 'root')
      const errorDiv = await page.locator('.error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('border-style', 'solid')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible()
    })
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Test title', 'Test author', 'www.testurl.com')
      const successDiv = await page.locator('.success')
      await expect(successDiv).toContainText('a new blog Test title by Test author added')
      await expect(successDiv).toHaveCSS('border-style', 'solid')
      await expect(successDiv).toHaveCSS('color', 'rgb(0, 128, 0)')
      const blogDiv = await page.locator('.blog').filter({ hasText: 'Test title' }).first()
      await expect(blogDiv).toContainText('Test title')
      await expect(blogDiv).toContainText('Test author')
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Test title', 'Test author', 'www.testurl.com')
      const blogDiv = await page.locator('.blog').filter({ hasText: 'Test title' }).first()
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await expect(blogDiv.getByText('likes 0')).toBeVisible()
      await blogDiv.getByRole('button', { name: 'like' }).click()
      await expect(blogDiv.getByText('likes 1')).toBeVisible()
    })

    test('a blog can be deleted', async ({ page }) => {
      await createBlog(page, 'Test title', 'Test author', 'www.testurl.com')
      const blogDiv = await page.locator('.blog').filter({ hasText: 'Test title' }).first()
      await blogDiv.getByRole('button', { name: 'view' }).click()
      page.on('dialog', dialog => dialog.accept())
      await blogDiv.getByRole('button', { name: 'remove' }).click()
      await page.reload()
      await expect(page.locator('.blog').filter({ hasText: 'Test title' })).not.toBeVisible()
    })

    test('only the user who created a blog can delete it', async ({ page }) => {
      await createBlog(page, 'Test title', 'Test author', 'www.testurl.com')
      const blogDiv = await page.locator('.blog').filter({ hasText: 'Test title' }).first()
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'admin', 'admin')
      await blogDiv.getByRole('button', { name: 'view' }).click()
      await expect(blogDiv.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })

    test('blogs are ordered by likes', async ({ page }) => {
      await createBlog(page, 'Test title 1', 'Test author 1', 'www.testurl1.com')
      await createBlog(page, 'Test title 2', 'Test author 2', 'www.testurl2.com')
      await createBlog(page, 'Test title 3', 'Test author 3', 'www.testurl3.com')

      const blog1 = page.locator('.blog').filter({ hasText: 'Test title 1' }).first()
      const blog2 = page.locator('.blog').filter({ hasText: 'Test title 2' }).first()
      const blog3 = page.locator('.blog').filter({ hasText: 'Test title 3' }).first()

      await blog1.getByRole('button', { name: 'view' }).click()
      await blog2.getByRole('button', { name: 'view' }).click()
      await blog3.getByRole('button', { name: 'view' }).click()

      await blog2.getByRole('button', { name: 'like' }).click()
      await blog2.getByRole('button', { name: 'like' }).click()
      await blog3.getByRole('button', { name: 'like' }).click()

      await page.reload()
      await page.waitForLoadState('networkidle')

      const blogs = await page.locator('.blog').all()
      const blogTexts = await Promise.all(blogs.map(async blog => {
        const text = await blog.textContent()
        return text
      }))

      expect(blogTexts[0]).toContain('Test title 2') // 2 likes
      expect(blogTexts[1]).toContain('Test title 3') // 1 like
      expect(blogTexts[2]).toContain('Test title 1') // 0 likes
    })
  })
})