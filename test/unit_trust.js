const { expect } = require("chai");

const { BN, expectRevert } = require("@openzeppelin/test-helpers");

const UnitTrust = artifacts.require("UnitTrust");

contract("UnitTrust", function ([selector, trustee1, trustee2, trustee3, beneficiary, unAuthorisedBeneficiary]) {

  before(async function() {
    tokenIds = [1,2,3,4,5,6,7,8,9,10];
    this.instance = await UnitTrust.new(selector, [trustee1, trustee2, trustee3], tokenIds);
  });

  it("has a selector", async function () {
    expect((await this.instance.selector())).equals(selector);
  });

  it("has trustees", async function() {
    expect(await this.instance.getTrusteeCount()).to.be.a.bignumber.equal(new BN(3));
  });

  it("has one, or more beneficiaries", async function() {
    await this.instance.addBeneficiary(beneficiary);
    expect(await this.instance.isBeneficiary(beneficiary)).to.be.true;
  });

  it("batch mints a tokenised asset to a beneficiary account", async function() {
    await this.instance.tokeniseAsset(trustee1, beneficiary, 1, new BN(25000), { from: trustee1 });
    expect(await this.instance.balanceOf(beneficiary, 1)).to.be.a.bignumber.equal(new BN(25000));
  });

  it("only allows trustee accounts to tokenise assets", async function() {
    await expectRevert(
      this.instance.tokeniseAsset(beneficiary, beneficiary, 1, new BN(25000)),
      "only trustee accounts can tokenise assets, and create or redeem units"
    );
  });

  it("only allows valid tokenised assets to be minted", async function() {
    await expectRevert(
      this.instance.tokeniseAsset(trustee1, beneficiary, 11, new BN(25000), { from: trustee1 }),
      "invalid token Id"
    );
  });

  it("creates unit shares", async function() {
    await this.instance.createUnits(trustee1, beneficiary, 1, new BN(25000), { from: trustee1 });
    expect(await this.instance.balanceOf(trustee1, 1)).to.be.a.bignumber.equal(new BN(25000));
  });

  it("only allows unit share creation for authorised beneficiaries", async function() {
    await expectRevert(
      this.instance.createUnits(trustee1, unAuthorisedBeneficiary, 1, new BN(25000), { from: trustee1 }),
      "is not an authorised beneficiary"
    );
  });

});
