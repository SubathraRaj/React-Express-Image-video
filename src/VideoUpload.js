import React, {useState} from "react";
import axios from "axios";

function VideoUpload () {
    const [video, setVideo]= useState(null)
    const [thumbnail, setThumbnail] =useState(null)
    const [videoFile, setVideofile] = useState(null)

    const handleVideoChange =(event)=>{
        const videosrc= URL.createObjectURL(event.target.files[0])
        setVideo(videosrc) 
        setVideofile(event.target.files[0])
    }


    const handleVideoUpload =() =>{
        const formData= new FormData()
        formData.append('video', videoFile)
    
    axios.post('http://localhost:5001/videoupload/', formData)
    .then((response)=>{
        console.log("welcome")
        //console.log(response.data)
        const {thumbnailpath, videoUrl}=response.data
        const imgurl='http://localhost:5001/' + thumbnailpath
        //const playvideo='http://localhost:5001/videos' + videoUrl
        setThumbnail(imgurl)
        //setVideo(playvideo)
        console.log(imgurl, video,videoUrl)
    })
    .catch((error)=>{
        console.error(error)
    })
    }


return(
    <div>
        <input type='file' accept="video.*" onChange={handleVideoChange} />
        <button onClick={handleVideoUpload}> Upload Video</button>
        {thumbnail && (
            <div>  
                <video controls poster={thumbnail.toString()}>
                    <source src={video} type="video/mp4"></source>
                </video>
            </div>
        )} 
    </div>
)
}

export default VideoUpload;
