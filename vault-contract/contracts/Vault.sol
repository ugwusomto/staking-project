// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Timelocked ERC4626 Vault
 * @notice This contract implements the ERC-4626 Tokenized Vault standard with an additional
 *         withdrawal request timelock. Deposits mint ERC-20 shares representing a pro-rata claim
 *         on the underlying ERC-20 asset. Withdrawals require a prior request and are only
 *         executable after `unlockDelay` blocks have elapsed.
 * @dev Shares accrue value as `totalAssets()` grows. Users do not automatically receive more
 *      shares; instead, each share becomes redeemable for more assets over time.
 */
contract Vault is ERC4626, Ownable {
    uint256 public unlockDelay;

    struct WithdrawalRequest {
        uint256 amount;
        uint256 unlockBlock;
    }

    mapping(address => WithdrawalRequest) public withdrawalRequests;

    event WithdrawalRequested(
        address indexed user,
        uint256 amount,
        uint256 unlockBlock
    );

    /**
     * @notice Construct the vault.
     * @param _asset The underlying ERC-20 asset managed by the vault.
     * @param _name The ERC-20 name for the vault share token.
     * @param _symbol The ERC-20 symbol for the vault share token.
     * @param _unlockDelay Number of blocks a user must wait after requesting a withdrawal.
     */
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        uint256 _unlockDelay
    ) ERC4626(_asset) ERC20(_name, _symbol) Ownable(msg.sender) {
        unlockDelay = _unlockDelay;
    }

    event UnlockDelayUpdated(uint256 previousDelay, uint256 newDelay);

    /**
     * @notice Owner-only setter to update the withdrawal timelock duration.
     * @param newUnlockDelay The new delay (in blocks) required after a withdrawal request.
     */
    function setUnlockDelay(uint256 newUnlockDelay) external onlyOwner {
        uint256 previous = unlockDelay;
        unlockDelay = newUnlockDelay;
        emit UnlockDelayUpdated(previous, newUnlockDelay);
    }

    /**
     * @notice Create a withdrawal request for up to `amount` assets, enforce timelock.
     * @dev `amount` is expressed in the underlying asset units. The user must
     *      hold enough shares such that `convertToAssets(balanceOf(msg.sender)) >= amount`.
     *      Only one pending request per user is allowed at a time.
     * @param amount The maximum amount of assets the user intends to withdraw after the delay.
     */
    function requestWithdrawal(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        // Ensure the user has enough shares to cover the requested asset amount
        require(
            convertToAssets(balanceOf(msg.sender)) >= amount,
            "Insufficient withdrawable assets"
        );
        //  check if there's already a pending request
        require(
            withdrawalRequests[msg.sender].amount == 0,
            "Existing withdrawal request pending"
        );
        withdrawalRequests[msg.sender] = WithdrawalRequest({
            amount: amount,
            unlockBlock: block.number + unlockDelay
        });

        emit WithdrawalRequested(
            msg.sender,
            amount,
            block.number + unlockDelay
        );
    }

    /**
     * @notice Withdraw `assets` of the underlying to `receiver`, burning the necessary shares from `owner`.
     * @dev Requires a prior withdrawal request and that the timelock has elapsed.
     *      Clears the pending request once executed. Uses ERC-4626 accounting for conversions.
     * @param assets Amount of underlying assets to withdraw.
     * @param receiver Recipient of the assets.
     * @param owner Owner whose shares are burned (allowance required if `msg.sender != owner`).
     * @return sharesBurned The number of shares burned in the operation (per ERC-4626).
     */
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public virtual override returns (uint256) {
        WithdrawalRequest memory request = withdrawalRequests[owner];
        require(request.amount > 0, "No withdrawal request");
        require(block.number >= request.unlockBlock, "Unlock delay not met");
        require(assets <= request.amount, "Exceeds requested amount");

        // Clear the request
        delete withdrawalRequests[owner];

        return super.withdraw(assets, receiver, owner);
    }

    /**
     * @notice Redeem `shares` to receive the corresponding assets to `receiver`, burning from `owner`.
     * @dev Requires a prior withdrawal request and that the timelock has elapsed.
     *      Validates that the asset value of the requested shares does not exceed the request cap.
     *      Clears the pending request once executed.
     * @param shares Number of shares to redeem.
     * @param receiver Recipient of the assets.
     * @param owner Owner whose shares are burned (allowance required if `msg.sender != owner`).
     * @return assetsOut The amount of assets returned (per ERC-4626).
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public virtual override returns (uint256) {
        uint256 assets = previewRedeem(shares);
        WithdrawalRequest memory request = withdrawalRequests[owner];
        require(request.amount > 0, "No withdrawal request");
        require(block.number >= request.unlockBlock, "Unlock delay not met");
        require(assets <= request.amount, "Exceeds requested amount");

        // Clear the request
        delete withdrawalRequests[owner];

        return super.redeem(shares, receiver, owner);
    }
}
