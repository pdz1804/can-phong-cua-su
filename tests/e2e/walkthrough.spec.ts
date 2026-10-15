import { expect, test } from '@playwright/test';

type QA = {
  player: { position: { x: number; z: number } };
  flow: { phase: string };
  use: (id: string) => void;
};

test('lobby → door → walk into the room → read a memory, with no page errors', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // CI renders on the CPU, so use the light graphics preset to keep the frame rate usable
  await page.addInitScript(() => localStorage.setItem('su-settings', JSON.stringify({ quality: 'low' })));
  await page.goto('/#qa');
  await expect(page.locator('#lobby')).toBeVisible({ timeout: 60_000 });
  await page.locator('#weather label', { hasText: 'Hoàng hôn' }).click();
  await expect(page.locator('input[value=sunset]')).toBeChecked();
  await page.locator('#startBtn').click();
  await expect(page.locator('#crosshair')).toBeVisible();

  if (info.project.name === 'desktop') {
    await page.keyboard.down('KeyW');
    await expect(page.locator('#prompt')).toContainText('Mở cửa', { timeout: 60_000 });
    await page.keyboard.up('KeyW');
    await page.keyboard.press('KeyE');
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __qa: QA }).__qa.flow.phase))
      .toBe('explore');
    // software rendering in CI is slow, so keep walking until the player is inside (or time out)
    const z = async () => page.evaluate(() => (window as unknown as { __qa: QA }).__qa.player.position.z);
    await page.keyboard.down('KeyW');
    await expect.poll(z, { timeout: 120_000, intervals: [500] }).toBeLessThan(4.5);
    await page.keyboard.up('KeyW');
    expect(await z()).toBeGreaterThan(-4.8); // never through the back wall
    await page.evaluate(() => (window as unknown as { __qa: QA }).__qa.use('t0725'));
    await expect(page.locator('#letter')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#letterTitle')).toHaveText('Ngày anh tỏ tình');
    await page.locator('#letterClose').click();
    await expect(page.locator('#letter')).toBeHidden({ timeout: 30_000 });
  }
  expect(errors).toEqual([]);
});
