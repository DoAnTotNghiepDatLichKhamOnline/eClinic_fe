export default async function run(page) {
  const origin = "http://127.0.0.1:5173";
  await page.goto(`${origin}/`);
  await page
    .getByRole("heading", { name: /Bạn đang dùng eClinic|Choose your/ })
    .waitFor();
  const paths = await page
    .locator("a")
    .evaluateAll((links) => links.map((link) => new URL(link.href).pathname));
  const expectedPaths = ["/home", "/doctor/login", "/admin/login"];
  const roleLinks = expectedPaths.every((path) => paths.includes(path));
  if (!roleLinks)
    throw new Error(`Unexpected role destinations: ${paths.join(", ")}`);

  const pages = {};
  for (const path of ["/home", "/doctor/login", "/admin/login"]) {
    await page.goto(`${origin}${path}`);
    const bodyText = await page.locator("body").innerText();
    pages[path] = new URL(page.url()).pathname === path && bodyText.length > 0;
    if (!pages[path]) throw new Error(`Route did not render: ${path}`);
  }
  return { roleLinks, renderedPages: pages };
}
