import { test, expect } from '@playwright/test'

test('submit message (mocked backend)', async ({ page }) => {
  // Intercept GET /api/messages to return empty list
  await page.route('**/api/messages', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
      return
    }

    if (request.method() === 'POST') {
      const postBody = await request.postDataJSON()
      const created = { id: '1', text: postBody.text }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      })
      return
    }

    await route.continue()
  })

  await page.goto('/')

  await expect(page.locator('h1')).toHaveText(/message board/i)

  await page.fill('input[placeholder="Írj egy üzenetet..."]', 'Playwright E2E')
  await page.click('button:has-text("Küldés")')

  // After the mocked POST returns the created message, it should appear in the list
  await expect(page.locator('li', { hasText: 'Playwright E2E' })).toBeVisible()
})
