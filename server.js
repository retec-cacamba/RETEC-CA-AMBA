const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor } = req.body;
    if (!valor) return res.status(400).json({ error: "Valor não informado" });

    const response = await fetch('https://pix.direct/v1/deposits', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.PIX_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount_cents: Math.round(valor * 100) })
    });

    const data = await response.json();
    console.log("PIX.DIRECT:", data);

    if(!response.ok){
      return res.status(400).json({ error: data.error || "Erro ao gerar PIX" });
    }

    // ADAPTA PRA FORMATO DO SEU INDEX ANTIGO
    res.json({
      qrCodeBase64: data.qr_code_base64.split(',')[1], // tira o data:image/png;base64,
      copiaecola: data.pix_code
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
