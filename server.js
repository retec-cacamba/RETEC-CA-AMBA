const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Config
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ROTA PARA GERAR PIX
app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor } = req.body;

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: "Digite um valor válido" });
    }

    const response = await fetch('https://pix.direct/v1/deposits', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.PIX_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        amount_cents: Math.round(valor * 100) // R$ 50.00 = 5000
      })
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || "Erro ao gerar PIX");
    }

    const data = await response.json();
    console.log("RESPOSTA PIX.DIRECT:", data);
    
    // IMPORTANTE: pix.direct já retorna com data:image/png;base64,
    res.json({ 
      qr_code_image: data.qr_code_base64,  
      copiaecola: data.pix_code,
      id: data.id
    });

  } catch (error) {
    console.error("ERRO:", error);
    res.status(500).json({ erro: error.message });
  }
});

// SERVE O INDEX.HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// INICIAR
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
