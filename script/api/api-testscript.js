import { page_variables } from "../../utils/page-variables";
const request = require("supertest");

export function api_usersession(){
    describe("Testing authorization of user roles and groups", () => {
        it("response usersessionApi", async function () {
          const response = await request(page_variables.usersessionApiUrl).post("/").send({
            email: page_variables.usernameReward,
            password: page_variables.passwordReward,
          });
          expect(response).toEqual(201);
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