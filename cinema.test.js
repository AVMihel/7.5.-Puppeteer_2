// const { clickElement, putText, getText } = require("./lib/commands.js");
// const { generateName } = require("./lib/util.js");

// let page;

// beforeEach(async () => {
//   page = await browser.newPage();
//   await page.setDefaultNavigationTimeout(0);
// });

// afterEach(() => {
//   page.close();
// });

// describe("Netology.ru tests", () => {
//   beforeEach(async () => {
//     page = await browser.newPage();
//     await page.goto("https://netology.ru");
//   });

//   test("The first test'", async () => {
//     const title = await page.title();
//     console.log("Page title: " + title);
//     await clickElement(page, "header a + a");
//     const title2 = await page.title();
//     console.log("Page title: " + title2);
//     const pageList = await browser.newPage();
//     await pageList.goto("https://netology.ru/navigation");
//     await pageList.waitForSelector("h1");
//   });

//   test("The first link text 'Медиа Нетологии'", async () => {
//     const actual = await getText(page, "header a + a");
//     expect(actual).toContain("Медиа Нетологии");
//   });

//   test("The first link leads on 'Медиа' page", async () => {
//     await clickElement(page, "header a + a");
//     const actual = await getText(page, ".logo__media");
//     await expect(actual).toContain("Медиа");
//   });
// });

// test("Should look for a course", async () => {
//   await page.goto("https://netology.ru/navigation");
//   await putText(page, "input", "тестировщик");
//   const actual = await page.$eval("a[data-name]", (link) => link.textContent);
//   const expected = "Тестировщик ПО";
//   expect(actual).toContain(expected);
// });

// test("Should show warning if login is not email", async () => {
//   await page.goto("https://netology.ru/?modal=sign_in");
//   await putText(page, 'input[type="email"]', generateName(5));
// });

const puppeteer = require("puppeteer");

describe("Purchase of tickets for the session", () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 50,
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  //Бронирование одного VIP места
  test("should confirm reservation of one VIP seat", async () => {
    await page.goto("https://qamid.tmweb.ru/client/index.php");
    
    await page.waitForSelector(".page-nav > a", { visible: true });
    const dayLinks = await page.$$(".page-nav > a");
    for (const link of dayLinks) {
      const dayText = await page.evaluate((el) => el.textContent.trim(), link);
      if (dayText.startsWith("Чт")) {
        await link.click();
        break;
      }
    }
    
    await page.waitForSelector("a.movie-seances__time", { visible: true });
    await page.evaluate((time) => {
      const links = [...document.querySelectorAll("a.movie-seances__time")];
      const target = links.find((el) => el.textContent.trim() === time);
      if (target) target.click();
    }, "17:00");
    
    await page.waitForSelector(".buying-scheme", { visible: true });
    const vipSeat = await page.$(
      "span.buying-scheme__chair.buying-scheme__chair_vip:not(.buying-scheme__chair_disabled)"
    );
    expect(vipSeat).toBeTruthy();
    await vipSeat.click();
    
    await page.click(".acceptin-button");
    
    await page.waitForSelector("h2", { visible: true });
    const confirmation = await page.evaluate(() =>
      document.querySelector("h2").textContent.includes("Вы выбрали билеты:")
    );
    expect(confirmation).toBe(true);
  }, 30000);

  //Бронирование двух стандартных мест рядом
  test("should reserve two adjacent standard seats on Friday at 20:00", async () => {
    await page.goto("https://qamid.tmweb.ru/client/index.php");
    
    await page.waitForSelector(".page-nav > a", { visible: true });
    const dayLinks = await page.$$(".page-nav > a");
    for (const link of dayLinks) {
      const dayText = await page.evaluate((el) => el.textContent.trim(), link);
      if (dayText.startsWith("Пт")) {
        await link.click();
        break;
      }
    }
    
    await page.waitForSelector("a.movie-seances__time", { visible: true });
    await page.evaluate((time) => {
      const links = [...document.querySelectorAll("a.movie-seances__time")];
      const target = links.find((el) => el.textContent.trim() === time);
      if (target) target.click();
    }, "20:00");
    
    await page.waitForSelector(".buying-scheme", { visible: true });
    const seats = await page.$$(
      "span.buying-scheme__chair.buying-scheme__chair_standart:not(.buying-scheme__chair_disabled)"
    );
    expect(seats.length).toBeGreaterThanOrEqual(2);

    await seats[0].click();
    await seats[1].click();
    
    await page.click(".acceptin-button");
    
    await page.waitForSelector("h2", { visible: true });
    const confirmation = await page.evaluate(() =>
      document.querySelector("h2").textContent.includes("Вы выбрали билеты:")
    );
    expect(confirmation).toBe(true);
  }, 30000);

  //Бронирование занятого места
  test("should prevent booking already taken seat", async () => {
    
    await page.goto("https://qamid.tmweb.ru/client/index.php");
    
    await page.waitForSelector(".page-nav > a", { visible: true });
    const dayLinks = await page.$$(".page-nav > a");
    for (const link of dayLinks) {
      const dayText = await page.evaluate((el) => el.textContent.trim(), link);
      if (dayText.startsWith("Сб")) {
        await link.click();
        break;
      }
    }
    
    await page.waitForSelector("a.movie-seances__time", { visible: true });
    await page.evaluate((time) => {
      const links = [...document.querySelectorAll("a.movie-seances__time")];
      const target = links.find((el) => el.textContent.trim() === time);
      if (target) target.click();
    }, "11:00");
    
    await page.waitForSelector(".buying-scheme", { visible: true });
    const takenSeat = await page.$(
      "span.buying-scheme__chair.buying-scheme__chair_disabled"
    );
    expect(takenSeat).toBeTruthy();
    
    let clickSuccess = true;
    try {
      await takenSeat.click({ timeout: 1000 });
    } catch (e) {
      clickSuccess = false;
    }
    
    expect(clickSuccess).toBe(false);
    
    const isButtonDisabled = await page.evaluate(() => {
      return document.querySelector(".acceptin-button").disabled;
    });
    expect(isButtonDisabled).toBe(true);
    
  }, 30000);
});