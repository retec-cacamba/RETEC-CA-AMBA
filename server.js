const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // se você tem pasta public

// ROTA PRA GERAR PIX PELA PIX.DIRECT
app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor } = req.body; // valor vem do front tipo: 250.00

    if (!valor) {
      return res.status(400).json({ erro: "Valor não informado" });
    }

    const response = await fetch(process.env.PIX_API_URL + '/v1/deposits', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.PIX_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        amount_cents: Math.round(valor * 100), // converte R$ para centavos
        description: "Reserva Caçamba RETEC"
      })
    });

    if (!response.ok) {
      throw new Error("Erro ao gerar PIX na API");
    }

    const data = await response.json();
    
    res.json({ 
      qr_code: data.qr_code_base64, // imagem do QR
      copia_cola: data.pix_code     // código copia e cola
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
