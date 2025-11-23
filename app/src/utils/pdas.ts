import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

/**
 * Get the PDA for the program config
 */
export function getProgramConfigPDA(): [PublicKey, number] {
	return PublicKey.findProgramAddressSync(
		[Buffer.from('config')],
		PROGRAM_ID
	);
}

/**
 * Get the PDA for a specific bounty
 */
export function getBountyPDA(bountyId: number): [PublicKey, number] {
	const idBuffer = Buffer.alloc(8);
	idBuffer.writeBigUInt64LE(BigInt(bountyId));

	return PublicKey.findProgramAddressSync(
		[Buffer.from('bounty'), idBuffer],
		PROGRAM_ID
	);
}

export { PROGRAM_ID };
