const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ROTA PRA GERAR PIX PELA PIX.DIRECT
app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor } = req.body; // vem 100.00 do front

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
        amount_cents: Math.round(valor * 100) // R$100.00 vira 10000
      })
    });

    if (!response.ok) {
      const erro = await response.json();
      throw new Error(erro.error || "Erro ao gerar PIX");
    }

    const data = await response.json();
    console.log("Resposta PIX:", data); // pra ver no log do Railway
    
    // Nomes corrigidos pra bater com o front
    res.json({ 
      qr_code_image: data.qr_code_base64, // imagem do QR
      copiaecola: data.pix_code           // código copia e cola
    });

  } catch (error) {
    console.log("Erro PIX:", error);
    res.status(500).json({ erro: error.message });
  }
});

// ROTA TESTE
app.get('/', (req, res) => {
  res.send("Servidor RETEC rodando!");
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});
