// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Voting{
    struct Candidate{
        string name;
        string party;
        string imageUri;
    }

    mapping (uint256 => Candidate) public candidates;
    uint256 public candidateCount;

    address public owner;

    mapping (uint256 => uint256) public votes;
    uint256 public totalVotes;

    constructor() {
        owner = msg.sender;
    }

    function addCandidate(string calldata name, string calldata party, string calldata imageUri) public{
        require(owner == msg.sender, "Not the owner of the contract");
        candidateCount++;
        Candidate memory person = Candidate({name: name, party: party, imageUri: imageUri});
        candidates[candidateCount] = person;
    }

    function vote(uint256 id) public{
        require(id > 0, "Candidate doesn't exist");
        require(id <= candidateCount, "Candidate doesn't exist");
        votes[id]++;
        totalVotes++;
    }

    function removeCandidate(uint256 id) public {
        require(owner == msg.sender, "Not the owner of the contract");
        require(id > 0 && id <= candidateCount, "Invalid candidate ID");
        
        // Shift all candidates after the removed one
        for(uint256 i = id; i < candidateCount; i++) {
            candidates[i] = candidates[i + 1];
            votes[i] = votes[i + 1];
        }
        
        // Clear the last candidate
        delete candidates[candidateCount];
        delete votes[candidateCount];
        candidateCount--;
    }
}