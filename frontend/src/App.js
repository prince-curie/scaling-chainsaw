import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import Vote from './components/pages/Vote';
import Footer from './components/Footer';
import {ethers} from 'ethers'
import {Web3ReactProvider} from '@web3-react/core'

const getLibrary = (provider) => {
	const library = new ethers.providers.Web3Provider(provider);
	library.pollingInterval = 8000; // frequency provider is polling
	return library;
  };

function App() {
	return (
		<div className='App'>
			<div className='gradient__bg'>
				<Web3ReactProvider getLibrary={getLibrary}>
				<BrowserRouter>
					<Navbar />
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/vote' element={<Vote />} />
					</Routes>
					<Footer />
				</BrowserRouter>
				</Web3ReactProvider>
			</div>
		</div>
	);
}

export default App;
