import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import './styles/Navbar.css';
import { Link } from 'react-router-dom';
//import { Button } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { connectors } from './connector';
import {ethers} from 'ethers'
import Web3Modal from "web3modal";
import {
	Box,
	HStack,
	Button,
	Text,
	Tooltip,
  } from '@chakra-ui/react';
  import theme from './theme';

// const Menu = ({activate, setProvider, active, account}) => (
// 	<>
// 		<Link to='/'>Home</Link>
// 		<Link to='/vote'>Vote</Link>
// 		{!active ? (<Button onClick={() => {
// 			activate(connectors.injected)
// 			setProvider('injected')
// 		}}>Connect MetaMask</Button>) : 
// 		<h4 as='cite' fontSize="md">{`${account}`}</h4>}
// 	</>
// );



const Navbar = () => {
	const [toggleMenu, setToggleMenu] = useState(false);
	const {
		chainId,
		account,
		activate,
		deactivate,
		active
	  } = useWeb3React();

	const setProvider = (type) => {
        window.localStorage.setItem("provider", type);
    };

// 	const connect = async() => {
// 		const web3Modal = new Web3Modal({
// 			network: "rinkeby", // optional
// 			cacheProvider: true, // optional
// 			providerOptions // required
// 		});

// 		const instance = await web3Modal.connect();

// const provider = new ethers.providers.Web3Provider(instance);
// const signer = provider.getSigner();


// 	}

const disconnect = () => {
    //refreshState();
    deactivate();
  };


	console.log(account, active, chainId)
	return (
		
		<div className='navbar'>
			<div className='navbar-links'>
				<div className='navbar-links_logo'>
					<h1>ZuriElection</h1>
				</div>
				<div className='navbar-links_container'>
				<Link to='/'>Home</Link>
				<Link to='/vote'>Vote</Link>
				{!active ? (<Button colorScheme='teal' onClick={()=> {
					activate(connectors.injected)
					setProvider('injected')
				}}>Connect Wallet</Button>):
                chainId != 3 ? <Box bg='red.400' p={3} color='white'> <Text as='cite' fontSize='md'> You are on the wrong network connect to ropsten</Text> </Box> : 
                <HStack>
                 <Button colorScheme='teal' onClick={disconnect}>Disconnect</Button>
                 <Tooltip label={account} placement='right'>
                   <Text as='cite' fontSize="md">{`${account.slice(0,5) + '....'+ account.slice(40, 48)}`}</Text>
                 </Tooltip>
              </HStack>
              }
				</div>
			</div>
			{/* <div className='navbar-menu'>
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
			</div> */}
		</div>
		
	);
};

export default Navbar;
