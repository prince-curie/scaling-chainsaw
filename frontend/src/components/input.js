import { Fragment, useState, useEffect } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import {ethers} from 'ethers'
import electionabi from '../components/abi/Election.json'
import Web3Modal from 'web3modal';
import {useWeb3React} from '@web3-react/core'
import {Button} from '@chakra-ui/react'

export default function Input(address) {
    const [people, setPeople] = useState([])
    const [voting, setVoting] = useState()

     
    const getContestant = async ({address}) => {
		const web3Modal = new Web3Modal()
    	const connection = await web3Modal.connect()
    	const provider = new ethers.providers.Web3Provider(connection)
		const election = new ethers.Contract(address, electionabi.abi, provider)
		let contestantsName = []

		try {
      const noOfParticate = await election.noOfpartcipate()
      for (let i = 0; i < noOfParticate.toString(); i++ ){
        const name = await election.contestantsName(i)
        contestantsName.push(name)
      }

		setPeople(contestantsName)
    console.log(people)

		} catch (error) {
		    console.error(error, "why")
		}
	}

    useEffect(() => {
        getContestant(address);
    }, [address])
    
  
  const [selected, setSelected] = useState(people)
//   const handleVoting = (e) => {
//     setSelected(e.target.value)
//  }
//  setVoting(selected)
  

  const vote = async ({address} ) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const election = new ethers.Contract(address,electionabi.abi, signer)
    console.log(selected)
    try {
        await election.vote(selected, {
            gasLimit:300000
        })
    } catch (error) {
       console.error(error, "why") 
    }
}

  return (
    <div className=''>
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <Listbox.Button className="focus:outline-none relative w-1/2 cursor-default rounded-lg bg-black py-2 pl-3 pr-10 text-left shadow-md focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selected}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <SelectorIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          {/* <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          > */}
            <Listbox.Options className="focus:outline-none absolute mt-1 max-h-60 w-1/2 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
              {people.map((person, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                    }`
                  }
                  value={person}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {person}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          {/* </Transition> */}
          <Button className='ml-4' onClick={() => {
          vote(address, selected)
      }}>Vote</Button>
        </div>
        
      </Listbox>
     
    </div>
  )
}
