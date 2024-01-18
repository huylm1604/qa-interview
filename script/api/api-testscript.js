import { page_variables } from "../../utils/page-variables";

const request = require("supertest");
const { Builder, By} = require("selenium-webdriver");

export function api_usersession(){
    describe("Testing authorization of user roles and groups", () => {
        it("response usersessionApi", async function () {
          const response = await request(page_variables.usersessionApiUrl).post("/").send({
            email: page_variables.usernameReward,
            password: page_variables.passwordReward,
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
}

export function creating_reward_api_testscript(){
    describe("Creating a reward", () => {
        it("Ensure that a logged in user has sufficient permission to create a reward", async function () {
          const response = await request(page_variables.usersessionApiUrl).post("/").send({
            email: page_variables.usernameReward,
            password: page_variables.passwordReward,
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
          const response = await request(page_variables.rewarddetailApiUrl)
            .get("/510")  // random item with code 510
            .set("Authorization", "abc123");
          expect(response.status).toEqual(401); // unauthorized user
        });
      });
}

export function check_bulk_list_authorization(){
  it("Ensure that the logged in user has sufficient permission to visit the builk file upload page and has the ability to upload.", async () => {
    var response = await request(page_variables.usersessionApiUrl).post("/").send({
      email: page_variables.usernameAdmin,
      password: page_variables.passwordAdmin,
    });
    expect(response.status).toEqual(201);
    const token = response.body.bearer_token;
    console.log('token',token);
    response = await request(page_variables.authorizationApiUrl)
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
}