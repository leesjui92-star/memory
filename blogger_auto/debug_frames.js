const { chromium } = require('playwright');
const path = require('path');
require('dotenv').config();

const BLOG_ID = process.env.BLOG_ID;

async function debugFrames() {
    const userDataDir = path.join(__dirname, 'user_data');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: true,
        viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    try {
        const listUrl = `https://www.blogger.com/blog/posts/${BLOG_ID}`;
        await page.goto(listUrl, { waitUntil: 'load' });
        await page.waitForTimeout(5000);

        // Click New Post
        await page.evaluate(() => {
            const el = Array.from(document.querySelectorAll('div[role="button"], button, span')).find(e => e.innerText.includes('새 글') || e.innerText.includes('New post'));
            if (el) el.click();
        });

        await page.waitForTimeout(10000);

        const frames = page.frames();
        console.log(`Total frames: ${frames.length}`);
        for (let i = 0; i < frames.length; i++) {
            const f = frames[i];
            const url = f.url();
            const name = f.name();
            const isVisible = await f.evaluate(() => document.body ? document.body.offsetHeight > 0 : false).catch(() => false);
            console.log(`Frame ${i}: name="${name}", url="${url.substring(0, 50)}...", visible=${isVisible}`);
            if (isVisible) {
                const bodyHtml = await f.evaluate(() => document.body.innerHTML.substring(0, 100)).catch(() => "");
                console.log(`  Body start: ${bodyHtml}`);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await context.close();
    }
}

debugFrames();
