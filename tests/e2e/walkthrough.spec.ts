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
    // aiming is re-evaluated every frame; on a slow CPU renderer give each press a frame to land
    await expect
      .poll(
        async () => {
          await page.keyboard.press('KeyE');
          return page.evaluate(() => (window as unknown as { __qa: QA }).__qa.flow.phase);
        },
        { timeout: 60_000, intervals: [1000] },
      )
      .toBe('explore');
    // software rendering in CI is slow, so keep walking until the player is inside (or time out)
    const z = async () => page.evaluate(() => (window as unknown as { __qa: QA }).__qa.player.position.z);
    // CI grants pointer lock, so stray mouse events can turn the view; face the doorway straight on
    await page.evaluate(() => {
      const p = (
        window as unknown as { __qa: { player: { teleport: (x: number, z: number, yaw: number) => void } } }
      ).__qa.player;
      p.teleport(-2.6, 6.4, 0);
    });
    await page.keyboard.down('KeyW');
    try {
      await expect.poll(z, { timeout: 120_000, intervals: [500] }).toBeLessThan(4.5);
    } catch (e) {
      // print what blocked the player, so a CI-only failure can be diagnosed from the log
      const state = await page.evaluate(() => {
        const q = (window as unknown as { __qa: Record<string, unknown> }).__qa as {
          player: { position: { x: number; z: number } };
          doorOpen: () => boolean;
          col: { group: { children: { position: { x: number; z: number }; userData: object }[] } };
        };
        return {
          x: q.player.position.x,
          z: q.player.position.z,
          doorOpen: q.doorOpen(),
          blockersNearDoor: q.col.group.children
            .filter((c) => Math.abs(c.position.z - 5.1) < 0.3)
            .map((c) => ({ x: c.position.x, z: c.position.z, ud: c.userData })),
        };
      });
      console.log('DIAG', JSON.stringify(state));
      throw e;
    }
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
