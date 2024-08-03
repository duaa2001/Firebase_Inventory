'use client';
import Image from "next/image";
import {useState,useEffect} from 'react'
import {firestore} from '@/firebase'
import {Box, Modal,Typography, Stack, TextField, Button} from '@mui/material';
import { doc, collection, deleteDoc, getDocs, getDoc, setDoc, query } from 'firebase/firestore';


export default function Home() {

  const [inventory, setInventory]=useState([])
  const [openAdd, setOpenAdd] = useState(false); 
  const [openSearch, setOpenSearch] = useState(false);
  const [itemName, setItemName] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) {
      const {count} = docSnap.data()
      await setDoc(docRef, {count: count+1})
    }
    else {
      await setDoc(docRef, {count:1})
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()) {
      const {count} = docSnap.data()
      if (count==1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {count: count-1})
      }
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpenAdd = () => setOpenAdd(true)
  const handleCloseAdd = () => setOpenAdd(false)

  const handleOpenSearch = () => setOpenSearch(true)
  const handleCloseSearch = () => setOpenSearch(false)

  return (
    <Box 
     width = "100vw"
     height = "100vh" 
     display = "flex"
     flexDirection="column" 
     justifyContent="center"
     alignItems="center"
     bgcolor="#E8FAEA"
     gap={2}
     >
      <Modal open={openAdd} onClose ={handleCloseAdd}>
        <Box
        position = "absolute"
        top = "50%"
        left = "50%"
        sx = {{
          transform: "translate(-50%, -50%)"
        }}
        width ={400}
        bgcolor="white"
        border="2px solid #000"
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack direction = "row" spacing = {2}></Stack>
            <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
            }}/>
            <Button variant="outlined" onClick={()=> {
              addItem(itemName)
              setItemName('')
              handleCloseAdd();
            }}>ADD</Button>
        </Box>
      </Modal>
      <Button variant = "contained" onClick={()=> {
        handleOpenAdd()
      }}
      >Add New Item</Button>
      <Box border="6px solid darkgreen">
        <Box width="800px" height="100px"
        bgcolor="#f3e6e6" display= "flex" alignItems="center" justifyContent="center">
        <Typography variant="h2" color="darkred">
          Inventory Items
          </Typography>
        </Box>
      <Stack width="800px" height="300px" spacing={2} overflow="auto">
        {inventory
        .filter(({ name }) => {
          return !searchTerm || name.toLowerCase().includes(searchTerm.toLowerCase());
        })
        .map(({name,count})=>{
          return (
           <Box 
            key={name}
            width="100%"
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgcolor="black"
            padding={5}
            >
             <Typography variant = "h3" color = "white" textAlign="center">
              {name}
              </Typography>
              <Typography variant = "h3" color = "white" textAlign="center">
              {count}
              </Typography>
              <Stack direction="row" spacing={2}>
              <Button 
                variant = "contained" 
                onClick={()=> {
                addItem(name)
                }}
              >
                Add
                </Button>
              <Button 
                variant = "contained" 
                onClick={()=> {
                removeItem(name)
                }}
              >
                Remove
                </Button>
                </Stack>
            </Box>
          );})}
      </Stack>
      </Box>
      <Modal open={openSearch} onClose ={handleCloseSearch}>
        <Box
        position = "absolute"
        top = "50%"
        left = "50%"
        sx = {{
          transform: "translate(-50%, -50%)"
        }}
        width ={400}
        bgcolor="white"
        border="2px solid #000"
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        >
          <Typography variant="h6">What item are you looking for?</Typography>
          <Stack direction = "row" spacing = {2}></Stack>
            <TextField
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
            }}/>
            <Button variant="outlined" 
            onClick={() => {
              setSearchTerm(itemName); 
              setItemName(''); 
              handleCloseSearch(); 
            }}
            >Search</Button>
        </Box>
      </Modal>
      <Button variant = "contained" onClick={()=> {
        handleOpenSearch()
      }}>Search Item</Button>
    </Box>
  );
}
