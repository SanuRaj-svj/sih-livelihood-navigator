// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CredentialRegistry {
    mapping(bytes32 => bool) private anchoredCredentials;

    event CredentialAnchored(bytes32 indexed credentialHash, address indexed issuer);

    function anchorCredential(bytes32 credentialHash) external {
        require(!anchoredCredentials[credentialHash], "Credential already anchored");
        anchoredCredentials[credentialHash] = true;
        emit CredentialAnchored(credentialHash, msg.sender);
    }

    function isCredentialAnchored(bytes32 credentialHash) external view returns (bool) {
        return anchoredCredentials[credentialHash];
    }
}
