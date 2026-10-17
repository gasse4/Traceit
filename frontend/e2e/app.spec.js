// Real-browser tests: the actual React app talking to the actual FastAPI backend.
import { expect, test } from "@playwright/test";

const fixture = (name) => new URL(`./fixtures/${name}`, import.meta.url).pathname;
const unique = (label) => `${label}-${test.info().project.name}-${Date.now()}`;

// Fail any test that logs a browser error or has an uncaught exception.
test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  test.info().errors_ = errors;
});
test.afterEach(async () => {
  expect(test.info().errors_, "browser console errors").toEqual([]);
});

async function fillReport(page, { name, description = "وصف تجريبي", location = "مكتبة الكلية", color = "أسود", image }) {
  await page.getByLabel("اسم العنصر").fill(name);
  await page.getByLabel("اللون").fill(color);
  await page.getByLabel("الوصف").fill(description);
  await page.getByLabel("المكان").fill(location);
  if (image) await page.getByLabel("ارفع صورة أو اسحبها هنا").setInputFiles(fixture(image));
}

async function submitReport(page, type, fields) {
  await page.goto(`/report-${type}`);
  await fillReport(page, fields);
  await page.getByRole("button", { name: "إرسال البلاغ" }).click();
  await expect(page.getByRole("status")).toContainText("تم تسجيل البلاغ رقم #");
}

async function expectNoHorizontalScroll(page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
}

// ---------- Layout & navigation ----------

test("page is Arabic RTL with title and footer notice", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/TraceIt/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("footer")).toContainText("يجب التحقق من الملكية يدويًا");
});

test("navigation highlights the active page", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("nav");
  for (const [label, path] of [["إبلاغ عن مفقود", "/report-lost"], ["إبلاغ عن موجود", "/report-found"], ["البحث", "/search"]]) {
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(nav.getByRole("link", { name: label, exact: true })).toHaveClass(/bg-ink/);
    await expect(nav.locator("a.bg-ink")).toHaveCount(1);
  }
  await nav.getByRole("link", { name: /TraceIt/ }).click();
  await expect(page).toHaveURL("/");
  await expect(nav.locator("a.bg-ink")).toHaveCount(0);
});

test("unknown URL redirects home", async ({ page }) => {
  await page.goto("/does/not/exist");
  await expect(page).toHaveURL("/");
});

