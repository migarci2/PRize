'use client';

import Link from 'next/link';
import { WalletButton } from '@/components/WalletButton';
import { BountyCard } from '@/components/BountyCard';
import { useBounties } from '@/hooks/useBounties';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './page.module.css';

export default function Home() {
	const { publicKey } = useWallet();
	const { bounties, loading, error } = useBounties();

	return (
		<div className={styles.page}>
			{/* Header */}
			<header className={styles.header}>
				<div className="container">
					<div className={styles.nav}>
						<div className={styles.logo}>
							<svg className={styles.logoIcon} fill="currentColor" viewBox="0 0 397.7 311.7">
								<path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
								<path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
								<path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
							</svg>
							<h1 className={styles.logoText}>PRize</h1>
						</div>
						<div className={styles.navLinks}>
							<Link href="/create" className="button button-secondary">
								Create Bounty
							</Link>
							<WalletButton />
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className={styles.hero}>
				<div className="container text-center">
					<h1 className={styles.heroTitle}>
						Reward Open-Source Contributors
					</h1>
					<p className={styles.heroSubtitle}>
						Create trustless bounties on Solana for GitHub issues and pull requests.
						<br />
						Lock funds on-chain and reward contributors transparently.
					</p>
					{!publicKey && (
						<div className={styles.heroCta}>
							<WalletButton />
						</div>
					)}
				</div>
			</section>

			{/* Bounties Section */}
			<section className={styles.bounties}>
				<div className="container">
					<div className={styles.sectionHeader}>
						<h2>Active Bounties</h2>
						{publicKey && (
							<Link href="/create" className="button button-primary">
								+ Create Bounty
							</Link>
						)}
					</div>

					{loading && (
						<div className={styles.loading}>
							<div className="spinner"></div>
							<p>Loading bounties...</p>
						</div>
					)}

					{error && (
						<div className={styles.error}>
							<p>Error loading bounties: {error}</p>
						</div>
					)}

					{!loading && !error && bounties.length === 0 && (
						<div className={styles.empty}>
							<svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
							<h3>No bounties yet</h3>
							<p>Be the first to create a bounty and reward contributors!</p>
							{publicKey && (
								<Link href="/create" className="button button-primary mt-lg">
									Create First Bounty
								</Link>
							)}
						</div>
					)}

					{!loading && !error && bounties.length > 0 && (
						<div className="grid grid-cols-3">
							{bounties.map((bounty) => (
								<BountyCard
									key={bounty.publicKey}
									id={bounty.account.id}
									repoName={bounty.account.repoName}
									issueNumber={bounty.account.issueNumber}
									githubIssueUrl={bounty.account.githubIssueUrl}
									rewardAmount={bounty.account.rewardAmount}
									status={bounty.account.status}
									createdAt={bounty.account.createdAt}
								/>
							))}
						</div>
					)}
				</div>
			</section>

			{/* Footer */}
			<footer className={styles.footer}>
				<div className="container text-center">
					<p>Built with ❤️ on Solana</p>
					<p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
						PRize - Decentralized Micro-Bounty Platform
					</p>
				</div>
			</footer>
		</div>
	);
}
