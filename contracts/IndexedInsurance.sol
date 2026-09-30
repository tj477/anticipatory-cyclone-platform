// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IndexedInsurance
 * @dev Autonomous Parametric Cyclone Risk Insurance Smart Contract
 * Integrated with Chainlink Decentralized Oracle Networks (DONs) for anticipatory liquidity.
 * Implements pre-landfall cash release (72h prior) based on verified storm surge height.
 */

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId) external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract IndexedInsurance {
    // --- State Variables ---
    address public immutable owner;
    AggregatorV3Interface public immutable surgeHeightOracle;

    string public cycloneId;
    string public targetRegion;
    
    // Threshold in centimeters (e.g., 250 = 2.50 meters surge)
    int256 public immutable triggerSurgeThresholdCm; 
    
    // Escrow and Payout State
    uint256 public totalEscrowPool;
    uint256 public payoutPerBeneficiary;
    bool public isSettled;
    uint256 public settlementTimestamp;
    int256 public recordedSurgeAtSettlement;

    struct Beneficiary {
        string nationalIdHash;
        string mobileWalletNumber; // e.g. bKash / Nagad identifier
        address walletAddress;
        bool hasReceivedPayout;
        uint256 payoutAmount;
    }

    mapping(address => Beneficiary) public beneficiaries;
    address[] public beneficiaryAddresses;

    // --- Events ---
    event EscrowFunded(address indexed donor, uint256 amount);
    event BeneficiaryRegistered(address indexed wallet, string nationalIdHash, string mobileWallet);
    event ParametricThresholdEvaluated(int256 currentSurgeCm, int256 thresholdCm, bool triggered);
    event PolicyTriggeredAndSettled(
        string cycloneId,
        int256 surgeHeightCm,
        uint256 timestamp,
        uint256 totalDisbursed,
        uint256 beneficiariesCount
    );
    event LiquidityDisbursed(address indexed beneficiary, string mobileWallet, uint256 amount);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "IndexedInsurance: caller is not the owner");
        _;
    }

    modifier notSettled() {
        require(!isSettled, "IndexedInsurance: policy has already been settled");
        _;
    }

    /**
     * @param _oracleAddress Address of the Chainlink Surge Height Oracle
     * @param _cycloneId Identifier of tracking cyclone (e.g., "CYCLONE-AMPHAN-2026")
     * @param _region Target vulnerable district / coastal region
     * @param _thresholdCm Surge height trigger in cm (e.g. 250 for 2.5m)
     * @param _payoutPerBeneficiary Amount in wei distributed to each registered entity
     */
    constructor(
        address _oracleAddress,
        string memory _cycloneId,
        string memory _region,
        int256 _thresholdCm,
        uint256 _payoutPerBeneficiary
    ) {
        require(_oracleAddress != address(0), "Invalid oracle address");
        owner = msg.sender;
        surgeHeightOracle = AggregatorV3Interface(_oracleAddress);
        cycloneId = _cycloneId;
        targetRegion = _region;
        triggerSurgeThresholdCm = _thresholdCm;
        payoutPerBeneficiary = _payoutPerBeneficiary;
    }

    /**
     * @notice Fund the escrow pool (Governments, UN OCHA, Reinsurers, Donors)
     */
    function fundEscrow() external payable {
        require(msg.value > 0, "IndexedInsurance: must send funds");
        totalEscrowPool += msg.value;
        emit EscrowFunded(msg.sender, msg.value);
    }

    /**
     * @notice Register vulnerable community members prior to disaster onset
     */
    function registerBeneficiary(
        address _wallet,
        string calldata _nationalIdHash,
        string calldata _mobileWallet
    ) external onlyOwner notSettled {
        require(_wallet != address(0), "Invalid address");
        require(bytes(beneficiaries[_wallet].nationalIdHash).length == 0, "Already registered");

        beneficiaries[_wallet] = Beneficiary({
            nationalIdHash: _nationalIdHash,
            mobileWalletNumber: _mobileWallet,
            walletAddress: _wallet,
            hasReceivedPayout: false,
            payoutAmount: 0
        });

        beneficiaryAddresses.push(_wallet);
        emit BeneficiaryRegistered(_wallet, _nationalIdHash, _mobileWallet);
    }

    /**
     * @notice Autonomous Evaluation & Settlement
     * Can be invoked by Chainlink Automation / Gemini Agent / Authorized DON operator.
     * Checks if current PINN-verified or gauge surge exceeds threshold.
     */
    function evaluateAndExecuteTrigger() external notSettled returns (bool) {
        (, int256 latestSurgeCm, , uint256 updatedAt, ) = surgeHeightOracle.latestRoundData();
        require(updatedAt > 0, "IndexedInsurance: oracle data incomplete");

        bool conditionMet = latestSurgeCm >= triggerSurgeThresholdCm;
        emit ParametricThresholdEvaluated(latestSurgeCm, triggerSurgeThresholdCm, conditionMet);

        if (conditionMet) {
            _executeSettlement(latestSurgeCm);
            return true;
        }

        return false;
    }

    /**
     * @dev Internal disbursement loop transferring liquidity immediately
     */
    function _executeSettlement(int256 _recordedSurge) internal {
        isSettled = true;
        settlementTimestamp = block.timestamp;
        recordedSurgeAtSettlement = _recordedSurge;

        uint256 count = beneficiaryAddresses.length;
        uint256 totalDisbursed = 0;

        for (uint256 i = 0; i < count; i++) {
            address beneficiaryAddr = beneficiaryAddresses[i];
            Beneficiary storage b = beneficiaries[beneficiaryAddr];

            if (!b.hasReceivedPayout && address(this).balance >= payoutPerBeneficiary) {
                b.hasReceivedPayout = true;
                b.payoutAmount = payoutPerBeneficiary;
                totalDisbursed += payoutPerBeneficiary;

                // Transfer native token (ETH / Matic / Local stablecoin)
                (bool success, ) = payable(beneficiaryAddr).call{value: payoutPerBeneficiary}("");
                require(success, "Transfer failed");

                emit LiquidityDisbursed(beneficiaryAddr, b.mobileWalletNumber, payoutPerBeneficiary);
            }
        }

        emit PolicyTriggeredAndSettled(
            cycloneId,
            _recordedSurge,
            settlementTimestamp,
            totalDisbursed,
            count
        );
    }

    /**
     * @notice Read beneficiary count
     */
    function getBeneficiaryCount() external view returns (uint256) {
        return beneficiaryAddresses.length;
    }

    /**
     * @notice Emergency contract balance query
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
