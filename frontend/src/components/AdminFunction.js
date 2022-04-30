import electionabi from '../components/abi/Election.json'
import {Button, Input, Stack, HStack, VStack} from '@chakra-ui/react'
import {Upload} from 'antd'
import { useState } from 'react'
import {ethers} from 'ethers'
import Web3Modal from 'web3modal';
import * as XLSX from "xlsx"

const AdminFunction = (address) => {

    const [addresses, setAddresses] = useState([]);
    const [customersCsvFile, setCustomersCsvFile] = useState([]);
    const [Student, setStudent] = useState([])
    const handleStudent = (e) => {
        setStudent(e.target.value)
    }
    const enableVoting = async ({address} ) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const election = new ethers.Contract(address,electionabi.abi, signer)
        
        try {
            await election.enableVoting( {
                gasLimit:300000
            })
        } catch (error) {
           console.error(error, "why") 
        }
    }

    const disableVoting = async ({address} ) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const election = new ethers.Contract(address,electionabi.abi, signer)
        
        try {
            await election.disableVoting( {
                gasLimit:300000
            })
        } catch (error) {
           console.error(error, "why") 
        }
    }

    const compileResult = async ({address} ) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const election = new ethers.Contract(address,electionabi.abi, signer)
        
        try {
            await election.compileResult( {
                gasLimit:300000
            })
        } catch (error) {
           console.error(error, "why") 
        }
    }

    const registerStudent = async ({address} ) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const election = new ethers.Contract(address,electionabi.abi, signer)
        console.log(Student)
        try {
            await election.registerStudent(addresses, {
                gasLimit:300000
            })
        } catch (error) {
           console.error(error, "why") 
        }
    }

    const showResult = async ({address} ) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const election = new ethers.Contract(address,electionabi.abi, signer)
        
        try {
            await election.showResult( {
                gasLimit:300000
            })
        } catch (error) {
           console.error(error, "why") 
        }
    }

    const privateViewResult = async ({address} ) => {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const election = new ethers.Contract(address,electionabi.abi, signer)
        
        try {
            await election.privateViewResult( {
                gasLimit:300000
            })
        } catch (error) {
           console.error(error, "why") 
        }
    }

    


    const processData = dataString => {
        const dataStringLines = dataString.split(/\r\n|\n/);
        const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
    
        // const list = [];
        const csvAddresses = [];
        const csvAmounts = [];
        let csvTotals = 0;
        for (let i = 1; i < dataStringLines.length; i++) {
          const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
          if (headers && row.length == headers.length) {
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
              let d = row[j];
              if (d.length > 0) {
                if (d[0] == '"') d = d.substring(1, d.length - 1);
                if (d[d.length - 1] == '"') d = d.substring(d.length - 2, 1);
              }
              if (headers[j]) {
                obj[headers[j]] = d;
              }
            }
    
            // remove the blank rows
            if (Object.values(obj).filter(x => x).length > 0) {
              // list.push(obj);
              csvAddresses.push(obj["address"]);
    
            }
          }
        }
        if (csvAddresses.length > 200) {
          //message.info("You have more than 200. It should be atmost 200 per batch");
          setCustomersCsvFile([]);
          return;
        }
    
        setAddresses(csvAddresses);
    };

    const handleChange = ({ fileList }) => {
        setCustomersCsvFile(fileList);
    
        // Parse through CSV files
        if (fileList.length === 0) {
          setAddresses([]);
    
          return;
        }

        const file = fileList[0].originFileObj;
    const reader = new FileReader();
    reader.onload = evt => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
    }



    return(
        <div>
            <HStack>
                <Button onClick={() => {
                    enableVoting(address)
                }}>enableVoting</Button>
                <Button onClick={() => {
                    disableVoting(address)
                }}>disableVoting</Button>
                <Button onClick={() => {
                    compileResult(address)
                }}>compileResult</Button>
                 <Button onClick={() => {
                    showResult(address)
                }}>showResult</Button>
                <Button onClick={() => {
                    privateViewResult(address)
                }}>showResult</Button>
                {/* <VStack>
                    <Input onChange={handleStudent} placeholder='setupStudent'  />
                    <Button onClick={() => {
                        registerStudent(address)
                    }}>setupStudent</Button>
                </VStack> */}
                <VStack>
                <Upload
                    accept=".csv,.xlsx,.xls"
                    action="#"
                    listType="picture-card"
                    fileList={customersCsvFile}
                    onChange={handleChange}
                    beforeUpload={() => false}
                    maxCount={1}
                  >
                    {customersCsvFile.length === 0 && (
                      <div>
                        <div style={{ marginTop: 8 }}>Upload Student</div>
                      </div>
                    )}
                  </Upload>
                  <Button onClick={() => {
                      registerStudent(address)
                  }}>register</Button>
                  </VStack>
            </HStack>
        </div>
    )
}

export default AdminFunction