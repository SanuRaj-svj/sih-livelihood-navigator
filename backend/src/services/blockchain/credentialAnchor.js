const crypto = require('crypto');
const { ethers } = require('ethers');
const env = require('../../config/env');

const credentialRegistryAbi = [
  'function anchorCredential(bytes32 credentialHash) external',
  'function isCredentialAnchored(bytes32 credentialHash) external view returns (bool)',
];

const digestCredential = (payload) =>
  crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');

const getContract = () => {
  if (!env.BLOCKCHAIN_RPC_URL || !env.BLOCKCHAIN_PRIVATE_KEY || !env.BLOCKCHAIN_CONTRACT_ADDRESS) {
    return null;
  }

  const provider = new ethers.JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
  const wallet = new ethers.Wallet(env.BLOCKCHAIN_PRIVATE_KEY, provider);
  return new ethers.Contract(env.BLOCKCHAIN_CONTRACT_ADDRESS, credentialRegistryAbi, wallet);
};

const anchorCredential = async (credentialHash) => {
  const contract = getContract();
  if (!contract) {
    return {
      network: env.BLOCKCHAIN_NETWORK,
      transactionHash: `mock-${credentialHash}`,
      anchoredAt: new Date(),
    };
  }

  const transaction = await contract.anchorCredential(`0x${credentialHash}`);
  const receipt = await transaction.wait();

  return {
    network: env.BLOCKCHAIN_NETWORK,
    transactionHash: receipt.hash,
    anchoredAt: new Date(),
  };
};

const verifyCredentialAnchor = async (credentialHash, anchor) => {
  const contract = getContract();
  if (!contract) {
    return anchor.transactionHash === `mock-${credentialHash}`;
  }

  return contract.isCredentialAnchored(`0x${credentialHash}`);
};

module.exports = {
  digestCredential,
  anchorCredential,
  verifyCredentialAnchor,
};
