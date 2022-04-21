import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/ZuriDAO.png';
import './styles/Navbar.css';
// import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
	const [openLinks, setOpenLinks] = useState(false);

	const toggleNavbar = () => {
		setOpenLinks(!openLinks);
	};
	return (
		<nav className='navbar'>
			<div className='left' id={openLinks ? 'open' : 'close'}>
				<Link to='/'>
					<img src={logo} alt='zuri dao' />
				</Link>

				<div className='hiddenLinks'>
					<Link to='/'>Home</Link>
					<Link to='/about'>About</Link>
					<Link to='/vote'>Vote</Link>
					<Link to='/connect'>Connect Wallet</Link>
				</div>
			</div>
			<div className='right'>
				<Link to='/'>Home</Link>
				<Link to='/about'>About</Link>
				<Link to='/vote'>Vote</Link>
				<Link to='/connect'>Connect Wallet</Link>
				{/* <button onClick={toggleNavbar}>
					<MenuIcon />
				</button> */}
			</div>
		</nav>
	);
};

export default Navbar;
