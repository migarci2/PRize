import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number | bigint): string {
	const sol = Number(lamports) / LAMPORTS_PER_SOL;
	return sol.toFixed(4);
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
	return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Truncate a public key for display
 */
export function truncateAddress(address: string | PublicKey, chars = 4): string {
	const addr = typeof address === 'string' ? address : address.toBase58();
	return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

/**
 * Format a date from Unix timestamp
 */
export function formatDate(timestamp: number | bigint): string {
	const date = new Date(Number(timestamp) * 1000);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

/**
 * Format relative time
 */
export function formatRelativeTime(timestamp: number | bigint): string {
	const now = Date.now();
	const then = Number(timestamp) * 1000;
	const diff = now - then;

	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
	if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	return 'Just now';
}

/**
 * Get status badge class name
 */
export function getStatusBadgeClass(status: string): string {
	const statusLower = status.toLowerCase();
	if (statusLower === 'open') return 'badge-open';
	if (statusLower === 'inprogress') return 'badge-inprogress';
	if (statusLower === 'completed') return 'badge-completed';
	if (statusLower === 'cancelled') return 'badge-cancelled';
	return '';
}

/**
 * Get status display text
 */
export function getStatusText(status: any): string {
	if (status.open) return 'Open';
	if (status.inProgress) return 'In Progress';
	if (status.completed) return 'Completed';
	if (status.cancelled) return 'Cancelled';
	return 'Unknown';
}
