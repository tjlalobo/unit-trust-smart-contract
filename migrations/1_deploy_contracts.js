const UnitTrust = artifacts.require("UnitTrust");

module.exports = function(deployer, networks, accounts) {
    [selector, trustee1, trustee2, trustee3] = accounts;
    tokenIds = [1,2,3,4,5,6,7,8,9,10];
    deployer.deploy(UnitTrust, selector, [trustee1, trustee2, trustee3], tokenIds);
};