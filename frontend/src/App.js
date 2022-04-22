import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import Vote from './components/pages/Vote';
import Footer from './components/Footer';

function App() {
	return (
		<div className='App'>
			<div className='gradient__bg'>
				<BrowserRouter>
					<Navbar />
					<Routes>
						<Route path='/' element={<Home />} />
						<Route path='/vote' element={<Vote />} />
					</Routes>
					<Footer />
				</BrowserRouter>
			</div>
		</div>
	);
}

export default App;
