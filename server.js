const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const GREEN_PIX_TOKEN = process.env.GREEN_PIX_TOKEN;

app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor, descricao, nome, cpf } = req.body;

    const response = await fetch('https://pix.direct/api/v1/pix/qrcode', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GREEN_PIX_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseFloat(valor),
        description: descricao,
        customer: {
          name: nome,
          document: cpf
        }
      })
    });
    
    const data = await response.json();
    
    res.json({
      qrcode: data.qr_code,
      copiaecola: data.qr_code_text
    });
    
  } catch (e) {
    console.error(e);
    res.status(500).json({error: 'Erro ao gerar PIX'});
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
