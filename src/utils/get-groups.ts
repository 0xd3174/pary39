import { getPage } from "./scrape";

export async function getGroups() {
  const page = await getPage();

  const dom = new DOMParser().parseFromString(await page.text(), 'text/html')

  const groups = dom.querySelector('select')!.querySelectorAll('option');

  return Array.from(groups.values()).slice(1).map(e => e.innerText)
}