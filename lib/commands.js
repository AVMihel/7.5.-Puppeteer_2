module.exports = {
  clickElement: async function (page, selector) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      await page.click(selector);
    } catch (error) {
      throw new Error(`Selector is not clickable: ${selector}`);
    }
  },

  clickElementHandle: async function (elementHandle) {
    try {
      const isClickable = await elementHandle.evaluate((el) => {
        return (
          !el.disabled &&
          !el.classList.contains("buying-scheme__chair_disabled") &&
          el.offsetParent !== null
        );
      });

      if (!isClickable) {
        throw new Error("Element handle is not clickable");
      }

      await elementHandle.click();
    } catch (error) {
      if (error.message === "Element handle is not clickable") {
        throw error;
      }
      throw new Error(`Failed to click element: ${error.message}`);
    }
  },

  clickDay: async function (page, dayPrefix) {
    const dayLinks = await page.$$(".page-nav > a");
    for (const link of dayLinks) {
      const dayText = await page.evaluate((el) => el.textContent.trim(), link);
      if (dayText.startsWith(dayPrefix)) {
        await this.clickElementHandle(link);
        return;
      }
    }
    throw new Error(`Day with prefix "${dayPrefix}" not found`);
  },

  selectSession: async function (page, time) {
    await page.waitForSelector("a.movie-seances__time", { visible: true });

    await Promise.all([
      page.waitForNavigation(),
      page.evaluate((time) => {
        const links = [...document.querySelectorAll("a.movie-seances__time")];
        const target = links.find((el) => el.textContent.trim() === time);
        if (target) target.click();
      }, time),
    ]);

    await page.waitForSelector(".buying-scheme", { visible: true });
  },

  selectSeat: async function (page, seatType = "standart", isDisabled = false) {
    const selector = `span.buying-scheme__chair.buying-scheme__chair_${seatType}${
      isDisabled
        ? ".buying-scheme__chair_disabled"
        : ":not(.buying-scheme__chair_disabled)"
    }`;
    await this.clickElement(page, selector);
  },

  confirmBooking: async function (page) {
    await this.clickElement(page, ".acceptin-button");
  },

  getConfirmationText: async function (page) {
    await page.waitForSelector("h2", { visible: true });
    return page.$eval("h2", (el) => el.textContent.trim());
  },
};
