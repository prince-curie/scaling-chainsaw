import React from 'react';
import './Header.css';
import person from '../../assets/person.svg';
import vote from '../../assets/vote.jpg';

const Header = () => {
	return (
		<div className='zuri__header section__padding'>
			<div className='zuri__header-content'>
				<h1 className='gradient__text'>
					Zuri Electoral Board, an Organization committed to making a difference
				</h1>
				<p>
					We put the needs and care of the leaders of tomorrow above all else,
					grooming them to be world class leaders.
				</p>
				<div className='zuri__header-content__people'>
					<img src={person} alt='person' />
					<p>
						Bridging the gap in the decentralized world one vote at a time...
					</p>
				</div>

				<div className='connect-wallet'>
					<button>Connect Wallet</button>
				</div>
			</div>
			{/* <div className='zuri__header-image'>
				<img src={vote} alt='vote' />
			</div> */}
		</div>
	);
};

export default Header;
