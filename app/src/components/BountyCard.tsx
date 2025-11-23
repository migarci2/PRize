'use client';

import { FC } from 'react';
import Link from 'next/link';
import { lamportsToSol, getStatusText, getStatusBadgeClass, formatRelativeTime } from '../utils/formatting';
import styles from './BountyCard.module.css';

interface BountyCardProps {
	id: number;
	repoName: string;
	issueNumber: number;
	githubIssueUrl: string;
	rewardAmount: number;
	status: any;
	createdAt: number;
}

export const BountyCard: FC<BountyCardProps> = ({
	id,
	repoName,
	issueNumber,
	githubIssueUrl,
	rewardAmount,
	status,
	createdAt,
}) => {
	const statusText = getStatusText(status);
	const badgeClass = getStatusBadgeClass(statusText);

	return (
		<Link href={`/bounty/${id}`} className={styles.card}>
			<div className={styles.header}>
				<div className={styles.repo}>
					<svg className={styles.icon} fill="currentColor" viewBox="0 0 20 20">
						<path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
					</svg>
					<span className={styles.repoName}>{repoName}</span>
				</div>
				<span className={`badge ${badgeClass}`}>{statusText}</span>
			</div>

			<div className={styles.issue}>
				<h3 className={styles.issueTitle}>Issue #{issueNumber}</h3>
				<p className={styles.issueUrl}>{githubIssueUrl}</p>
			</div>

			<div className={styles.footer}>
				<div className={styles.reward}>
					<svg className={styles.solIcon} fill="currentColor" viewBox="0 0 397.7 311.7">
						<path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
						<path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
						<path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
					</svg>
					<span className={styles.amount}>{lamportsToSol(rewardAmount)} SOL</span>
				</div>
				<span className={styles.time}>{formatRelativeTime(createdAt)}</span>
			</div>
		</Link>
	);
};
