// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WavePortal is Ownable {
    uint256 private _totalWaves;

    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver;
        string message;
        bool owner_approved;
        uint256 timestamp;
    }

    Wave[] private _waves;

    /*
     * "address => uint mapping"は、アドレスと数値を関連付ける
     */
    mapping(address => uint256) public lastWavedAt;

    constructor() Ownable(msg.sender) { }

    function wave(string memory _message) public {
        /*
         * 現在ユーザーがwaveを送信している時刻と、前回waveを送信した時刻が15分以上離れていることを確認。
         */
        require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
            "Wait 15m"
        );

        lastWavedAt[msg.sender] = block.timestamp;
        _totalWaves += 1;
        _waves.push(Wave(msg.sender, _message, false, block.timestamp));
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function setApproveMessage(uint256 idx, bool approved) public onlyOwner {
        _waves[idx].owner_approved = approved;
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return _waves;
    }

    function getTotalWaves() public view returns (uint256) {
        return _totalWaves;
    }


}