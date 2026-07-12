const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const API_TOKEN = "pxd_04a8c5ea77334289a1d8bd3a18c5734b";

app.post('/gerar-pix', async (req, res) => {
  const { valor, descricao, nome, cpf } = req.body;

  try {
    const response = await fetch('https://api.pagcipagamentos.com.br/v1/pix/qrcode', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Number(valor),
        description: `${descricao} - ${nome}`,
        expiresIn: 300
      })
    });

    const data = await response.json();
    
    res.json({ 
      copiaecola: data.qrCode,
      qrCodeBase64: data.qrCodeBase64
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao gerar PIX" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
