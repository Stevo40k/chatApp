import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Simple Chat App/);
});

test('can send a message', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('input[placeholder="Type a message..."]');
  await input.fill('E2E Hello');
  await page.click('button:has-text("Send")');
  
  const message = page.locator('.message.own .content');
  await expect(message).toContainText('E2E Hello');
});
