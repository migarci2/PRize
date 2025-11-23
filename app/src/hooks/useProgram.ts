'use client';

import { useMemo } from 'react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import idl from '../idl/prize.json';
import { PROGRAM_ID } from '../utils/pdas';

export function useProgram() {
	const { connection } = useConnection();
	const wallet = useWallet();

	const provider = useMemo(() => {
		if (!wallet.publicKey) return null;

		return new AnchorProvider(
			connection,
			wallet as any,
			{ commitment: 'confirmed' }
		);
	}, [connection, wallet]);

	const program = useMemo(() => {
		if (!provider) return null;

		return new Program(idl as any, PROGRAM_ID, provider);
	}, [provider]);

	return { program, provider };
}
