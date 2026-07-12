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
  console.log("1. DADOS RECEBIDOS:", {valor, descricao, nome, cpf});

  try {
    const body = {
      amount: Number(valor),
      paymentMethod: "pix",
      description: `${descricao} - ${nome}`,
      customer: { name: nome, document: cpf },
      expiresIn: 300
    }
    console.log("2. ENVIANDO PARA PAGCIP:", body);

    const response = await fetch('https://api.pagcip.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("3. RESPOSTA COMPLETA PAGCIP:", JSON.stringify(data));

    if(!response.ok){
      return res.status(400).json({ error: `PAGCIP: ${data.message || JSON.stringify(data)}` });
    }
    
    res.json({ 
      copiaecola: data.data.pix.qrCode, 
      qrCodeBase64: data.data.pix.qrCodeBase64 
    });

  } catch (error) {
    console.log("4. ERRO CATCH:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
