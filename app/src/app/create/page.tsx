'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WalletButton } from '@/components/WalletButton';
import { BountyForm } from '@/components/BountyForm';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from '@/hooks/useProgram';
import { getProgramConfigPDA } from '@/utils/pdas';
import { useState, useEffect } from 'react';
import styles from './create.module.css';

export default function CreateBounty() {
	const router = useRouter();
	const { publicKey } = useWallet();
	const { program } = useProgram();
	const [bountyCount, setBountyCount] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchConfig = async () => {
			if (!program) {
				setLoading(false);
				return;
			}

			try {
				const [configPda] = getProgramConfigPDA();
				const config = await program.account.programConfig.fetch(configPda);
				setBountyCount((config as any).bountyCount.toNumber());
			} catch (err) {
				console.error('Error fetching config:', err);
				setBountyCount(0);
			} finally {
				setLoading(false);
			}
		};

		fetchConfig();
	}, [program]);

	const handleSuccess = () => {
		router.push('/');
	};

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
					<div className={styles.content}>
						<div className={styles.formSection}>
							<Link href="/" className={styles.backLink}>
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
								</svg>
								Back to Bounties
							</Link>

							<h1 className={styles.title}>Create a New Bounty</h1>
							<p className={styles.subtitle}>
								Create a bounty for a GitHub issue or pull request.
								Funds will be locked on-chain until the work is completed.
							</p>

							{!publicKey ? (
								<div className={styles.connectWallet}>
									<svg className={styles.walletIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
									<h3>Connect Your Wallet</h3>
									<p>You need to connect your wallet to create a bounty</p>
									<WalletButton />
								</div>
							) : loading ? (
								<div className={styles.loading}>
									<div className="spinner"></div>
									<p>Loading...</p>
								</div>
							) : (
								<div className={styles.formCard}>
									<BountyForm onSuccess={handleSuccess} bountyCount={bountyCount} />
								</div>
							)}
						</div>

						<div className={styles.infoSection}>
							<div className="card">
								<h3>How it Works</h3>
								<ol className={styles.steps}>
									<li>
										<strong>Paste GitHub URL</strong>
										<p>Link your bounty to a real GitHub issue or pull request</p>
									</li>
									<li>
										<strong>Set Reward Amount</strong>
										<p>Specify how much SOL you want to reward the contributor</p>
									</li>
									<li>
										<strong>Lock Funds</strong>
										<p>Funds are escrowed on-chain in a secure PDA account</p>
									</li>
									<li>
										<strong>Complete & Reward</strong>
										<p>Once work is verified, release funds to the contributor</p>
									</li>
								</ol>
							</div>

							<div className="card mt-lg">
								<h3>Benefits</h3>
								<ul className={styles.benefits}>
									<li>
										<svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										Trustless escrow on Solana blockchain
									</li>
									<li>
										<svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										Transparent and verifiable transactions
									</li>
									<li>
										<svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										Low fees thanks to Solana's efficiency
									</li>
									<li>
										<svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										Instant payments to contributors
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
