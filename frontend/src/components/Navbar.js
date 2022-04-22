import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import './styles/Navbar.css';
import { Link } from 'react-router-dom';

const Menu = () => (
	<>
		<Link to='/'>Home</Link>
		<Link to='/vote'>Vote</Link>
		<Link to='/connect'>Connect Wallet</Link>
	</>
);

const Navbar = () => {
	const [toggleMenu, setToggleMenu] = useState(false);
	return (
		<div className='navbar'>
			<div className='navbar-links'>
				<div className='navbar-links_logo'>
					<h1>ZuriElection</h1>
				</div>
				<div className='navbar-links_container'>
					<Menu className='navbar-menu_container' />
				</div>
			</div>
			<div className='navbar-menu'>
				{toggleMenu ? (
					<RiCloseLine
						color='#fff'
						size={27}
						onClick={() => setToggleMenu(false)}
					/>
				) : (
					<RiMenu3Line
						color='#fff'
						size={27}
						onClick={() => setToggleMenu(true)}
					/>
				)}
				{toggleMenu && (
					<div className='navbar-menu_container scale-up-center'>
						<div className='navbar-menu_container-links'>
							<Menu />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Navbar;
