import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import multer from 'multer'
import axios from 'axios'
import fs from 'fs'
import { Translator} from './controllers.js'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.json())
app.use(cors())



app.get('/', (req, res)=>{

  res.send('server is running!')

})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   return cb(null, './public');
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/api/transcribe', upload.single('audioFile'), async (req, res)=>{

  const audio = req.file.path
  const file = fs.createReadStream(audio)

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', {
        file,
        model: 'whisper-1',
        response_format: 'json'
      },{
        headers: {
          'Content-Type':'multipart/form-data',
          'Authorization': `Bearer ${process.env.OPENAI_KEY}`
        }
      }
    ) 

    res.status(200).json(response.data.text)
    
  } catch (error) {
    res.status(400).json(error.message)
  }
}
)

app.post('/api/speech',Translator)




app.listen(PORT, console.log(`Server is running on PORT ${PORT}...`))
