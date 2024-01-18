import { web_elements } from "../../utils/web-elements";
import { page_variables } from "../../utils/page-variables";
import { check_bulk_list_authorization } from "../api/api-testscript";
import { file_variables } from "../../utils/file-variables";

const { Builder, By} = require("selenium-webdriver");

const delay = ms => new Promise(res => setTimeout(res, ms));
function getFileName(fileName){
    return fileName.replace(/^.*[\\/]/, '')
}

export function redirect_login_for_unauthorized(){
    describe("Visit a non-authorized page should redirect to login", () => {
        it("should redirect to login", async () => {
          let driver = await new Builder().forBrowser("chrome").build();
          await driver.get(page_variables.stagingDetailRewardUrl);
          const currentUrl = await driver.getCurrentUrl();
          expect(currentUrl).toEqual(page_variables.stagingLoginRedirectUrl);
          await driver.quit();
        }, 30000);
      }, 30000);
}



export function creating_rewards(){
    describe("Creating a reward", () => {
        it("Login to dashboard then to create new rewards", async () => {
          let driver = await new Builder().forBrowser("chrome").build();
          await driver.get(page_variables.stagingDashboardUrl);
          await driver.findElement(By.id("email")).sendKeys(page_variables.usernameReward);
          await driver.findElement(By.id("password")).sendKeys(page_variables.passwordReward);
          await driver
            .findElement(
              By.xpath(web_elements.loginButton)
            )
            .click();
          // Login forward
          await driver.manage().setTimeouts({ implicit: 5000 });
    
          await driver.findElement(By.xpath(web_elements.createNewRewardButtonElement)).click();
          // To Create new reward
          await driver.manage().setTimeouts({ implicit: 5000 });
          var currentUrl = (await driver.getCurrentUrl()).toString();
          expect(currentUrl).toEqual(page_variables.createNewRewardUrl);
          // Reward form
          var rewardName = "HuyQC_Test";
          await driver.findElement(By.name(web_elements.rewardName)).sendKeys(rewardName);
          
          await driver.findElement(By.xpath(web_elements.nextButtonElement + "[2]")).click(); // Next button
          await driver.manage().setTimeouts({ implicit: 5000 });
          const datePickerRect = await driver.findElement(
            By.xpath(web_elements.datePickerElement)
          );
          const deltaY = parseInt((await datePickerRect.getRect()).y);
          await driver.actions().scroll(0, 0, 0, deltaY).perform();
          await driver.findElement(By.xpath(web_elements.datePickerElement)).click();
          
          await driver.findElement(By.xpath(web_elements.dayElement)).click(); // 17 Jan 2024
          await driver.findElement(By.xpath(web_elements.nextButtonElement)).click(); // Next button
          
          await driver.manage().setTimeouts({ implicit: 5000 });
          
          await driver.findElement(By.xpath(web_elements.saveButtonElement)).click(); // Save button
          // expect no mandatory field is empty, message popup when a mandatory field is empty
          await driver.manage().setTimeouts({ implicit: 5000 });
          await driver.get(page_variables.rewardListUrl);
          await driver.manage().setTimeouts({ implicit: 5000 });
          
          const createdRecordName = await driver
            .findElement(By.xpath(web_elements.firstRecordElement))
            .getText();
          expect(createdRecordName).toEqual(rewardName); // Check created record is existed in list
      
          // ----- Private Reward checking
          await driver.findElement(By.xpath(web_elements.createNewRewardButtonElement)).click();
          // To Create new reward
          await driver.manage().setTimeouts({ implicit: 5000 });
          var currentUrl = (await driver.getCurrentUrl()).toString();
          // console.log(currentUrl);
          expect(currentUrl).toEqual(page_variables.createNewRewardUrl);
          await driver.findElement(By.xpath(web_elements.privateTypebuttonElement)).click(); // select Private type
          const tagDeltaY = await driver.findElement(By.xpath(web_elements.tagLabelElement)).getRect();
          await driver.actions().scroll(0,0,0,parseInt(tagDeltaY.y)).perform();
          //scroll to categories label
          let isTagExisted = true;
          try{
            await driver.findElement(By.xpath(web_elements.tagLabelElement));
          }catch(err){
            isTagExisted = false;
          }
          expect(isTagExisted).toBe(false); //expect tag label disappear
      
          let isTCategoriesExisted = true;
          try{
            await driver.findElement(By.xpath(web_elements.categoriesLabelElement));
          }catch(err){
            isTCategoriesExisted = false;
          }
          expect(isTCategoriesExisted).toBe(false); //expect categories label disappear
          // Cannot find catalogues, labels, brands related fields
      
          await driver.quit();
        }, 30000);
      });
}

