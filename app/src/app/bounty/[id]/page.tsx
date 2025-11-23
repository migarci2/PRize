'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { WalletButton } from '@/components/WalletButton';
import { useBounty } from '@/hooks/useBounty';
import { useProgram } from '@/hooks/useProgram';
import { getBountyPDA } from '@/utils/pdas';
import { lamportsToSol, getStatusText, getStatusBadgeClass, formatDate, truncateAddress } from '@/utils/formatting';
import styles from './bounty.module.css';

export default function BountyDetail() {
	const params = useParams();
	const router = useRouter();
	const { publicKey } = useWallet();
	const { program } = useProgram();
	const bountyId = parseInt(params.id as string);
	const { bounty, loading, error, refetch } = useBounty(bountyId);

	const [recipientAddress, setRecipientAddress] = useState('');
	const [assigneeAddress, setAssigneeAddress] = useState('');
	const [txLoading, setTxLoading] = useState(false);
	const [txError, setTxError] = useState<string | null>(null);

	const isCreator = bounty && publicKey && bounty.creator === publicKey.toBase58();
	const isOpen = bounty && bounty.status.open;
	const isInProgress = bounty && bounty.status.inProgress;

	const handleAssign = async () => {
		if (!program || !bounty || !publicKey) return;

		try {
			setTxLoading(true);
			setTxError(null);

			const assignee = new PublicKey(assigneeAddress);
			const [bountyPda] = getBountyPDA(bountyId);

			await program.methods
				.assignBounty()
				.accounts({
					bounty: bountyPda,
					creator: publicKey,
					assignee: assignee,
				})
				.rpc();

			await refetch();
			setAssigneeAddress('');
		} catch (err) {
			console.error('Error assigning bounty:', err);
			setTxError(err instanceof Error ? err.message : 'Failed to assign bounty');
		} finally {
			setTxLoading(false);
		}
	};

	const handleComplete = async () => {
		if (!program || !bounty || !publicKey) return;

		try {
			setTxLoading(true);
			setTxError(null);

			const recipient = new PublicKey(recipientAddress);
			const [bountyPda] = getBountyPDA(bountyId);

			await program.methods
				.completeBounty()
				.accounts({
					bounty: bountyPda,
					creator: publicKey,
					recipient: recipient,
					systemProgram: SystemProgram.programId,
				})
				.rpc();

			// Redirect to home after completion
			setTimeout(() => router.push('/'), 2000);
		} catch (err) {
			console.error('Error completing bounty:', err);
			setTxError(err instanceof Error ? err.message : 'Failed to complete bounty');
		} finally {
			setTxLoading(false);
		}
	};

	const handleCancel = async () => {
		if (!program || !bounty || !publicKey) return;

		if (!confirm('Are you sure you want to cancel this bounty? This action cannot be undone.')) {
			return;
		}

		try {
			setTxLoading(true);
			setTxError(null);

			const [bountyPda] = getBountyPDA(bountyId);

			await program.methods
				.cancelBounty()
				.accounts({
					bounty: bountyPda,
					creator: publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc();

			// Redirect to home after cancellation
			setTimeout(() => router.push('/'), 2000);
		} catch (err) {
			console.error('Error cancelling bounty:', err);
			setTxError(err instanceof Error ? err.message : 'Failed to cancel bounty');
		} finally {
			setTxLoading(false);
		}
	};

	if (loading) {
		return (
			<div className={styles.page}>
				<div className="container">
					<div className={styles.loading}>
						<div className="spinner"></div>
						<p>Loading bounty...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error || !bounty) {
		return (
			<div className={styles.page}>
				<div className="container">
					<div className={styles.error}>
						<p>Error: {error || 'Bounty not found'}</p>
						<Link href="/" className="button button-primary mt-lg">
							Back to Bounties
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const statusText = getStatusText(bounty.status);
	const badgeClass = getStatusBadgeClass(statusText);

	return (
		<div className={styles.page}>
			{/* Header */}
			<header className={styles.header}>
				<div className="container">
					<div className={styles.nav}>
						<Link href="/" className={styles.logo}>
							<svg className={styles.logoIcon} fill="currentColor" viewBox="0 0 397.7 311.7">
								<path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
								<path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
								<path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
							</svg>
							<span className={styles.logoText}>PRize</span>
						</Link>
						<WalletButton />
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className={styles.main}>
				<div className="container">
					<Link href="/" className={styles.backLink}>
						<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						Back to Bounties
					</Link>

					<div className={styles.bountyHeader}>
						<div>
							<div className={styles.bountyMeta}>
								<span className={styles.bountyId}>Bounty #{bounty.id}</span>
								<span className={`badge ${badgeClass}`}>{statusText}</span>
							</div>
							<h1 className={styles.bountyTitle}>{bounty.repoName} - Issue #{bounty.issueNumber}</h1>
						</div>
						<div className={styles.reward}>
							<span className={styles.rewardLabel}>Reward</span>
							<span className={styles.rewardAmount}>{lamportsToSol(bounty.rewardAmount)} SOL</span>
						</div>
					</div>

					<div className={styles.content}>
						<div className={styles.mainColumn}>
							<div className="card">
								<h3>GitHub Issue</h3>
								<a href={bounty.githubIssueUrl} target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
									<svg className={styles.githubIcon} fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
									</svg>
									{bounty.githubIssueUrl}
									<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
									</svg>
								</a>
							</div>

							{isCreator && isOpen && (
								<div className="card mt-lg">
									<h3>Assign Bounty</h3>
									<p className="text-muted" style={{ fontSize: '0.875rem' }}>
										Assign this bounty to a specific contributor
									</p>
									<div className={styles.actionForm}>
										<input
											type="text"
											placeholder="Contributor's wallet address"
											value={assigneeAddress}
											onChange={(e) => setAssigneeAddress(e.target.value)}
										/>
										<button
											onClick={handleAssign}
											disabled={txLoading || !assigneeAddress}
											className="button button-primary"
										>
											{txLoading ? 'Assigning...' : 'Assign Bounty'}
										</button>
									</div>
								</div>
							)}

							{isCreator && (isOpen || isInProgress) && (
								<div className="card mt-lg">
									<h3>Complete Bounty</h3>
									<p className="text-muted" style={{ fontSize: '0.875rem' }}>
										Mark this bounty as complete and release funds to the contributor
									</p>
									<div className={styles.actionForm}>
										<input
											type="text"
											placeholder="Recipient's wallet address"
											value={recipientAddress}
											onChange={(e) => setRecipientAddress(e.target.value)}
										/>
										<button
											onClick={handleComplete}
											disabled={txLoading || !recipientAddress}
											className="button button-primary"
										>
											{txLoading ? 'Completing...' : 'Complete & Release Funds'}
										</button>
									</div>
								</div>
							)}

							{isCreator && isOpen && (
								<div className="card mt-lg">
									<h3>Cancel Bounty</h3>
									<p className="text-muted" style={{ fontSize: '0.875rem' }}>
										Cancel this bounty and get your funds back. This can only be done if the bounty is still open.
									</p>
									<button
										onClick={handleCancel}
										disabled={txLoading}
										className="button button-secondary"
										style={{ marginTop: 'var(--spacing-md)' }}
									>
										{txLoading ? 'Cancelling...' : 'Cancel Bounty'}
									</button>
								</div>
							)}

							{txError && (
								<div className={styles.txError}>
									{txError}
								</div>
							)}
						</div>

						<div className={styles.sidebar}>
							<div className="card">
								<h4>Details</h4>
								<dl className={styles.details}>
									<dt>Creator</dt>
									<dd className={styles.address}>{truncateAddress(bounty.creator)}</dd>

									{bounty.assignee && (
										<>
											<dt>Assigned To</dt>
											<dd className={styles.address}>{truncateAddress(bounty.assignee)}</dd>
										</>
									)}

									<dt>Created</dt>
									<dd>{formatDate(bounty.createdAt)}</dd>

									{bounty.completedAt && (
										<>
											<dt>Completed</dt>
											<dd>{formatDate(bounty.completedAt)}</dd>
										</>
									)}

									<dt>Repository</dt>
									<dd>{bounty.repoName}</dd>

									<dt>Issue Number</dt>
									<dd>#{bounty.issueNumber}</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
