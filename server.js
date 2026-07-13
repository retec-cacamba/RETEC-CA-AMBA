const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
const TAXA_PIX = 0.30; // taxa da pix.direct

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// BANCO TEMPORÁRIO PRA SALVAR STATUS
let pagamentos = {};

app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor) return res.status(400).json({ error: "Valor não informado" });

    const valorComTaxa = Math.max(0.01, valor - TAXA_PIX);
    const id = 'pix_' + Date.now();

    const response = await fetch('https://pix.direct/v1/deposits', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.PIX_TOKEN, // MUDEI PRA PIX_TOKEN
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        amount_cents: Math.round(valorComTaxa * 100),
        id: id // manda o id pra voltar no webhook
      })
    });

    const data = await response.json();

    // Salva pra consultar depois
    pagamentos[id] = { status: 'PENDING' };

    res.json({
      qrCodeBase64: data.qr_code_base64.split(',')[1],
      copiaecola: data.pix_code,
      id: id
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// MUDEI A ROTA PRA /webhook
app.post('/webhook', express.json(), async (req, res) => {
  try {
    const { id, status, amount_cents } = req.body;
    console.log("WEBHOOK RECEBIDO:", req.body);

    if((status === 'PAID' || status === 'paid') && pagamentos[id]){
      pagamentos[id].status = 'PAID'; // MARCA COMO PAGO
      console.log(`PIX PAGO! ID: ${id}`);
    }

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

// ROTA PRA CONSULTAR SE PAGOU
app.get('/status-pix/:id', (req, res) => {
  const id = req.params.id;
  res.json({ status: pagamentos[id]?.status || 'NOT_FOUND' });
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