export function upload_bulk_list(){
    describe("Upload a file in bulk list", () => {
        check_bulk_list_authorization()
        it("login and upload bulk list", async () => {
          let driver = await new Builder().forBrowser("chrome").build();
          await driver.get(page_variables.stagingDashboardUrl);
          await driver.findElement(By.id("email")).sendKeys(page_variables.usernameAdmin);
          await driver.findElement(By.id("password")).sendKeys(page_variables.passwordAdmin);
          await driver
            .findElement(
              By.xpath(web_elements.loginButton)
            )
            .click();
          // Login forward
          await driver.manage().setTimeouts({ implicit: 5000 });
          await driver.findElement(By.xpath(web_elements.bulkAtionsTabElement)).click();
          await driver.manage().setTimeouts({ implicit: 5000 });
          const currentUrl = (await driver.getCurrentUrl()).toString();
          expect(currentUrl).toEqual(page_variables.bulkActionUrl); // expect to be at Bulk Actions tab
          await driver.findElement(By.xpath(web_elements.uploadButtonElement)).click();
          await driver.manage().setTimeouts({ implicit: 5000 });
      
          await driver.findElement(By.xpath(web_elements.uploadFile)).sendKeys(file_variables.imageFile);
          await driver.findElement(By.xpath(web_elements.uploadFileButtonElement)).click(); // upload file
          
          let errorMessage = await driver.findElement(By.className(web_elements.popupMessage)).isDisplayed();
          expect(errorMessage).toBe(true); // expect cannot upload other file than .txt, .xlsx, .csv
          await driver.findElement(By.xpath(web_elements.removeFileButton)).click();
          await driver.findElement(By.xpath(web_elements.uploadFile)).sendKeys(file_variables.csvFile); // upload .csv file
      
      
          await delay(3000);
          // await driver.findElement(By.xpath(web_elements.actionListDropdown)).click();
          // cannot select item from dropdown list
          // expect(await driver.findElement(By.xpath(web_elements.uploadDialogElement)).isDisplayed()).toBe(true); 
          // expect to be able upload file to other action
          
          await driver.findElement(By.xpath(web_elements.uploadFileButtonElement)).click(); // upload file
          await delay(3000);
          let createdRecord = (await driver.findElement(By.xpath(web_elements.createdRecordNameUploadFile)).getText()).toString();
          expect(createdRecord).toEqual(getFileName(file_variables.csvFile));
      
          // -- upload xlsxFile
          await driver.findElement(By.xpath(web_elements.uploadButtonElement)).click();
          await delay(2000);
          await driver.findElement(By.xpath(web_elements.uploadFile)).sendKeys(file_variables.xlsxFile); // upload .xlsx file
          await delay(2000);
          await driver.findElement(By.xpath(web_elements.uploadFileButtonElement)).click();
          await delay(2000);
          createdRecord = (await driver.findElement(By.xpath(web_elements.createdRecordNameUploadFile)).getText()).toString();
          expect(createdRecord).toEqual(getFileName(file_variables.xlsxFile));
      
          // -- upload txtFile
          await driver.findElement(By.xpath(web_elements.uploadButtonElement)).click();
          await delay(2000);
          await driver.findElement(By.xpath(web_elements.uploadFile)).sendKeys(file_variables.txtFile); // upload .txt file
          await delay(2000);
          await driver.findElement(By.xpath(web_elements.uploadFileButtonElement)).click();
          await delay(2000);
          createdRecord = (await driver.findElement(By.xpath(createdRecordNameUploadFile)).getText()).toString();
          expect(createdRecord).toEqual(getFileName(file_variables.txtFile));
      
          await driver.quit();
      
        },30000);
      });
}