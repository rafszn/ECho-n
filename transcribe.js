import fs from 'fs'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

async function Transcribe (file){
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

  return response.data.text


}

async function main (){
  const file = fs.createReadStream('Audio.wav')
  const transcript = await Transcribe(file)

  console.log(transcript)
  console.log(file)

}

main()