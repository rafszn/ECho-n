import dotenv from "dotenv";
import axios from "axios";
import { HfInference } from "@huggingface/inference";
dotenv.config();

const hf = new HfInference(process.env.HUGGING);

function cleanText(str) {
  const newlineIndex = str.indexOf("\n");
  const parenthesisIndex = str.indexOf("(");
  const endIndex =
    newlineIndex !== -1 && parenthesisIndex !== -1
      ? Math.min(newlineIndex, parenthesisIndex)
      : Math.max(newlineIndex, parenthesisIndex);

  if (endIndex !== -1) {
    return str.substring(0, endIndex).trim();
  }
  return str.trim();
}

export async function Translator(req, res) {
  const { transcript, language } = req.body;

  try {
    const responseTwo = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        {
          role: "system",
          content: `
          You will be provided with a sentence. Your tasks are to:
          
          - translate it into ${language}.
          - Do not tell me what the language is.
          - Do not add any (Note) to the response, no context, no nothing.
          - Do not say what the sentence is about.
          - strictly return the translated sentence as a response.
          `,
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      temperature: 0.1,
      seed: 0,
    });

    const cleaned = cleanText(responseTwo.choices[0].message.content);

    return res.status(200).json({
      text: cleaned,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error.message);
  }
}

export async function Transcribe(req, res) {
  const audio = req.file.path;

  const response = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      audio,
      model: "whisper-1",
      response_format: "json",
    },
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
    },
  );

  return res.status(200).json({ text: response.data.text });
}
