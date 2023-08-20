import React from 'react';
import { useState,useEffect } from 'react';
import { Snackbar , Alert,Box, Typography} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import {CardActionArea,Input,Link, Modal, OutlinedInput, TextField }from '@mui/material';
import Button from '@mui/material/Button';
const url='http://localhost:8000/';

const Landing = () => {

    const[showErrorMsg,setShowErrMsg]=useState('');
    const[errorMsg,setErrorMsg]=useState('');
    const[file,setFile]=useState('');
    const[data,setData]=useState([]);
    const[page,setPage]=useState(1);
    const[filter,setFilter]=useState({
        name:'',
        age:'',
        email:'',
        schoolName:'',
        standard:''
    });
    const[filteredData,setFilteredData]=useState([]);

    const columns =[
          {
            accessorKey: 'name', //access nested data with dot notation
            header: 'Name',
            size: 150,
          },
          {
            accessorKey: 'age',
            header: 'Age',
            size: 150,
          },
          {
            accessorKey: 'email', //normal accessorKey
            header: 'email',
            size: 200,
          },
          {
            accessorKey: 'schoolName',
            header: 'SchoolName',
            size: 150,
          },
          {
            accessorKey: 'mother_name',
            header: "Mother's Name",
            size: 150,
          },
          {
            accessorKey: 'father_name',
            header: "Father's Name",
            size: 150,
          },
          {
            accessorKey: 'class_std',
            header: "Standard",
            size: 150,
          },
        ]
        
    const [downloadLink, setDownloadLink] = useState(null);

    useEffect(() => {
        (async()=>{
            await getCSVFile()

        })()
    }, []);

    const getCSVFile=async()=>{
        try{
            const res=await fetch(url+'downloadCSV/');
            const blob= await res.blob()
            const csvURL= URL.createObjectURL(blob)
            setDownloadLink(csvURL);
       
        }
        catch(err){
            console.log("err is",err);
        }
    }

    useEffect(()=>{
        (async()=>{

            await getData()
        })()

    },[])

    useEffect(()=>{
        (async()=>{
            if(filteredData.length>0){
                getFilteredData()
            }
            else{

            await getData()
            }
        })()

    },[page])

    const getFilteredData=async()=>{
        try{

            const res=await fetch(url+`getData/?page=${page}&age=${filter.age}&email=${filter.email}&schoolName=${filter.schoolName}&standard=${filter.standard}&name=${filter.name}`,{
                method:'GET',
                headers:{
                    'Content-Type':'application/json'
                }
            })
            const resp=await res.json();
            if(resp.Error=='NA'){
                
                if(filteredData.length>0){
                    setFilteredData(prevData => prevData.concat(resp.data));    
                    setShowErrMsg(true);
                    setErrorMsg(`Showing ${data.length + resp.data.length} records.`)            
                }
                else{
                    setFilteredData(resp.data);
                }
            }
            if(resp.Error=='no data found'){
                setShowErrMsg(true);
                setErrorMsg(`No more records found`)  
            }
            else{
                setShowErrMsg(true);
                setErrorMsg('Some Error ocurred');

            }
        
             

        }
        catch(err){
            console.log("err",err);

        }
    }

    const getData=async(preset)=>{
        try{
            const res=await fetch(url+`getData/?page=${page}`,{
                method:'GET',
                headers:{
                    'Content-Type':'application/json'
                }
            })
            const resp=await res.json();
            if(resp.Error=='NA'){
                if(preset=='upload'){
                    setData(resp.data);
                }
 
                else if(data.length>0){
                    setData(prevData => prevData.concat(resp.data));    
                    setShowErrMsg(true);
                    setErrorMsg(`Showing ${data.length + resp.data.length} records.`)            
                }
                else{
                setData(resp.data);
                }
            }
            if(resp.Error=='no data found'){
                setShowErrMsg(true);
                setErrorMsg(`No more records found`)  
            }
            else{
                setShowErrMsg(true);
                setErrorMsg('Some Error ocurred');

            }
        
        }
        catch(err){
            console.log("err is",err);
        }
    }

    const onChange=(e)=>{
        setFile(e.target.files[0]);
    }

    const handleUpload=async()=>{
        try{
        const formData = new FormData();
        formData.append('file', file);
        const res=await fetch(url+'uploadData/',{
            method:'POST',
            body:formData

        })

        const response=await res.json();
        if(response.Error=='NA'){
           
            if(response.failedCases!=[]){
                setShowErrMsg(true);
                setErrorMsg(`Error in following rows : ${response.failedCases}\n\n And success Cases are ${response.successCases}`);

            }
            else if(response.successCases==0){
                setShowErrMsg(true);
                setErrorMsg('File Data Incorrect!!');
            }
            if(response.successCases>0){
                await getData('upload')
            }


        }
        else{
            setShowErrMsg(true);
            setErrorMsg('Some Error ocuurred!');

        }
    }
    catch(err){
        console.log("err is",err);
    }


    }

    const handleClose=()=>{
        setShowErrMsg(false);
        setErrorMsg('');
      }

   
  return (
    <div>

        <Snackbar style={{vertical: 'top',
                horizontal: 'center',}} open={showErrorMsg} autoHideDuration={6000} onClose={()=>{handleClose()}}>
        <Alert onClose={()=>{handleClose()}} severity="success" sx={{ width: '100%' }}>
        {errorMsg}
        </Alert>
        </Snackbar>
       {downloadLink && (
        <Link href={downloadLink} download="data.csv">
          Download CSV
        </Link>
       )}

        <Input type="file" accept=".csv" onChange={(e)=>{onChange(e)}}/>
        <Button onClick={()=>{handleUpload()}}>Upload</Button>

         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div>
            Filters
            <Typography>

            <TextField placeholder="email" name="email" value={filter.email} type="text" onChange={(e)=>{setFilter((prev)=>({...prev,[e.target.name]:e.target.value}))}}  />
            <TextField placeholder="name" name="name" value={filter.name}  type="text"  onChange={(e)=>{setFilter((prev)=>({...prev,[e.target.name]:e.target.value}))}} />
            <TextField placeholder="age" name="age" value={filter.age}  type="number"   onChange={(e)=>{setFilter((prev)=>({...prev,[e.target.name]:e.target.value}))}}  />
            <TextField placeholder="standard" name="standard" value={filter.standard}  type="number"  onChange={(e)=>{setFilter((prev)=>({...prev,[e.target.name]:e.target.value}))}}  />
            <TextField placeholder="school name"  name="schoolName" value={filter.schoolName}  type="text"  onChange={(e)=>{setFilter((prev)=>({...prev,[e.target.name]:e.target.value}))}} />
            <Button onClick={()=>{getFilteredData()}}>Filter</Button>
            <Button onClick={()=>{setFilter((prev)=>({...prev,
             name:'',
             age:'',
             email:'',
             schoolName:'',
             standard:''
            }));setFilteredData([])}}>Clear</Button>

            </Typography>

        </div>
  

        {data && data.length>0 && filteredData.length==0?(
            <>
                <MaterialReactTable  columns={columns} data={data} />
            </>
        ):(
            <>
            <MaterialReactTable  columns={columns} data={filteredData} />
        </>
            
        )}

        <Button style={{position:'fixed',zIndex:1,bottom:0,right:0}}onClick={()=>{ setPage(prev=>prev+1)}}>Fetch More Records</Button>




</div> 

        
     

    </div>
  )
}

export default Landing

