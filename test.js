const usernameAdmin = "thao+test-qa-interview@perxtech.com";
const passwordAdmin = "admin1234";
const usernameReward = "thao+reward-test-qa-interview@perxtech.com";
const passwordReward = "reward_admin";

const stagingDashboardUrl = "https://www.perxtech.io/dashboard";
const stagingDetailRewardUrl =
  "https://dashboard.perxtech.io/dashboard/p/rewards/show/510";
const stagingLoginRedirectUrl =
  "https://dashboard.perxtech.io/dashboard/signin";
const createNewRewardUrl =
  "https://dashboard.perxtech.io/dashboard/p/rewards/create/info";
const bulkActionUrl = 'https://dashboard.perxtech.io/dashboard/p/bulk_actions';

const usersessionApiUrl = "https://api.perxtech.io/v4/dash/user_sessions";
const authorizationApiUrl = "https://api.perxtech.io/v4/dash/authorizations";
const rewarddetailApiUrl = "https://api.perxtech.io/v4/dash/rewards";


const request = require("supertest");
const path = require("path");
const { Builder, By, WebElementCondition, Key, until } = require("selenium-webdriver");
const { del } = require("selenium-webdriver/http");
//const { urlContains } = require("selenium-webdriver/lib/until");

describe("Testing authorization of user roles and groups", () => {
  it("response usersessionApi", async function () {
    const response = await request(usersessionApiUrl).post("/").send({
      email: usernameReward,
      password: passwordReward,
    });
    expect(response.status).toEqual(201);
    const permissions = response.body.roles[0].permissions;
    for (var p of permissions) {
      for (var k of Object.keys(p)) {
        if (k === "rewards") {
          expect(p[k].actions).toEqual(["view", "edit"]);
        } else if (k !== "rewards") {
          expect(p[k].actions).toEqual([]);
        }
      }
    }
  });
});

describe("Creating a reward", () => {
  it("Ensure that a logged in user has sufficient permission to create a reward", async function () {
    const response = await request(usersessionApiUrl).post("/").send({
      email: usernameReward,
      password: passwordReward,
    });
    expect(response.status).toEqual(201);
    const permissions = response.body.roles[0].permissions;
    for (var p of permissions) {
      for (var k of Object.keys(p)) {
        if (k === "rewards") {
          expect(p[k].actions).toEqual(["view", "edit"]);
        }
      }
    }
  });

  it("A non-authorized user should not have access to the reward detail/edit page", async function () {
    const response = await request(rewarddetailApiUrl)
      .get("/510")  // random item with code 510
      .set("Authorization", "abc123");
    expect(response.status).toEqual(401); // unauthorized user
  });
});

describe("Visit a non-authorized page should redirect to login", () => {
  it("should redirect to login", async () => {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get(stagingDetailRewardUrl);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toEqual(stagingLoginRedirectUrl);
    await driver.quit();
  }, 30000);
}, 30000);

