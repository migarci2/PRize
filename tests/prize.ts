import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Prize } from "../target/types/prize";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("prize", () => {
	// Configure the client to use the local cluster
	const provider = anchor.AnchorProvider.env();
	anchor.setProvider(provider);

	const program = anchor.workspace.Prize as Program<Prize>;
	const authority = provider.wallet as anchor.Wallet;

	// Test accounts
	let configPda: PublicKey;
	let configBump: number;
	let bounty1Pda: PublicKey;
	let bounty1Bump: number;

	const bountyId = new anchor.BN(1);
	const rewardAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL
	const githubIssueUrl = "https://github.com/test/repo/issues/1";
	const repoName = "test/repo";
	const issueNumber = new anchor.BN(1);

	// Generate a contributor keypair
	const contributor = anchor.web3.Keypair.generate();

	before(async () => {
		// Derive PDAs
		[configPda, configBump] = PublicKey.findProgramAddressSync(
			[Buffer.from("config")],
			program.programId
		);

		[bounty1Pda, bounty1Bump] = PublicKey.findProgramAddressSync(
			[Buffer.from("bounty"), bountyId.toArrayLike(Buffer, "le", 8)],
			program.programId
		);

		// Airdrop SOL to contributor for testing
		const signature = await provider.connection.requestAirdrop(
			contributor.publicKey,
			2 * LAMPORTS_PER_SOL
		);
		await provider.connection.confirmTransaction(signature);
	});

	it("Initializes the program config", async () => {
		const tx = await program.methods
			.initialize()
			.accounts({
				config: configPda,
				authority: authority.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();

		console.log("Initialize transaction signature:", tx);

		// Fetch and verify config account
		const config = await program.account.programConfig.fetch(configPda);
		assert.ok(config.authority.equals(authority.publicKey));
		assert.equal(config.bountyCount.toNumber(), 0);
		assert.equal(config.bump, configBump);
	});

	it("Creates a bounty with escrowed funds", async () => {
		const creatorBalanceBefore = await provider.connection.getBalance(
			authority.publicKey
		);

		const tx = await program.methods
			.createBounty(bountyId, rewardAmount, githubIssueUrl, repoName, issueNumber)
			.accounts({
				bounty: bounty1Pda,
				config: configPda,
				creator: authority.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();

		console.log("Create bounty transaction signature:", tx);

		// Fetch and verify bounty account
		const bounty = await program.account.bounty.fetch(bounty1Pda);
		assert.equal(bounty.id.toNumber(), bountyId.toNumber());
		assert.ok(bounty.creator.equals(authority.publicKey));
		assert.equal(bounty.rewardAmount.toNumber(), rewardAmount.toNumber());
		assert.deepEqual(bounty.status, { open: {} });
		assert.equal(bounty.assignee, null);
		assert.equal(bounty.githubIssueUrl, githubIssueUrl);
		assert.equal(bounty.repoName, repoName);
		assert.equal(bounty.issueNumber.toNumber(), issueNumber.toNumber());
		assert.ok(bounty.createdAt.toNumber() > 0);
		assert.equal(bounty.completedAt, null);

		// Verify escrow (bounty PDA should have funds)
		const bountyBalance = await provider.connection.getBalance(bounty1Pda);
		assert.ok(bountyBalance >= rewardAmount.toNumber());

		// Verify config counter incremented
		const config = await program.account.programConfig.fetch(configPda);
		assert.equal(config.bountyCount.toNumber(), 1);
	});

	it("Assigns a bounty to a contributor", async () => {
		const tx = await program.methods
			.assignBounty()
			.accounts({
				bounty: bounty1Pda,
				creator: authority.publicKey,
				assignee: contributor.publicKey,
			})
			.rpc();

		console.log("Assign bounty transaction signature:", tx);

		// Fetch and verify updated bounty
		const bounty = await program.account.bounty.fetch(bounty1Pda);
		assert.ok(bounty.assignee.equals(contributor.publicKey));
		assert.deepEqual(bounty.status, { inProgress: {} });
	});

	it("Completes a bounty and transfers funds to recipient", async () => {
		const recipientBalanceBefore = await provider.connection.getBalance(
			contributor.publicKey
		);

		const tx = await program.methods
			.completeBounty()
			.accounts({
				bounty: bounty1Pda,
				creator: authority.publicKey,
				recipient: contributor.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();

		console.log("Complete bounty transaction signature:", tx);

		// Verify recipient received funds
		const recipientBalanceAfter = await provider.connection.getBalance(
			contributor.publicKey
		);
		const receivedAmount = recipientBalanceAfter - recipientBalanceBefore;
		assert.equal(receivedAmount, rewardAmount.toNumber());

		// Verify bounty account is closed
		try {
			await program.account.bounty.fetch(bounty1Pda);
			assert.fail("Bounty account should be closed");
		} catch (error) {
			assert.ok(error.message.includes("Account does not exist"));
		}
	});

	it("Creates and cancels a bounty with refund", async () => {
		const bountyId2 = new anchor.BN(2);
		const [bounty2Pda] = PublicKey.findProgramAddressSync(
			[Buffer.from("bounty"), bountyId2.toArrayLike(Buffer, "le", 8)],
			program.programId
		);

		// Create bounty
		await program.methods
			.createBounty(
				bountyId2,
				rewardAmount,
				"https://github.com/test/repo/issues/2",
				repoName,
				new anchor.BN(2)
			)
			.accounts({
				bounty: bounty2Pda,
				config: configPda,
				creator: authority.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();

		const creatorBalanceBefore = await provider.connection.getBalance(
			authority.publicKey
		);

		// Cancel bounty
		const tx = await program.methods
			.cancelBounty()
			.accounts({
				bounty: bounty2Pda,
				creator: authority.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();

		console.log("Cancel bounty transaction signature:", tx);

		// Verify creator received refund
		const creatorBalanceAfter = await provider.connection.getBalance(
			authority.publicKey
		);
		const refundedAmount = creatorBalanceAfter - creatorBalanceBefore;

		// Refund should be reward amount plus rent (account closure)
		assert.ok(refundedAmount >= rewardAmount.toNumber());

		// Verify bounty account is closed
		try {
			await program.account.bounty.fetch(bounty2Pda);
			assert.fail("Bounty account should be closed");
		} catch (error) {
			assert.ok(error.message.includes("Account does not exist"));
		}
	});

	it("Fails to complete bounty when not creator", async () => {
		const bountyId3 = new anchor.BN(3);
		const [bounty3Pda] = PublicKey.findProgramAddressSync(
			[Buffer.from("bounty"), bountyId3.toArrayLike(Buffer, "le", 8)],
			program.programId
		);

		// Create bounty as authority
		await program.methods
			.createBounty(
				bountyId3,
				rewardAmount,
				"https://github.com/test/repo/issues/3",
				repoName,
				new anchor.BN(3)
			)
			.accounts({
				bounty: bounty3Pda,
				config: configPda,
				creator: authority.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();

		// Try to complete as contributor (not creator)
		try {
			await program.methods
				.completeBounty()
				.accounts({
					bounty: bounty3Pda,
					creator: contributor.publicKey,
					recipient: contributor.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.signers([contributor])
				.rpc();

			assert.fail("Should have failed with unauthorized error");
		} catch (error) {
			assert.ok(error.toString().includes("UnauthorizedAccess") ||
				error.toString().includes("ConstraintSeeds"));
		}

		// Clean up - complete bounty as creator
		await program.methods
			.completeBounty()
			.accounts({
				bounty: bounty3Pda,
				creator: authority.publicKey,
				recipient: contributor.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();
	});

	it("Fails to cancel assigned bounty", async () => {
		const bountyId4 = new anchor.BN(4);
		const [bounty4Pda] = PublicKey.findProgramAddressSync(
			[Buffer.from("bounty"), bountyId4.toArrayLike(Buffer, "le", 8)],
			program.programId
		);

		// Create and assign bounty
		await program.methods
			.createBounty(
				bountyId4,
				rewardAmount,
				"https://github.com/test/repo/issues/4",
				repoName,
				new anchor.BN(4)
			)
			.accounts({
				bounty: bounty4Pda,
				config: configPda,
				creator: authority.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();

		await program.methods
			.assignBounty()
			.accounts({
				bounty: bounty4Pda,
				creator: authority.publicKey,
				assignee: contributor.publicKey,
			})
			.rpc();

		// Try to cancel assigned bounty (should fail)
		try {
			await program.methods
				.cancelBounty()
				.accounts({
					bounty: bounty4Pda,
					creator: authority.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc();

			assert.fail("Should have failed with invalid status error");
		} catch (error) {
			assert.ok(error.toString().includes("InvalidBountyStatus"));
		}

		// Clean up
		await program.methods
			.completeBounty()
			.accounts({
				bounty: bounty4Pda,
				creator: authority.publicKey,
				recipient: contributor.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.rpc();
	});
});
