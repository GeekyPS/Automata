import express, { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import puppeteer, { Page } from "puppeteer";
import { Constants } from "../utils/constants";
import { delay } from "../utils/delay";
import { validateRequest } from "../../../middlewares/validate-request";
import { deleteFiles } from "../../../utils/delete-files";
import { getImageUrl } from "../utils/attach-url";
import auth from "../../../middlewares/auth-handler";
import fs from 'fs'
const router = express.Router();

const waitForSelectorwithRetry = async ( page : Page  , selector : string , maxRetries: number , delaytime:number ):Promise<void> =>{
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await page.waitForSelector(selector, { timeout: delaytime });
      return;
    } catch (error) {
      retries++;
      await page.waitForTimeout(delaytime);
    }
  }
  throw new Error(`Element ${selector} not found after ${maxRetries} retries.`);


}

router.post(
  "/api/fill-details", auth,
  [
    body("link")
      .notEmpty()
      .withMessage("Field link must be specified")
      .isURL()
      .withMessage("Please enter a valid URL"),

    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { link } = req.body;

      await deleteFiles(); // deleting old images

      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.goto(link);
      await page.setViewport({ width: 1920, height: 1080 });

      await delay(100);

      // token contains the userID which which can be searched for in the user-data.json
      const filename = './static/userData/user-data.json';
      const userID = res.locals.user;
      var loggedIn = false;
      if(userID) loggedIn = true;

      let users:any = {};
      if(fs.existsSync(filename) && loggedIn){
        users = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      }else{
        if(loggedIn) console.log("ERROR: user-data.json not available");
        loggedIn = false;
      }
      var user;
      if(loggedIn){
        user = users[userID.userID];
        if(user ==  undefined){
          throw new Error("No entry for user in database, login again");
        }
      }

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
        let inputSelector: string = Constants.inputSelector.replace(
          "$",
          (x + 1).toString()
        );

        const element = await page.$(inputSelector);
        await delay(100);

        if (element) {
          await waitForSelectorwithRetry(page, inputSelector, 3, 100);
          
          // checking if the field is name or email 
          var currTitle: string = titles[x];
          currTitle = currTitle.toLowerCase();

          if(currTitle == 'name' && loggedIn){
            await page.type(inputSelector, `${user.username}`, { delay: 10 });
          }
          else if(currTitle == 'email' && loggedIn){
            await page.type(inputSelector, `${user.email}`, { delay: 10 });
          }
          else{
            await page.type(inputSelector, `hello ${titles[x]}`, { delay: 10 });
          }         
        } else {
          inputSelector = Constants.checkBoxSelector.replace(
            "$",
            (x + 1).toString()
          );
          await waitForSelectorwithRetry(page, inputSelector, 3, 100);
          await page.click(inputSelector);
        }

        await page.screenshot({ path: `static/images/fields${x + 1}.jpg` });
      }

      await waitForSelectorwithRetry(page, Constants.submitSelector, 3, 100);
      await page.click(Constants.submitSelector);

      await page.screenshot({
        path: "static/images/finalSubmission.jpg",
      });
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
