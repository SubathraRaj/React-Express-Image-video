
import React, {useState} from 'react'
import axios from 'axios'

export default function FileUpload() {
    const [file, setFile] = useState()
    const [fileName, SetFileName]=useState("")
    
    const saveFile = (event) =>{
        setFile(event.target.files[0])
        SetFileName(event.target.files[0].name)
    }

    const uploadFile= async (event)=> {
        const formData=new FormData();
        formData.append("image", file)
        formData.append("fileName", fileName)
        try{
            const res= await axios.post(`http://localhost:5001/upload`, formData)
            console.log(res)
        }
        catch (ex){
            console.log(ex)
        }
       
    }
  return (
    <div className='App'>
        <input type="file" onChange={saveFile}/>
        <button onClick={uploadFile}>Upload</button>
    </div>
  )
}


