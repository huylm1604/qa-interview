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

const usersessionApiUrl = "https://api.perxtech.io/v4/dash/user_sessions";
const authorizationApiUrl = "https://api.perxtech.io/v4/dash/authorizations";
const rewarddetailApiUrl = "https://api.perxtech.io/v4/dash/rewards";

var token = "";

const request = require("supertest");
const { Builder, By, WebElementCondition } = require("selenium-webdriver");
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

    // token = response.body.bearer_token;
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
    // token = response.body.bearer_token;
    // console.log("token", token);
  });

  it("A non-authorized user should not have access to the reward detail/edit page", async function () {
    const response = await request(rewarddetailApiUrl)
      .get("/510")
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
    await driver
      .findElement(
        By.xpath(
          '//*[@id="root"]/section/section/main/div[1]/div/div[2]/div/div/button'
        )
      )
      .click();
    // To Create new reward
    await driver.manage().setTimeouts({ implicit: 5000 });
    var currentUrl = (await driver.getCurrentUrl()).toString();
    // console.log(currentUrl);
    expect(currentUrl).toEqual(createNewRewardUrl);
    // Reward form
    var rewardName = "HuyQC_Test";
    await driver.findElement(By.name("name_en")).sendKeys(rewardName);
    var startDate = await driver.findElement(
      By.xpath(
        '//*[@id="root"]/section/section/main/span/div/div[3]/form/div[1]/div/div/div[3]/div[2]/div[1]/div/div[2]/div/div/div/div[1]/div/div[1]/div/input'
      )
    );
    console.log("date", startDate.toString());

    // var avatar = await driver.findElement(By.xpath('//*[@id="root"]/section/aside/div[1]/div[2]/div[1]'));
    // expect(avatar);

    await driver.quit();
  }, 30000);
});

function sum(a, b) {
  return a + b;
}

test("add 1 + 2 to equals to 3", () => {
  expect(sum(1, 2)).toBe(3);
});
