import {rewards_addReward, rewards_getRewards} from "./rewardsFunctions";

describe("Rewards Functions", () => {

  it("should export reward functions", () => {
    expect(rewards_addReward).toBeDefined();
    expect(rewards_getRewards).toBeDefined();
  });
});
