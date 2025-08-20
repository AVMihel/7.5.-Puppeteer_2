const puppeteer = require("puppeteer");
const chai = require("chai");
const expect = chai.expect;
const { Given, When, Then, Before, After } = require("cucumber");
const commands = require("../../lib/commands");

Before(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });
  const page = await browser.newPage();
  this.browser = browser;
  this.page = page;
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});

Given("user is on the cinema homepage", async function () {
  return await this.page.goto("https://qamid.tmweb.ru/client/index.php", {
    timeout: 20000,
  });
});

When("user selects day {string}", async function (day) {
  await commands.clickDay(this.page, day);
});

When("user selects session at {string}", async function (time) {
  await commands.selectSession(this.page, time);
});

When("user selects VIP seat", async function () {
  await commands.selectSeat(this.page, "vip");
});

When("user selects two adjacent standard seats", async function () {
  const seats = await this.page.$$(
    "span.buying-scheme__chair.buying-scheme__chair_standart:not(.buying-scheme__chair_disabled)"
  );
  expect(seats.length).to.be.at.least(2);
  await commands.clickElementHandle(seats[0]);
  await commands.clickElementHandle(seats[1]);
});

When("user confirms booking", async function () {
  await commands.confirmBooking(this.page);
});

When("user tries to select taken seat", async function () {
  const takenSeat = await this.page.$("span.buying-scheme__chair_disabled");
  expect(takenSeat).to.exist;

  try {
    await commands.clickElementHandle(takenSeat);
    throw new Error("Expected error when clicking taken seat");
  } catch (error) {    
    expect(error.message).to.contain("Element handle is not clickable");
  }
});

Then("booking confirmation message is displayed", async function () {
  const confirmationText = await commands.getConfirmationText(this.page);
  expect(confirmationText).to.contain("Вы выбрали билеты:");
});

Then("booking confirmation button is disabled", async function () {
  const isButtonDisabled = await this.page.$eval(
    ".acceptin-button",
    (el) => el.disabled
  );
  expect(isButtonDisabled).to.be.true;
});

Then("booking is not possible", async function () {  
  const button = await this.page.$(".acceptin-button");
  const isEnabled = await button.evaluate((el) => !el.disabled);
  expect(isEnabled).to.be.false;
});
