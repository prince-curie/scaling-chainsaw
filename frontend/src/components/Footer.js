import React from 'react';
import './styles/Footer.css';
import { FaFacebookF } from 'react-icons/fa';
import { FaTwitter } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa';
import { FaLinkedin } from 'react-icons/fa';
// import { FaMapMarker } from 'react-icons/fa';
// import { FaPhone } from 'react-icons/fa';
// import { FaEnvelope } from 'react-icons/fa';

const Footer = () => {
	return (
		<div className='footer'>
			<div className='socials'>
				<FaFacebookF />
				<FaInstagram />
				<FaTwitter />
				<FaLinkedin />
				<p>&copy; 2022 zuridao.com</p>
			</div>
		</div>
	);
};

export default Footer;
