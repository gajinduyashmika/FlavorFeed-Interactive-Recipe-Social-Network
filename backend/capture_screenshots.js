import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Home Feed
  console.log('Capturing 01_home_feed.png...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '01_home_feed.png') });

  // 2. Recipe Detail Hero
  console.log('Capturing 02_recipe_detail_hero.png...');
  await page.goto('http://localhost:5173/recipe/6aa90a76a9032f8c9a3a178d', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.action-toolbar', { timeout: 8000 });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '02_recipe_detail_hero.png') });

  // 3. Recipe Servings Scaler & Checklist (Scroll down)
  console.log('Capturing 03_recipe_servings_scaler.png...');
  await page.evaluate(() => {
    const el = document.querySelector('.recipe-recipe-grid');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    const plusBtn = document.querySelector('.counter-btn:last-child');
    if (plusBtn) {
      plusBtn.click();
      plusBtn.click();
    }
    const firstIng = document.querySelector('.ingredient-item');
    if (firstIng) firstIng.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '03_recipe_servings_scaler.png') });

  // 4. Cook Mode Modal Active
  console.log('Capturing 04_cook_mode_active.png...');
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const btn = document.querySelector('.cook-mode-launch-btn');
    if (btn) btn.click();
  });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '04_cook_mode_active.png') });

  // 5. Cook Mode Completed Celebration
  console.log('Capturing 05_cook_mode_completed.png...');
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => {
      const nextBtn = document.querySelector('.cook-footer .btn-primary');
      if (nextBtn) nextBtn.click();
    });
    await sleep(350);
  }
  await sleep(600);
  await page.screenshot({ path: path.join(outDir, '05_cook_mode_completed.png') });

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.click();
  });
  await sleep(500);

  // 6. Login Page
  console.log('Capturing 08_auth_login.png...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '08_auth_login.png') });

  // Login as Chef Kasun
  await page.evaluate(() => {
    const btn = document.querySelector('.demo-chef-btn');
    if (btn) btn.click();
  });
  await sleep(1200);

  // 7. Create Recipe Page
  console.log('Capturing 06_create_recipe.png...');
  await page.goto('http://localhost:5173/create-recipe', { waitUntil: 'networkidle0' });
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, '06_create_recipe.png') });

  // 8. Profile Page
  console.log('Capturing 07_foodie_profile.png...');
  await page.goto('http://localhost:5173/profile/6aa90a75a9032f8c9a3a1787', { waitUntil: 'networkidle0' });
  await sleep(1000);
  await page.screenshot({ path: path.join(outDir, '07_foodie_profile.png') });

  console.log('All 8 high-res screenshots captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
