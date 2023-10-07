import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import puppeteer, { Page } from "puppeteer";
import { Constants } from "../utils/constants";
import { delay } from "../utils/delay";
import { validateRequest } from "../../../middlewares/validate-request";
import { deleteFiles } from "../../../utils/delete-files";
import { getImageUrl } from "../utils/attach-url";
import { NotFoundError } from "../../../utils/errors/not-found-error";
const router = express.Router();

const waitForSelectorwithRetry = async (
  page: Page,
  selector: string,
  maxRetries: number,
  delaytime: number
): Promise<void> => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await page.waitForSelector(selector, { timeout: delaytime });
      return;
    } catch (error) {
      retries++;
      await delay(delaytime);
    }
  }
  throw new NotFoundError(
    `Element ${selector} not found after ${maxRetries} retries.`
  );
};

const getFieldSelector =async (page: Page, fieldNumber: number):  Promise<string> => {
  for(const selector of Constants.iterableSelectors){
    let tempSelector: string = selector.replace(
      "$",
      (fieldNumber + 1).toString()
    );

    const element = await page.$(tempSelector);
    await delay(100);

    if(element){
      return tempSelector;
    }
  }
  return "None";
}

router.post(
  "/api/fill-details",
  [
    body("link")
      .notEmpty()
      .withMessage("Field link must be specified")
      .isURL()
      .withMessage("Please enter a valid URL"),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { link } = req.body;

      await deleteFiles(); // deleting old images

      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.goto(link);
      await page.setViewport({ width: 1920, height: 1080 });

      await delay(100);

      await waitForSelectorwithRetry(page, Constants.divSelector, 3, 100);
      const numElements = await page.evaluate((divSelector: string) => {
        return document.querySelectorAll(divSelector).length;
      }, Constants.divSelector);

      const titles = await page.evaluate(
        (titleSelector, numElements) => {
          let titles: any[] = [];

          for (let i = 1; i <= numElements; i++) {
            titles.push(
              document.querySelector(titleSelector.replace("$", i.toString()))!
                .textContent
            );
          }
          return titles;
        },
        Constants.titleSelector,
        numElements
      );

      for (let x = 0; x < numElements; x++) {
        let fieldSelector: string = await getFieldSelector(page, x);
        await waitForSelectorwithRetry(page, fieldSelector, 3, 100);
        switch (fieldSelector) {
          case Constants.inputSelector.replace(
            "$",
            (x + 1).toString()
          ): await page.type(fieldSelector, `hello ${titles[x]}`, { delay: 100 });
          break;

          case Constants.checkBoxSelector.replace(
            "$",
            (x + 1).toString()
          ): await page.click(fieldSelector);
          break;

          case Constants.multiChoiceSelector.replace(
            "$",
            (x + 1).toString()
          ): await page.click(fieldSelector);
          break;

          case Constants.textAreaSelector.replace(
            "$",
            (x + 1).toString()
          ): await page.type(fieldSelector, `hello ${titles[x]}`, { delay: 100 });
          break;

          case Constants.dropdownSelector.replace(
            "$",
            (x + 1).toString()
          ):
          await page.click(fieldSelector);
          await page.waitForTimeout(500);
          let optionSelector: string = Constants.dropdownOptionSelector.replace(
            "$",
            (x + 1).toString()
          );
          await page.click(optionSelector);
          break;

          case Constants.linearScaleSelector.replace(
            "$",
            (x + 1).toString()
          ): await page.click(fieldSelector);
          break;

          default:
            break;
        }
      }
      
      await page.waitForTimeout(500);
      await waitForSelectorwithRetry(page, Constants.submitSelector, 3, 100);
      await page.screenshot({
        path: "static/images/finalSubmission.jpg",
        fullPage: true
      });
      await page.click(Constants.submitSelector);
      
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await page.screenshot({ path: 'static/images/Submitted.png' });
      await page.close();
      await browser.close();

      let images = await getImageUrl();

      res.json({
        message: "success",
        data: images,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as fillDetails };
