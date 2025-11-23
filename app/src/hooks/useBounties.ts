'use client';

import { useState, useEffect } from 'react';
import { useProgram } from './useProgram';
import { useConnection } from '@solana/wallet-adapter-react';

export interface Bounty {
	publicKey: string;
	account: {
		id: number;
		creator: string;
		rewardAmount: number;
		status: any;
		assignee: string | null;
		githubIssueUrl: string;
		repoName: string;
		issueNumber: number;
		createdAt: number;
		completedAt: number | null;
		bump: number;
	};
}

export function useBounties() {
	const { program } = useProgram();
	const { connection } = useConnection();
	const [bounties, setBounties] = useState<Bounty[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBounties = async () => {
			if (!program) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const accounts = await program.account.bounty.all();

				const bountiesData = accounts.map((account: any) => ({
					publicKey: account.publicKey.toBase58(),
					account: {
						id: account.account.id.toNumber(),
						creator: account.account.creator.toBase58(),
						rewardAmount: account.account.rewardAmount.toNumber(),
						status: account.account.status,
						assignee: account.account.assignee ? account.account.assignee.toBase58() : null,
						githubIssueUrl: account.account.githubIssueUrl,
						repoName: account.account.repoName,
						issueNumber: account.account.issueNumber.toNumber(),
						createdAt: account.account.createdAt.toNumber(),
						completedAt: account.account.completedAt ? account.account.completedAt.toNumber() : null,
						bump: account.account.bump,
					},
				}));

				setBounties(bountiesData);
			} catch (err) {
				console.error('Error fetching bounties:', err);
				setError(err instanceof Error ? err.message : 'Failed to fetch bounties');
				setBounties([]);
			} finally {
				setLoading(false);
			}
		};

		fetchBounties();

		// Poll for updates every 10 seconds
		const interval = setInterval(fetchBounties, 10000);

		return () => clearInterval(interval);
	}, [program, connection]);

	const refetch = async () => {
		if (!program) return;

		try {
			setLoading(true);
			const accounts = await program.account.bounty.all();

			const bountiesData = accounts.map((account: any) => ({
				publicKey: account.publicKey.toBase58(),
				account: {
					id: account.account.id.toNumber(),
					creator: account.account.creator.toBase58(),
					rewardAmount: account.account.rewardAmount.toNumber(),
					status: account.account.status,
					assignee: account.account.assignee ? account.account.assignee.toBase58() : null,
					githubIssueUrl: account.account.githubIssueUrl,
					repoName: account.account.repoName,
					issueNumber: account.account.issueNumber.toNumber(),
					createdAt: account.account.createdAt.toNumber(),
					completedAt: account.account.completedAt ? account.account.completedAt.toNumber() : null,
					bump: account.account.bump,
				},
			}));

			setBounties(bountiesData);
		} catch (err) {
			console.error('Error refetching bounties:', err);
		} finally {
			setLoading(false);
		}
	};

	return { bounties, loading, error, refetch };
}
