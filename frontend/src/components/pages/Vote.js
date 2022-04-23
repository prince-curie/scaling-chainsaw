import React, {useEffect, useState} from 'react';
import '../styles/Vote.css';
import { Disclosure } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/solid'
import electionfactoryabi from '../abi/ElectionFactory.json'
import {ethers} from 'ethers'



const Vote = () => {
	const positions = [["Headboy", "HeadGirl"], ["hh", "hhhjhj"]]
	const [elections, setElections] = useState([])
	const [ans, setAns] = useState()

	async function loader (){
		const result = []
		const provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/fc14a52483224deebaafcbcc2b1059f1")
		const electionfactory = new ethers.Contract("0xF53160aeAB070dFc76422d922361598c891c0095", electionfactoryabi, provider);
		const answer = await electionfactory.getElections(1,10)
		setAns(answer)
		result.push(answer)
		setElections(result)
	
	}
	//console.log(positions)

	useEffect(() => {
	  loader()
	}, [])
	


	return (
		<div>
		{Object.entries(elections).map((elections, i) => (
		<div className="w-full px-4 pt-8">
		  <div className="w-full max-w-4xl p-2 mx-auto bg-white rounded-2xl">
			<Disclosure>
			  {({ open }) => (
				<>
				  <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
					<div>
						<h1>POSITION</h1>
						<span>{ans.position}</span>
					</div>
					<div>
						<h1>STATUS</h1>
						<span>{ans.status}</span>
					</div>
					<ChevronUpIcon
					  className={`${
						open ? 'transform rotate-180' : ''
					  } w-5 h-5 text-purple-500`}
					/>
				  </Disclosure.Button>
				  <Disclosure.Panel className="px-4 pt-4 pb-2 text-md text-gray-500">
					If you're unhappy with your purchase for any reason, email us
					within 90 days and we'll refund you in full, no questions asked.
				  </Disclosure.Panel>
				</>
			  )}
			</Disclosure>
		  </div>
		</div> 
		))}
		</div>
		
	)
}

export default Vote;
 
