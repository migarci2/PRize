'use client';

import { FC } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './WalletButton.module.css';

export const WalletButton: FC = () => {
	return (
		<div className={styles.walletButtonWrapper}>
			<WalletMultiButton />
		</div>
	);
};
