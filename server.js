const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ROTA PRA GERAR PIX
app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor } = req.body;

    if (!valor) {
      return res.status(400).json({ erro: "Valor não informado" });
    }

    const response = await fetch('https://pix.direct/v1/deposits', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.PIX_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        amount_cents: Math.round(valor * 100)
      })
    });

    const data = await response.json();
    console.log("Resposta PIX:", data);
    
    // A PIX.DIRECT JÁ MANDA COM data:image/png;base64,
    // Então só repassa direto
    res.json({ 
      qr_code_image: data.qr_code_base64,  
      copiaecola: data.pix_code          
    });

  } catch (error) {
    console.log("Erro PIX:", error);
    res.status(500).json({ erro: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});