describe("Creating a reward", () => {
  it("Login to dashboard then to create new rewards", async () => {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get(stagingDashboardUrl);
    await driver.findElement(By.id("email")).sendKeys(usernameReward);
    await driver.findElement(By.id("password")).sendKeys(passwordReward);
    await driver
      .findElement(
        By.xpath('//*[@id="root"]/section/main/div/aside/div[2]/form/button')
      )
      .click();
    // Login forward
    await driver.manage().setTimeouts({ implicit: 5000 });


    const createNewRewardButtonElement =
      '//*[@id="root"]/section/section/main/div[1]/div/div[2]/div/div/button';
    await driver.findElement(By.xpath(createNewRewardButtonElement)).click();
    // To Create new reward
    await driver.manage().setTimeouts({ implicit: 5000 });
    var currentUrl = (await driver.getCurrentUrl()).toString();
    expect(currentUrl).toEqual(createNewRewardUrl);
    // Reward form
    var rewardName = "HuyQC_Test";
    await driver.findElement(By.name("name_en")).sendKeys(rewardName);
    const nextButtonElement =
      '//*[@id="root"]/section/section/main/span/div/div[3]/form/div[2]/div/div/div/button';
    await driver.findElement(By.xpath(nextButtonElement + "[2]")).click(); // Next button
    await driver.manage().setTimeouts({ implicit: 5000 });
    const datePickerElement =
      '//*[@id="root"]/section/section/main/span/div/div[3]/form/div[1]/div/div/div[4]/div[2]/div[2]/div[2]/div/div/div/div/section/section[2]/div/div[1]/div';
    const datePickerRect = await driver.findElement(
      By.xpath(datePickerElement)
    );
    const deltaY = parseInt((await datePickerRect.getRect()).y);
    await driver.actions().scroll(0, 0, 0, deltaY).perform();
    await driver.findElement(By.xpath(datePickerElement)).click();
    const dayElement =
      "/html/body/div[3]/div/div/div/div/div[1]/div[2]/table/tbody/tr[3]/td[4]/div";
    await driver.findElement(By.xpath(dayElement)).click(); // 17 Jan 2024
    await driver.findElement(By.xpath(nextButtonElement)).click(); // Next button
    
    await driver.manage().setTimeouts({ implicit: 5000 });
    const saveButtonElement =
      '//*[@id="root"]/section/section/main/span/div/div[3]/form/div[2]/div/div/div[2]/button[2]';
    await driver.findElement(By.xpath(saveButtonElement)).click(); // Save button
    // expect no mandatory field is empty, message popup when a mandatory field is empty
    await driver.manage().setTimeouts({ implicit: 5000 });
    const rewardListUrl =
      "https://dashboard.perxtech.io/dashboard/p/rewards/list";
    await driver.get(rewardListUrl);
    await driver.manage().setTimeouts({ implicit: 5000 });
    const firstRecordElement =
      '//*[@id="root"]/section/section/main/div[2]/div/div/div[3]/div/div/div/div/div/table/tbody/tr[1]/td[1]/a/div';
    const createdRecordName = await driver
      .findElement(By.xpath(firstRecordElement))
      .getText();
    expect(createdRecordName).toEqual(rewardName); // Check created record is existed in list

    // ----- Private Reward checking
    await driver.findElement(By.xpath(createNewRewardButtonElement)).click();
    // To Create new reward
    await driver.manage().setTimeouts({ implicit: 5000 });
    var currentUrl = (await driver.getCurrentUrl()).toString();
    // console.log(currentUrl);
    expect(currentUrl).toEqual(createNewRewardUrl);
    const privateTypebuttonElement =
      '//*[@id="root"]/section/section/main/span/div/div[3]/form/div[1]/div/div/div[1]/div[2]/div[1]/div/div/div[2]/div/div/div[1]/label[2]/span[1]/input';
    await driver.findElement(By.xpath(privateTypebuttonElement)).click(); // select Private type
    const tagLabelElement =
      '//*[@id="root"]/section/section/main/span/div/div[3]/form/div[1]/div/div/div[1]/div[2]/div[7]/div/div/div[1]/label';
    const categoriesLabelElement =
      '//*[@id="root"]/section/section/main/span/div/div[3]/form/div[1]/div/div/div[1]/div[2]/div[8]/div/div/div[1]/label';
    const tagDeltaY = await driver.findElement(By.xpath(tagLabelElement)).getRect();
    await driver.actions().scroll(0,0,0,parseInt(tagDeltaY.y)).perform();
    //scroll to categories label
    let isTagExisted = true;
    try{
      await driver.findElement(By.xpath(tagLabelElement));
    }catch(err){
      isTagExisted = false;
    }
    expect(isTagExisted).toBe(false); //expect tag label disappear

    let isTCategoriesExisted = true;
    try{
      await driver.findElement(By.xpath(categoriesLabelElement));
    }catch(err){
      isTCategoriesExisted = false;
    }
    expect(isTCategoriesExisted).toBe(false); //expect categories label disappear
    // Cannot find catalogues, labels, brands related fields

    await driver.quit();
  }, 30000);
});


