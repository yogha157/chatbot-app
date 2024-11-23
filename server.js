const express = require('express');
const axios = require('axios');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Konfigurasi API OpenAI
const openaiApiKey = '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'; // Ganti dengan API key Anda

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Menyimpan chat history ke file JSON
const saveChatHistory = (chatHistory) => {
  fs.writeFileSync('chatHistory.json', JSON.stringify(chatHistory, null, 2));
};

// Fungsi untuk mengirim request ke ChatGPT
const getChatGPTResponse = async (message) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // Pilih model yang Anda inginkan
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching ChatGPT response:', error);
    return 'Terjadi kesalahan saat berkomunikasi dengan server.';
  }
};

// API untuk mengirim chat
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const chatHistory = JSON.parse(fs.readFileSync('chatHistory.json', 'utf-8')) || [];

  // Tambahkan pesan user ke chat history
  chatHistory.push({ role: 'user', content: message });

  const botResponse = await getChatGPTResponse(message);

  // Tambahkan respons bot ke chat history
  chatHistory.push({ role: 'assistant', content: botResponse });

  // Simpan chat history
  saveChatHistory(chatHistory);

  // Kirim balasan ke klien
  res.json({ response: botResponse });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
