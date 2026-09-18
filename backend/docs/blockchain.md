# Training credential blockchain integration

Completed training credentials are represented by an off-chain MongoDB record and a SHA-256 digest. The digest contains only identifiers and course metadata; beneficiary personal data is not written to the blockchain.

## API

- `POST /api/credentials/training` (OFFICER or ADMIN): issue a credential for a completed enrollment. Body: `{ "enrollmentId": "..." }`.
- `GET /api/credentials/verify/:id`: publicly verify the credential anchor and return its course, hash, network, and transaction hash.

Issuing is idempotent per enrollment. An enrollment must have `status: COMPLETED`.

## Development

With the blockchain settings empty, the service uses `local-mock`. This keeps local development and tests deterministic while preserving the same API and stored anchor shape.

## EVM deployment

Deploy `contracts/CredentialRegistry.sol` to the target EVM network, then configure:

```text
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_RPC_URL=https://...
BLOCKCHAIN_PRIVATE_KEY=0x...
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
```

Never commit the private key. The configured wallet needs enough native-token balance to submit anchor transactions.
