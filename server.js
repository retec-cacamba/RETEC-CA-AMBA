const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const TAXA_PIX = 0.30; // taxa da pix.direct

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor) return res.status(400).json({ error: "Valor não informado" });

    // Subtrai a taxa pra render 100%
    const valorComTaxa = Math.max(0.01, valor - TAXA_PIX);

    const response = await fetch('https://pix.direct/v1/deposits', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.PIX_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount_cents: Math.round(valorComTaxa * 100) })
    });

    const data = await response.json();

    res.json({
      qrCodeBase64: data.qr_code_base64.split(',')[1],
      copiaecola: data.pix_code,
      id: data.id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WEBHOOK - PRA SABER QUANDO PAGOU
app.post('/webhook-pix', express.json(), async (req, res) => {
  try {
    const { id, status, amount_cents } = req.body;
    console.log("WEBHOOK RECEBIDO:", req.body);

    if(status === 'PAID' || status === 'paid'){
      const valorPago = amount_cents / 100;
      console.log(`PIX PAGO! ID: ${id} - Valor: R$ ${valorPago}`);
    }

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
