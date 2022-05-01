import React, {useState, useEffect}from 'react';
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    Button, 
    Input,
    Stack,
    useToast
  } from '@chakra-ui/react'
  import { ethers } from 'ethers';
  import Web3Modal from 'web3modal';
  import electionfactoryabi from '../abi/ElectionFactory.json'
  import { Disclosure } from '@headlessui/react'
  import { ChevronUpIcon } from '@heroicons/react/solid'
  import AdminFunction from '../AdminFunction';


const Admin = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [position, setPosition] = useState()
    //const [contestant, setContestant] = useState([])
    const [ContestantOne, setContestantOne] = useState()
    const [ContestantTwo, setContestantTwo] = useState()
    const [positions, setPositions] = useState([])
	  const [status, setStatus] = useState()
	  const [address, setAddress] = useState()
    const btnRef = React.useRef()
    const toast = useToast()
   

    const handlePosition = (e) => {
        setPosition(e.target.value)
    }

    const handleContestantOne = (e) => {
        setContestantOne(e.target.value)
    }
    
    const handleContestantTwo = (e) => {
        setContestantTwo(e.target.value)
    }

    async function createElection (){
      const contestant = []
		  const web3Modal = new Web3Modal()
		  const connection = await web3Modal.connect()
		  const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
		  const electionfactory = new ethers.Contract("0x618Fe346C9373689E423055DC8c225349D98b20b", electionfactoryabi, signer);
      contestant.push(ContestantOne)
      contestant.push(ContestantTwo)
       try {
          await electionfactory.createElection(position, contestant);
          toast({
            title:'Election Created',
            position: 'top',
            isClosable: true,
            status: 'success'
          })
        } catch (error) {
          console.error(error)
       }
	}

    async function loader (){
		const web3Modal = new Web3Modal()
		const connection = await web3Modal.connect()
		const provider = new ethers.providers.Web3Provider(connection)
		const electionfactory = new ethers.Contract("0x618Fe346C9373689E423055DC8c225349D98b20b", electionfactoryabi, provider);
		const answer = await electionfactory.getElections(1,10)
		console.log(answer)
		setPositions(answer.position)
		setStatus(answer.status)
		setAddress(answer.electionAddress)
	}

    useEffect(() => {
        loader()
      }, [])

  return (
    <>
      <Button ref={btnRef} colorScheme='teal' onClick={onOpen}>
        Create Election
      </Button>
      <Drawer
        isOpen={isOpen}
        placement='right'
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create Election</DrawerHeader>

          <DrawerBody>
            <Stack>
                <Input placeholder='Position' onChange={handlePosition} />
                <Input placeholder='Contestant1' onChange={handleContestantOne} />
                <Input placeholder='Contestant2' onChange={handleContestantTwo} />
            </Stack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={createElection} colorScheme='blue'>Create</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
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
            <AdminFunction address={address[i]} />
				  </Disclosure.Panel>
				</>
			  )}
			</Disclosure>
		  </div>
		</div> 
		))}
    </>
  )
}

export default Admin