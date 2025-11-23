# PRize - Decentralized Micro-Bounty Platform 🎯

A trustless, decentralized platform built on Solana that enables open-source maintainers to reward contributors for completing GitHub issues and pull requests.

## Overview

PRize combines on-chain logic with off-chain GitHub integration to create a transparent bounty system. Maintainers create bounties linked to real GitHub issues, lock funds on-chain in escrow, and contributors receive rewards automatically once their work is verified.

## Features

- **Trustless Escrow**: Funds are locked on-chain when bounties are created
- **GitHub Integration**: Link bounties to real GitHub issues and PRs  
- **Transparent**: All bounty data and transactions are publicly verifiable on Solana
- **Low Fees**: Leveraging Solana's low transaction costs
- **Instant Payments**: Contributors receive rewards immediately upon completion

## Architecture

### Blockchain Component (Solana Program)

Built with Anchor framework v0.30.1:

- **Program Instructions**:
  - `initialize`: Set up global program configuration
  - `create_bounty`: Create bounty and escrow SOL
  - `assign_bounty`: Assign bounty to a contributor
  - `complete_bounty`: Release funds to contributor
  - `cancel_bounty`: Cancel and refund creator

- **Account Structures**:
  - `ProgramConfig`: Global state (authority, bounty counter)
  - `Bounty`: Individual bounty data (creator, reward, status, GitHub metadata)

- **Security Features**:
  - PDA-based escrow for funds
  - Creator-only authorization for complete/cancel
  - Status validation for state transitions
  - Input validation (amounts, URL lengths)

### Frontend (Coming Soon)

Built with Next.js 14 + TypeScript:
- Solana Wallet Adapter integration (Phantom, Solflare)
- Bounty creation and management UI
- Real-time on-chain data fetching
- Transaction status feedback

## Prerequisites

- Rust 1.77+
- Solana CLI 1.18+
- Anchor CLI 0.30+
- Node.js 18+
- Phantom or Solflare wallet

## Installation

### 1. Install Solana CLI

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

Add to PATH:
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

### 2. Install Anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 3. Clone and Build

```bash
git clone <repository-url>
cd PRize

# Install test dependencies
npm install

# Build the program
anchor build
```

## Development

### Running Tests

Start a local validator and run tests:

```bash
anchor test
```

This will:
- Start a local Solana validator
- Deploy the program
- Run all test cases including:
  - Program initialization
  - Bounty creation with escrow
  - Bounty assignment
  - Bounty completion with fund transfer
  - Bounty cancellation with refund
  - Authorization and validation tests

### Local Development

1. **Start local validator** (Terminal 1):
   ```bash
   solana-test-validator
   ```

2. **Build and deploy** (Terminal 2):
   ```bash
   anchor build
   anchor deploy
   ```

3. **Test the program**:
   ```bash
   anchor test --skip-local-validator
   ```

### Deploy to Devnet

```bash
# Configure CLI for devnet
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Build and deploy
anchor build
anchor deploy --provider.cluster devnet
```

## Usage Example

### Creating a Bounty

```typescript
const bountyId = new BN(1);
const rewardAmount = new BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL

await program.methods
  .createBounty(
    bountyId,
    rewardAmount,
    "https://github.com/user/repo/issues/123",
    "user/repo",
    new BN(123)
  )
  .accounts({
    bounty: bountyPda,
    config: configPda,
    creator: creator.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Completing a Bounty

```typescript
await program.methods
  .completeBounty()
  .accounts({
    bounty: bountyPda,
    creator: creator.publicKey,
    recipient: contributor.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Project Structure

```
PRize/
├── programs/
│   └── prize/
│       ├── src/
│       │   ├── lib.rs              # Program entry point
│       │   ├── state.rs            # Account structures
│       │   ├── errors.rs           # Custom errors
│       │   └── instructions/       # Instruction handlers
│       │       ├── initialize.rs
│       │       ├── create_bounty.rs
│       │       ├── assign_bounty.rs
│       │       ├── complete_bounty.rs
│       │       └── cancel_bounty.rs
│       └── Cargo.toml
├── tests/
│   └── prize.ts                    # Anchor tests
├── app/                            # Frontend (coming soon)
├── Anchor.toml
└── package.json
```

## Roadmap

- [x] Core Solana program with escrow mechanics
- [x] Comprehensive test suite
- [ ] Next.js frontend with wallet integration
- [ ] GitHub OAuth integration
- [ ] Webhook-based verification
- [ ] Mainnet deployment
- [ ] Multi-token support (SPL tokens)

## Security Considerations

- All funds are held in PDA escrow accounts
- Only the bounty creator can complete or cancel bounties
- Bounties can only be cancelled if not yet assigned
- All state transitions are validated on-chain
- Comprehensive test coverage for edge cases

## Contributing

We welcome contributions! Please feel free to submit issues or pull requests.

## License

MIT License - See LICENSE file for details

## Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ on Solana
