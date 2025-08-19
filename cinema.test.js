
const puppeteer = require("puppeteer");
const commands = require("./lib/commands");

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

  beforeEach(async () => {
    await page.goto("https://qamid.tmweb.ru/client/index.php");
  });

  //Бронирование одного VIP места
  test("should confirm reservation of one VIP seat", async () => {
    const day = "Чт";
    const time = "17:00";

    await commands.clickDay(page, day);
    await commands.selectSession(page, time);
    await commands.selectSeat(page, "vip");
    await commands.confirmBooking(page);

    const confirmationText = await commands.getConfirmationText(page);
    expect(confirmationText).toContain("Вы выбрали билеты:");
  }, 10000);

  //Бронирование двух соседних стандартных места
  test("should reserve two adjacent standard seats", async () => {
    const day = "Пт";
    const time = "20:00";

    await commands.clickDay(page, day);
    await commands.selectSession(page, time);

    const seats = await page.$$(
      "span.buying-scheme__chair.buying-scheme__chair_standart:not(.buying-scheme__chair_disabled)"
    );
    expect(seats.length).toBeGreaterThanOrEqual(2);

    await commands.clickElementHandle(seats[0]);
    await commands.clickElementHandle(seats[1]);

    await commands.confirmBooking(page);

    const confirmationText = await commands.getConfirmationText(page);
    expect(confirmationText).toContain("Вы выбрали билеты:");
  }, 10000);

  //Должно быть невозможно бронирование уже занятого места
  test("should prevent booking already taken seat", async () => {
    const day = "Сб";
    const time = "11:00";

    await commands.clickDay(page, day);
    await commands.selectSession(page, time);

    const takenSeat = await page.$("span.buying-scheme__chair_disabled");
    expect(takenSeat).toBeTruthy();

    await expect(commands.clickElementHandle(takenSeat)).rejects.toThrow(
      "Element handle is not clickable"
    );

    const isButtonDisabled = await page.$eval(
      ".acceptin-button",
      (el) => el.disabled
    );
    expect(isButtonDisabled).toBe(true);
  }, 10000);
});