test("no page scrolls sideways", async ({ page }) => {
  for (const path of ["/", "/report-lost", "/report-found", "/search", "/search?tab=image"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expectNoHorizontalScroll(page);
  }
});

// ---------- Home ----------

test("home shows stats, quick actions and recent reports", async ({ page }) => {
  const name = unique("مفتاح");
  await submitReport(page, "found", { name, image: "circle.png" });

  await page.goto("/");
  for (const label of ["إجمالي البلاغات", "بلاغات مفقودات", "بلاغات موجودات", "بلاغات بصورة"]) {
    await expect(page.getByText(label)).toBeVisible();
  }
  const card = page.locator("article", { hasText: name });
  await expect(card).toBeVisible();
  await expect(card).toContainText("موجود");
  await expect(card).toContainText("مكتبة الكلية");
  await expect(card.locator("dd").last()).not.toHaveText("—"); // date is filled in

  // Card loads the small thumbnail, and it actually renders.
  const img = card.locator("img");
  await expect(img).toHaveAttribute("src", /_thumb\.jpg$/);
  await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBeGreaterThan(0);

  await page.getByRole("link", { name: /البحث بالصورة/ }).click();
  await expect(page).toHaveURL("/search?tab=image");
  await expect(page.getByRole("tab", { name: "بحث بالصور" })).toHaveAttribute("aria-selected", "true");
});

test("home stats count new reports", async ({ page }) => {
  const read = async (label) => Number(await page.getByText(label).locator("xpath=following-sibling::div[1]").textContent());
  await page.goto("/");
  const before = { total: await read("إجمالي البلاغات"), lost: await read("بلاغات مفقودات"), img: await read("بلاغات بصورة") };

  await submitReport(page, "lost", { name: unique("محفظة") });
  await page.goto("/");
  expect(await read("إجمالي البلاغات")).toBe(before.total + 1);
  expect(await read("بلاغات مفقودات")).toBe(before.lost + 1);
  expect(await read("بلاغات بصورة")).toBe(before.img);
});

test("home shows a clear error when the backend is down", async ({ page }) => {
  await page.route("**/api/**", (route) => route.abort());
  page.removeAllListeners("console"); // the aborted requests are expected
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("تعذر الاتصال بالخادم");
});

// ---------- Report forms ----------

for (const type of ["lost", "found"]) {
  test(`report ${type} without image`, async ({ page }) => {
    await submitReport(page, type, { name: unique("سماعة") });
    // Form is cleared for the next report.
    await expect(page.getByLabel("اسم العنصر")).toHaveValue("");
    await expect(page.getByLabel("الوصف")).toHaveValue("");
  });
}

test("form titles and wording differ for lost and found", async ({ page }) => {
  await page.goto("/report-lost");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("إبلاغ عن مفقود");
  await expect(page.getByLabel("المكان")).toHaveAttribute("placeholder", "أين فقدت العنصر؟");
  await page.goto("/report-found");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("إبلاغ عن موجود");
  await expect(page.getByLabel("المكان")).toHaveAttribute("placeholder", "أين وجدت العنصر؟");
});

test("switching between lost and found starts a fresh form", async ({ page }) => {
  await page.goto("/report-lost");
  await page.getByLabel("اسم العنصر").fill("draft");
  await page.locator("nav").getByRole("link", { name: "إبلاغ عن موجود" }).click();
  await expect(page.getByLabel("اسم العنصر")).toHaveValue("");
});

test("required fields block submission", async ({ page }) => {
  let posted = false;
  page.on("request", (r) => r.method() === "POST" && (posted = true));
  await page.goto("/report-lost");
  await page.getByRole("button", { name: "إرسال البلاغ" }).click();
  await expect(page.getByLabel("اسم العنصر")).toHaveJSProperty("validity.valueMissing", true);
  await fillReport(page, { name: "x" });
  await page.getByLabel("اللون").fill("");
  await page.getByRole("button", { name: "إرسال البلاغ" }).click();
  expect(posted).toBe(false);
});

test("spaces-only fields are refused with an Arabic message", async ({ page }) => {
  let posted = false;
  page.on("request", (r) => r.method() === "POST" && (posted = true));
  await page.goto("/report-lost");
  await fillReport(page, { name: "   " });
  await page.getByRole("button", { name: "إرسال البلاغ" }).click();
  await expect(page.getByRole("alert")).toContainText("الرجاء تعبئة جميع الحقول المطلوبة");
  expect(posted).toBe(false);
});

test("report with image: preview, remove, re-add, submit", async ({ page }) => {
  await page.goto("/report-found");
  await fillReport(page, { name: unique("حقيبة"), image: "stripes.png" });

  const preview = page.locator("form img");
  await expect(preview).toBeVisible();
  await expect(page.getByText(/stripes\.png · \d+ KB/)).toBeVisible();

  await page.getByRole("button", { name: "إزالة" }).click();
  await expect(preview).toHaveCount(0);
  await expect(page.getByText("ارفع صورة أو اسحبها هنا")).toBeVisible();

  await page.getByLabel("ارفع صورة أو اسحبها هنا").setInputFiles(fixture("stripes.png"));
  await expect(preview).toBeVisible();
  await page.getByRole("button", { name: "إرسال البلاغ" }).click();
  await expect(page.getByRole("status")).toContainText("تم تسجيل البلاغ");
  await expect(preview).toHaveCount(0); // cleared after success
});

test("unsupported image type is refused before upload", async ({ page }) => {
  await page.goto("/report-lost");
  await page.getByLabel("ارفع صورة أو اسحبها هنا").setInputFiles(fixture("red.gif"));
  await expect(page.getByRole("alert")).toContainText("JPG أو PNG");
  await expect(page.locator("form img")).toHaveCount(0);
});

test("image over 10 MB is refused before upload", async ({ page }) => {
  await page.goto("/report-lost");
  await page.getByLabel("ارفع صورة أو اسحبها هنا").setInputFiles({
    name: "huge.png", mimeType: "image/png", buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.getByRole("alert")).toContainText("10 ميجابايت");
});

test("submit button shows progress and cannot double-submit", async ({ page }) => {
  let posts = 0;
  await page.route("**/api/report/**", async (route) => {
    posts++;
    await new Promise((r) => setTimeout(r, 500));
    await route.continue();
  });
  await page.goto("/report-lost");
  await fillReport(page, { name: unique("قلم") });
  const button = page.getByRole("button", { name: "إرسال البلاغ" });
  await button.click();
  await expect(page.getByRole("button", { name: "جارٍ الإرسال…" })).toBeDisabled();
  await expect(page.getByRole("status")).toBeVisible();
  expect(posts).toBe(1);
});

// ---------- Search ----------

test("search page always shows the manual-verification disclaimer", async ({ page }) => {
  for (const path of ["/search", "/search?tab=image"]) {
    await page.goto(path);
    await expect(page.getByText('النتائج معروضة كـ "محتملة"')).toBeVisible();
  }
});

test("text search: start state, results, partial match, no results", async ({ page }) => {
  const name = unique("نظارة شمسية");
  await submitReport(page, "lost", { name, location: "مبنى الهندسة", color: "بني" });

  await page.goto("/search");
  await expect(page.getByText("ابدأ بالبحث")).toBeVisible();
  const box = page.getByLabel("نص البحث");
  const go = page.getByRole("button", { name: "بحث", exact: true });
  await expect(go).toBeDisabled(); // empty query

  await box.fill(name);
  await go.click();
  await expect(page.locator("article", { hasText: name })).toHaveCount(1);
  await expect(page.getByText(`1 نتيجة لـ "${name}"`)).toBeVisible();
  await expect(page.locator("article").first()).not.toContainText("تطابق"); // no score on text results

  await box.fill(name.slice(0, 5)); // partial
  await box.press("Enter");
  await expect(page.locator("article", { hasText: name })).toHaveCount(1);

  await box.fill("لا-يوجد-شيء-بهذا-الاسم");
  await expect(page.getByText("لا توجد نتائج")).toHaveCount(0); // not before submitting
  await go.click();
  await expect(page.getByText("لا توجد نتائج")).toBeVisible();
  await expect(page.locator("article")).toHaveCount(0);
});

test("image search: same item ranked first with high score", async ({ page }) => {
  const name = unique("كرة");
  await submitReport(page, "found", { name, image: "circle.png" });
  await submitReport(page, "found", { name: unique("مخطط"), image: "stripes.png" });

  await page.goto("/search?tab=image");
  const compare = page.getByRole("button", { name: "مقارنة الصور" });
  await expect(compare).toBeDisabled();
  await page.getByLabel("ارفع صورة العنصر").setInputFiles(fixture("circle-copy.jpg"));
  await compare.click();

  await expect(page.getByText("بصمة الصورة (pHash):")).toBeVisible();
  await expect(page.locator("code")).toHaveText(/^[0-9a-f]{16}$/);

  const first = page.locator("article").first();
  await expect(first).toContainText(name);
  const score = Number((await first.getByText(/تطابق [\d.]+%/).textContent()).match(/[\d.]+/)[0]);
  expect(score).toBeGreaterThanOrEqual(85);
  await expect(first.getByText(/تطابق/)).toHaveClass(/emerald/); // high-confidence colour
  await expect(first).toContainText(/\d+ \/ 64/); // Hamming distance

  // Results are sorted from most to least similar.
  const scores = await page.locator("article").getByText(/تطابق/).allTextContents();
  const values = scores.map((s) => Number(s.match(/[\d.]+/)[0]));
  expect(values).toEqual([...values].sort((a, b) => b - a));
});

test("tabs keep their own results and the URL", async ({ page }) => {
  const name = unique("دفتر");
  await submitReport(page, "lost", { name, image: "circle.png" });
  await page.goto("/search");
  await page.getByLabel("نص البحث").fill(name);
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await expect(page.locator("article:visible")).toHaveCount(1);

  await page.getByRole("tab", { name: "بحث بالصور" }).click();
  await expect(page).toHaveURL("/search?tab=image");
  await expect(page.locator("article:visible")).toHaveCount(0);

  await page.getByRole("tab", { name: "بحث نصي" }).click();
  await expect(page).toHaveURL("/search");
  await expect(page.locator("article:visible")).toHaveCount(1); // still there
  await expect(page.getByLabel("نص البحث")).toHaveValue(name);
});

test("picking a new search image clears old results", async ({ page }) => {
  await submitReport(page, "found", { name: unique("صورة"), image: "circle.png" });
  await page.goto("/search?tab=image");
  const input = page.getByLabel("ارفع صورة العنصر");
  await input.setInputFiles(fixture("circle-copy.jpg"));
  await page.getByRole("button", { name: "مقارنة الصور" }).click();
  await expect(page.locator("article:visible").first()).toBeVisible();
  await input.setInputFiles(fixture("stripes.png"));
  await expect(page.locator("article:visible")).toHaveCount(0);
  await expect(page.locator("code")).toHaveCount(0);
});

test("search shows a clear error when the backend is down", async ({ page }) => {
  await page.goto("/search");
  await page.route("**/api/**", (route) => route.abort());
  page.removeAllListeners("console");
  await page.getByLabel("نص البحث").fill("x");
  await page.getByRole("button", { name: "بحث", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("تعذر الاتصال بالخادم");
});
