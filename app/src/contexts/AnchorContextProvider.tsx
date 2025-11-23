'use client';

import { FC, ReactNode, useMemo } from 'react';
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import idl from '../idl/prize.json';

// This will be the deployed program ID
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

interface AnchorContextProviderProps {
	children: ReactNode;
}

export const AnchorContextProvider: FC<AnchorContextProviderProps> = ({ children }) => {
	const { connection } = useConnection();
	const wallet = useWallet();

	const provider = useMemo(() => {
		if (!wallet) return null;

		const provider = new AnchorProvider(
			connection,
			wallet as any,
			{ commitment: 'confirmed' }
		);

		setProvider(provider);
		return provider;
	}, [connection, wallet]);

	return <>{children}</>;
};
