// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract UnitTrust is ERC1155 {

  address public selector;

  address[] public trustees;

  uint[] public tokenIds;

  struct Beneficiary {
    bool isAuthorised;
  }

  mapping(address => Beneficiary) private beneficiaries; // whitelist

  modifier onlySelector() {
    require(msg.sender == selector, "only the selector account can add, and or remove beneficiaries");
    _;
  }

  modifier onlyTrustee(address _trustee) {
    require(msg.sender == _trustee, "only trustee accounts can tokenise assets, and create or redeem units");
    _;
  }

  constructor(address _selector, address[] memory _trustees, uint[] memory _tokenIds) ERC1155("https://unit-trust.example/api/v1/tokens/{id}.json") {
    selector = _selector;
    trustees = _trustees;
    tokenIds = _tokenIds;
  }

  function getTrusteeCount() public view returns(uint) {
    return trustees.length;
  }

  function addBeneficiary(address _beneficiary) public onlySelector() {
    beneficiaries[_beneficiary] = Beneficiary({ isAuthorised: true });
  }

  function removeBeneficiary(address _beneficiary) public onlySelector() {
    beneficiaries[_beneficiary].isAuthorised = false;
  }

  function isBeneficiary(address _beneficiary) public view returns(bool) {
    return beneficiaries[_beneficiary].isAuthorised;
  }

  function tokeniseAsset(address trustee, address beneficiary, uint _tokenId, uint amount) public onlyTrustee(trustee) {
    require(_tokenId <= tokenIds.length, "invalid token Id");
    _mint(beneficiary, _tokenId, amount, "");
  }

  function createUnits(address trustee, address beneficiary, uint tokenId, uint amount) public onlyTrustee(trustee) {
    require(isBeneficiary(beneficiary), "is not an authorised beneficiary");
    _safeTransferFrom(beneficiary, trustee, tokenId, amount, ""); // Place asset in Trust
    //TODO: call ERC20 contract to mint block of shares to beneficiary's account
  }

}
