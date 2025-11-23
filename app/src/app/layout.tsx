import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WalletContextProvider } from '@/contexts/WalletContextProvider';
import { AnchorContextProvider } from '@/contexts/AnchorContextProvider';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'PRize - Decentralized Micro-Bounty Platform',
	description: 'Reward open-source contributors with trustless bounties on Solana',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<WalletContextProvider>
					<AnchorContextProvider>
						{children}
					</AnchorContextProvider>
				</WalletContextProvider>
			</body>
		</html>
	);
}
