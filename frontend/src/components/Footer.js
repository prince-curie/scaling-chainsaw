import React from 'react';
import './styles/Footer.css';

const Footer = () => {
	return (
		<div className='zuri__footer section__padding'>
			<div className='zuri__footer-heading'>
				<h1 className='gradient__text'>
					Do you want to get a feel of the future before others with the
					decentralized web?
				</h1>
			</div>
			<div className='zuri__footer-btn'>
				<p>Get Early Access</p>
			</div>
			<div className='zuri__footer-links'>
				<div className='zuri__footer-links_logo'>
					<h1>ZuriElection</h1>
					<p>Lagos, Nigeria</p>
				</div>
				<div className='zuri__footer-links_div'>
					<h4>Links</h4>
					<p>Overview</p>
					<p>Social Media</p>
					<p>Contacts</p>
					<p>Blog</p>
				</div>
				<div className='zuri__footer-links_div'>
					<h4>Company</h4>
					<p>Terms &#38; Conditions</p>
					<p>Privacy Policy</p>
					<p>Team</p>
				</div>

				<div className='zuri__footer-links_div'>
					<h4>Get in touch</h4>
					<p>www.zuri_election.com</p>
					<p>01-777-3455</p>
					<p>info@zurielection.com</p>
				</div>
			</div>
			<div className='zuri__footer-copyright'>
				<p> &copy; 2022 ZuriElection. All rights reserved.</p>
			</div>
		</div>
	);
};

export default Footer;
