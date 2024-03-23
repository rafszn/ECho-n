import OpenAi from 'openai'
import dotenv from 'dotenv'
import axios from 'axios'
dotenv.config()


export async function Translator (req, res){
  const {transcript, language} = req.body

  const openai = new OpenAi({ apiKey:process.env.OPENAI_KEY})

  try {
    const response = await openai.chat.completions.create({
      model:'gpt-3.5-turbo',
      messages:[
        {
          'role':"system",
          'content':`
          You will be provided with a sentence. Your tasks are to:
          - Detect the language of the sentence
          - translate it into ${language}
          Do not tell me what the language is, just return the translated text.
          `
        },
        {
          'role':'user',
          'content': transcript
        }
      ],
      temperature: 0.7,
      top_p:1
    })

    return res.status(200).json({
      text: response.choices[0].message.content
    })

  } catch (error) {
    console.log(error)
    return res.status(400).json(error.message)
  }

}



export async function Transcribe (req, res){

  const audio = req.file.path

   const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', {
      audio,
      model: 'whisper-1',
      response_format: 'json'
    },{
      headers: {
        'Content-Type':'multipart/form-data',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
      }
    }
  ) 

  return res.status(200).json({text:response.data.text})

}
