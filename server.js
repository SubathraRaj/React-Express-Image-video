const express = require('express')
const multer = require('multer')
const app=express()
const mysql=require('mysql')
const path=require('path')
const bodyParser= require('body-parser')
const cors=require('cors')
const fs= require('fs')
const ffmpeg= require('fluent-ffmpeg')
const ffmpegPath=require('@ffmpeg-installer/ffmpeg').path
//const ffprobepath=require('ffprobe-static').path
ffmpeg.setFfmpegPath(ffmpegPath)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// use Express static 

app.use(express.static("public"))
app.use('thumbnails', express.static("public/thumbnails"))
app.use('videos', express.static('public/videos'))

//Database connection

const connection= mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'test'

})
connection.connect(function(err){
    if(err) {
        return console.error('error:' +err.message)
    }
    console.log('connected to the MySQL server')
})

// Use Multer

var storage= multer.diskStorage({
    destination :(req, file, callBack) => {
        const directory='./public/images'
        fs.mkdirSync(directory, {recursive:true})
        callBack(null, directory)
    },
    filename :(req, file, callBack)=>{
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
var upload= multer({
    storage: storage
})
//Route for post data
app.post('/upload', upload.single('image'), (req, res)=>{
    if(!req.file) {
        return res.status(400).json({success:false, message:'No file uploaded'})
    }
        const imgsrc='http://localhost:5001/images/' + req.file.filename
        const insertData="INSERT INTO users_file(file_path) VALUES(?)"
        connection.query(insertData, [imgsrc], (err, result)=>{
            if(err) {
                console.error('Error uploading file:',err)
                return res.status(500).json({sucess:false, message:'An error occurred' })
            }
            console.log('File uploaded successfully')
            return res.status(200).json({success:true, message:'File uploaded successfully'})
        })
    
})
// Configure Multer for video upload

const videostorage= multer.diskStorage({
    destination:(req, file, callback)=> {
        const directory='./public/videos'
        fs.mkdir(directory, {recursive:true}, (err)=>{
            if (err) {
                console.error('Error Creating directory:', err)
            }
            callback(null, directory)
        })
    },
    filename: (req, file, callback) =>{
        callback(null, Date.now() + path.extname(file.originalname))
    },
})
const videoupload= multer({
    storage: videostorage,})

// Define the API endpoint for file upload

app.post('/videoupload', videoupload.single('video'), (req, res)=>{
    console.log("welcome videoupload")
    if(!req.file){
        return res.status(400).json({success:false, message:'No file uploaded'})
    }
    else {
    const videoPath=req.file.path
    const thumbnailpath='thumbnails/' + req.file.filename + '.png'
    //Generate thumbnail using  ffmpeg
console.log("Check : " +thumbnailpath,":"+videoPath)
    ffmpeg(videoPath)
        //.seekInput('50')
        .screenshots({
            timestamps:['00:00:02'],
            filename:req.file.filename + '.png',
            folder : 'public/thumbnails/',
            size:'320x240',
        })
        .on('end', () =>{
           const videoUrl= req.file.filename
          // const thumbnailUrl='http://localhost:5001/thumbnails/' + req.file.filename+ '.png'
        
            const insertData ='INSERT INTO videos (video_path, thumbnail_path) VALUES (?, ?)'
            connection.query(insertData, [videoUrl, thumbnailpath], (err, result)=>{
                console.log(videoUrl, thumbnailpath)
                if (err) {
                    console.error("Error uploading video")
                    return res.status(500).json({success:false, message:'an error occurred'})
                }
                else
                {console.log('Video uploaded successfully')
                 res.json({thumbnailpath, videoUrl})
            }
            })
        })
        .on ('error', (err)=>{
            console.error('Error generating thumbnail', err)
            return res.status(500).json({success:false, message:'An Error occurred'})
        })
    }
})


// create connection
//Start the server
const port= 5001
app.listen(port, ()=>{
    console.log(`Server is Listening on ${port}`)
})