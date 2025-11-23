'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '../hooks/useProgram';
import { getProgramConfigPDA, getBountyPDA } from '../utils/pdas';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { solToLamports } from '../utils/formatting';
import styles from './BountyForm.module.css';

interface BountyFormProps {
	onSuccess?: () => void;
	bountyCount: number;
}

export const BountyForm: FC<BountyFormProps> = ({ onSuccess, bountyCount }) => {
	const { publicKey } = useWallet();
	const { program } = useProgram();

	const [githubUrl, setGithubUrl] = useState('');
	const [rewardSol, setRewardSol] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const parseGithubUrl = (url: string) => {
		// Expected format: https://github.com/owner/repo/issues/123
		const match = url.match(/github\.com\/([^\/]+\/[^\/]+)\/issues\/(\d+)/);
		if (!match) {
			throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo/issues/123');
		}
		return {
			repoName: match[1],
			issueNumber: parseInt(match[2]),
		};
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!publicKey || !program) {
			setError('Please connect your wallet first');
			return;
		}

		try {
			setLoading(true);
			setError(null);
			setSuccess(false);

			// Parse GitHub URL
			const { repoName, issueNumber } = parseGithubUrl(githubUrl);

			// Validate reward amount
			const reward = parseFloat(rewardSol);
			if (isNaN(reward) || reward <= 0) {
				throw new Error('Please enter a valid reward amount');
			}

			const rewardLamports = solToLamports(reward);
			const bountyId = bountyCount + 1;

			// Get PDAs
			const [configPda] = getProgramConfigPDA();
			const [bountyPda] = getBountyPDA(bountyId);

			console.log('Creating bounty:', {
				bountyId,
				rewardLamports,
				githubUrl,
				repoName,
				issueNumber,
			});

			// Send transaction
			const tx = await program.methods
				.createBounty(
					new BN(bountyId),
					new BN(rewardLamports),
					githubUrl,
					repoName,
					new BN(issueNumber)
				)
				.accounts({
					bounty: bountyPda,
					config: configPda,
					creator: publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc();

			console.log('Transaction signature:', tx);
			setSuccess(true);

			// Reset form
			setGithubUrl('');
			setRewardSol('');

			if (onSuccess) {
				setTimeout(onSuccess, 2000);
			}
		} catch (err) {
			console.error('Error creating bounty:', err);
			setError(err instanceof Error ? err.message : 'Failed to create bounty');
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.field}>
				<label htmlFor="githubUrl" className={styles.label}>
					GitHub Issue URL
				</label>
				<input
					id="githubUrl"
					type="url"
					value={githubUrl}
					onChange={(e) => setGithubUrl(e.target.value)}
					placeholder="https://github.com/owner/repo/issues/123"
					required
					className={styles.input}
				/>
				<p className={styles.hint}>
					Paste the full URL of the GitHub issue or pull request
				</p>
			</div>

			<div className={styles.field}>
				<label htmlFor="reward" className={styles.label}>
					Reward Amount (SOL)
				</label>
				<input
					id="reward"
					type="number"
					step="0.01"
					min="0.01"
					value={rewardSol}
					onChange={(e) => setRewardSol(e.target.value)}
					placeholder="0.5"
					required
					className={styles.input}
				/>
				<p className={styles.hint}>
					Amount of SOL to reward the contributor
				</p>
			</div>

			{error && (
				<div className={styles.error}>
					<svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
					</svg>
					{error}
				</div>
			)}

			{success && (
				<div className={styles.success}>
					<svg className={styles.successIcon} fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
					</svg>
					Bounty created successfully!
				</div>
			)}

			<button
				type="submit"
				disabled={loading || !publicKey}
				className="button button-primary"
				style={{ width: '100%' }}
			>
				{loading ? (
					<>
						<span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px', marginRight: '8px' }}></span>
						Creating Bounty...
					</>
				) : (
					'Create Bounty'
				)}
			</button>
		</form>
	);
};
