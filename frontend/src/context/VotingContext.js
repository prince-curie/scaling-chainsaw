// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';

// import { contractABI, contractAddress } from '../utils/constants';

// export const VotingContext = React.createContext();

// const { ethereum } = window;

// const getEthereumContract = () => {
// 	const provider = new ethers.provider.Web3Provider(ethereum);
// 	const signer = provider.getSigner();
// 	const transactionContract = new ethers.Contract(
// 		contractAddress,
// 		contractABI,
// 		signer
// 	);

// 	console.log({
// 		provider,
// 		signer,
// 		transactionContract,
// 	});
// };

// export const TransactionProvider = ({ children }) => {
// 	const [connectedAccount, setConnectedAccount] = useState('');
// 	const checkIfWalletIsConnected = async () => {
// 		if (!ethereum) return alert('Please install metamask');

// 		const accounts = await ethereum.request({ method: 'eth_accounts' });
// 		console.log(accounts);
// 	};

// 	const connectWallet = async () => {
// 		try {
// 			if (!ethereum) return alert('Please install metamask');

// 			const accounts = await ethereum.request({
// 				method: 'eth_requestAccounts',
// 			});
// 			setCurrentAccount(accounts[0]);
// 		} catch (error) {
// 			console.log(error);

// 			throw new Error('No ethereum object.');
// 		}
// 	};
// 	useEffect(() => {
// 		checkIfWalletIsConnected();
// 	}, []);
// 	return (
// 		<VotingContext.Provider value={{ connectWallet }}>
// 			{children}
// 		</VotingContext.Provider>
// 	);
// };
