'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletContextProviderProps {
	children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
	// You can change this to 'devnet', 'testnet', or 'mainnet-beta'
	const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

	// Custom RPC endpoint (optional)
	const endpoint = useMemo(() => {
		if (network === 'localhost') {
			return 'http://localhost:8899';
		}
		return clusterApiUrl(network as any);
	}, [network]);

	// Initialize wallets
	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter(),
		],
		[]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>
					{children}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};
