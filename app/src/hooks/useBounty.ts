'use client';

import { useState, useEffect } from 'react';
import { useProgram } from './useProgram';
import { getBountyPDA } from '../utils/pdas';
import { PublicKey } from '@solana/web3.js';

export interface BountyData {
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
}

export function useBounty(bountyId: number) {
	const { program } = useProgram();
	const [bounty, setBounty] = useState<BountyData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBounty = async () => {
			if (!program || bountyId === undefined) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				const [bountyPda] = getBountyPDA(bountyId);
				const account = await program.account.bounty.fetch(bountyPda);

				setBounty({
					id: (account as any).id.toNumber(),
					creator: (account as any).creator.toBase58(),
					rewardAmount: (account as any).rewardAmount.toNumber(),
					status: (account as any).status,
					assignee: (account as any).assignee ? (account as any).assignee.toBase58() : null,
					githubIssueUrl: (account as any).githubIssueUrl,
					repoName: (account as any).repoName,
					issueNumber: (account as any).issueNumber.toNumber(),
					createdAt: (account as any).createdAt.toNumber(),
					completedAt: (account as any).completedAt ? (account as any).completedAt.toNumber() : null,
					bump: (account as any).bump,
				});
			} catch (err) {
				console.error('Error fetching bounty:', err);
				setError(err instanceof Error ? err.message : 'Failed to fetch bounty');
				setBounty(null);
			} finally {
				setLoading(false);
			}
		};

		fetchBounty();
	}, [program, bountyId]);

	const refetch = async () => {
		if (!program || bountyId === undefined) return;

		try {
			setLoading(true);
			const [bountyPda] = getBountyPDA(bountyId);
			const account = await program.account.bounty.fetch(bountyPda);

			setBounty({
				id: (account as any).id.toNumber(),
				creator: (account as any).creator.toBase58(),
				rewardAmount: (account as any).rewardAmount.toNumber(),
				status: (account as any).status,
				assignee: (account as any).assignee ? (account as any).assignee.toBase58() : null,
				githubIssueUrl: (account as any).githubIssueUrl,
				repoName: (account as any).repoName,
				issueNumber: (account as any).issueNumber.toNumber(),
				createdAt: (account as any).createdAt.toNumber(),
				completedAt: (account as any).completedAt ? (account as any).completedAt.toNumber() : null,
				bump: (account as any).bump,
			});
		} catch (err) {
			console.error('Error refetching bounty:', err);
		} finally {
			setLoading(false);
		}
	};

	return { bounty, loading, error, refetch };
}
