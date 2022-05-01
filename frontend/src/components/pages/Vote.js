import React, {useEffect, useState} from 'react';
import '../styles/Vote.css';
import { Disclosure,Tab } from '@headlessui/react'
import { ChevronUpIcon } from '@heroicons/react/solid'
import electionfactoryabi from '../abi/ElectionFactory.json'
import {ethers} from 'ethers'
import electionabi from '../abi/Election.json'
import Web3Modal from 'web3modal';
import Input from '../input';
import { Button, Center } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { connectors } from '../connector';


const Vote = () => {
	
	const [positions, setPosition] = useState([])
	const [status, setStatus] = useState()
	const [address, setAddress] = useState()
	const [contestant, setContestant] = useState([])
	const [ElectionResult, setElectionResult] = useState()
	const {active, activate} = useWeb3React()

	async function loader (){
		const web3Modal = new Web3Modal()
		const connection = await web3Modal.connect()
		const provider = new ethers.providers.Web3Provider(connection)
		const electionfactory = new ethers.Contract("0x618Fe346C9373689E423055DC8c225349D98b20b", electionfactoryabi, provider);
		const answer = await electionfactory.getElections(1,10)
		console.log(answer)
		setPosition(answer.position)
		setStatus(answer.status)
		setAddress(answer.electionAddress)
	}

	const result = async (address) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const election = new ethers.Contract(address,electionabi.abi, signer)
        
        try {
           const electionResult =  await election.result( {
                gasLimit:300000
            })
			setElectionResult(electionResult.toString())
        } catch (error) {
           console.error(error, "why") 
        }
    }

	

	useEffect(() => {
	  loader()
	}, [])
	


	return (
		<Center>
		{active ?
		<div>
		{positions.map((position,i) => (
		<div className="w-full px-4 pt-8">
		  <div className="w-full max-w-4xl p-2 mx-auto bg-white rounded-2xl">
			<Disclosure key={position[i]} >
			  {({ open }) => (
				<>
				  <Disclosure.Button  className="flex justify-between w-full px-4 py-2 text-lg font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
					<div>
						<h1>POSITION</h1>
						<span>{position}</span>
					</div>
					<div>
						<h1>STATUS</h1>
						<span >{status[i]}</span>
					</div>
					<ChevronUpIcon
					  className={`${
						open ? 'transform rotate-180' : ''
					  } w-5 h-5 text-purple-500`}
					/>
				  </Disclosure.Button>
				  <Disclosure.Panel className="px-4 pt-4 pb-2 text-md text-gray-500">
				  {status[i] == 'Results ready' ? 
					<Button onClick={() => {
						result(address[i])
					}}>Show Results</Button> : 
					<div></div> }
					<div className='mt-4'>{ElectionResult}</div>
					<Input 
					address={address[i]}/>
					
				  </Disclosure.Panel>
				</>
			  )}
			</Disclosure>
		  </div>
		</div> 
		))}
		</div>: <Button className='text-center' onClick={() => {
			activate(connectors.injected)
		}}>Connect Wallet</Button>}
		</Center>
		
	)
}

export default Vote;
 
