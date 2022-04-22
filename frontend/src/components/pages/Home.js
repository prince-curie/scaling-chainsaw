import React, { useContext } from 'react';
import { Header } from '../../containers';
import '../styles/Home.css';

// import { VotingContext } from '../../context/VotingContext';

const Home = () => {
	// const { connectWallet } = useContext(VotingContext);

	return (
		<div className='home'>
			{/* <div className='left'>
				<img src={Vote} alt='vote' />
			</div> */}
			{/* <button className='btn' onClick={connectWallet}>
					Connect Wallet
				</button> */}
			{/* </div> */}
			<Header />
		</div>
	);
};

export default Home;