describe("Upload a file in bulk list", () => {
  it("Ensure that the logged in user has sufficient permission to visit the builk file upload page and has the ability to upload.", async () => {
    var response = await request(usersessionApiUrl).post("/").send({
      email: usernameAdmin,
      password: passwordAdmin,
    });
    expect(response.status).toEqual(201);
    const token = response.body.bearer_token;
    console.log('token',token);
    response = await request(authorizationApiUrl)
      .get("/")
      .set("Authorization", "Bearer " + token);
    expect(response.status).toEqual(200);
    const permisson = response.body.data.permissions;
    // console.log('permisson:',permisson)
    for (var p of permisson){
      if(p.resource_name === 'bulk_actions'){
        expect(p.actions).toEqual([
          "view",
          "edit",
          "create",
          "approve",
          "download_voucher_list"
      ])
      }
    }
  }, 30000);
  it("login and upload bulk list", async () => {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get(stagingDashboardUrl);
    await driver.findElement(By.id("email")).sendKeys(usernameAdmin);
    await driver.findElement(By.id("password")).sendKeys(passwordAdmin);
    await driver
      .findElement(
        By.xpath('//*[@id="root"]/section/main/div/aside/div[2]/form/button')
      )
      .click();
    // Login forward
    await driver.manage().setTimeouts({ implicit: 5000 });
    const bulkAtionsTabElement = '//*[@id="root"]/section/aside/div[1]/ul/li[9]/span';
    await driver.findElement(By.xpath(bulkAtionsTabElement)).click();
    await driver.manage().setTimeouts({ implicit: 5000 });
    const currentUrl = (await driver.getCurrentUrl()).toString();
    expect(currentUrl).toEqual(bulkActionUrl); // expect to be at Bulk Actions tab
    const uploadButtonElement = '//*[@id="root"]/section/section/main/div[1]/div/div[2]/div/div/button';
    await driver.findElement(By.xpath(uploadButtonElement)).click();
    await driver.manage().setTimeouts({ implicit: 5000 });

    const uploadFile = '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/form/div[2]/span/div[1]/span/input';
    const csvFile = path.resolve('./sample_issue_vouchers.csv');
    const xlsxFile = path.resolve('./dataExcel.xlsx');
    const txtFile = path.resolve('./txtFile.txt');

    const imageFile = path.resolve('./hi-image.png');
    await driver.findElement(By.xpath(uploadFile)).sendKeys(imageFile);
    const uploadFileButtonElement = '/html/body/div[3]/div/div[2]/div/div[2]/div[3]/button[2]';
    await driver.findElement(By.xpath(uploadFileButtonElement)).click(); // upload file
    
    let errorMessage = await driver.findElement(By.className('ant-message-notice')).isDisplayed();
    expect(errorMessage).toBe(true); // expect cannot upload other file than .txt, .xlsx, .csv
    const removeFileButton = '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/form/div[2]/span/div[2]/div/div/div/span/span[2]/button';
    await driver.findElement(By.xpath(removeFileButton)).click();
    await driver.findElement(By.xpath(uploadFile)).sendKeys(csvFile); // upload .csv file


    await delay(3000);
    const uploadDialogElement = '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/form/div[2]/span/div[1]/span';
    
    const actionListDropdown = '/html/body/div[3]/div/div[2]/div/div[2]/div[2]/form/div[1]/div/div[2]/div/div/div/div';
    // await driver.findElement(By.xpath(actionListDropdown)).click();
    // cannot select item from dropdown list
    // expect(await driver.findElement(By.xpath(uploadDialogElement)).isDisplayed()).toBe(true); 
    // expect to be able upload file to other action
    
    await driver.findElement(By.xpath(uploadFileButtonElement)).click(); // upload file
    await delay(3000);
    const createdRecordNameUploadFile = '//*[@id="rc-tabs-0-panel-All"]/div/div/div/div/div/div/table/tbody/tr[1]/td[2]';
    let createdRecord = (await driver.findElement(By.xpath(createdRecordNameUploadFile)).getText()).toString();
    let fileName = csvFile.replace(/^.*[\\/]/, '');
    console.log(fileName);
    expect(createdRecord).toEqual(fileName);

    // -- upload xlsxFile
    await driver.findElement(By.xpath(uploadButtonElement)).click();
    await delay(2000);
    await driver.findElement(By.xpath(uploadFile)).sendKeys(xlsxFile); // upload .xlsx file
    await delay(2000);
    await driver.findElement(By.xpath(uploadFileButtonElement)).click();
    await delay(2000);
    createdRecord = (await driver.findElement(By.xpath(createdRecordNameUploadFile)).getText()).toString();
    fileName = xlsxFile.replace(/^.*[\\/]/, '');
    console.log(fileName);
    expect(createdRecord).toEqual(fileName);

    // -- upload txtFile
    await driver.findElement(By.xpath(uploadButtonElement)).click();
    await delay(2000);
    await driver.findElement(By.xpath(uploadFile)).sendKeys(txtFile); // upload .txt file
    await delay(2000);
    await driver.findElement(By.xpath(uploadFileButtonElement)).click();
    await delay(2000);
    createdRecord = (await driver.findElement(By.xpath(createdRecordNameUploadFile)).getText()).toString();
    fileName = txtFile.replace(/^.*[\\/]/, '');
    console.log(fileName);
    expect(createdRecord).toEqual(fileName);

    await driver.quit();

  },30000);
});

const delay = ms => new Promise(res => setTimeout(res, ms));
