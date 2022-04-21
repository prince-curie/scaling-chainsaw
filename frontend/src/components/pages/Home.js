import React from 'react';
import Welcome from '../../assets/welcome.png';
import '../styles/Home.css';

const Home = () => {
	return (
		<div className='home'>
			<div className='left'>
				<img src={Welcome} alt='Welcome' />
			</div>
			<div className='right'>
				<h1>ZuriDAO a Decentralize Autonomous Organization</h1>
				<p>
					We put the needs and care of the leaders of tomorrow above all else,
					grooming them to be world class leaders.
				</p>
			</div>
		</div>
	);
};

export default Home;
