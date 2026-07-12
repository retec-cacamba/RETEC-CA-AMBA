const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const GREEN_PIX_TOKEN = 'pxd_04a8c5ea77334289a1d8bd3a18c5734b';

app.post('/gerar-pix', async (req, res) => {
  try {
    const response = await fetch('https://pix.direct/api/v1/pix/qrcode', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GREEN_PIX_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: parseFloat(req.body.valor),
        description: req.body.descricao,
        customer: {
          name: req.body.nome,
          document: req.body.cpf
        }
      })
    });
    
    const data = await response.json();
    res.json({
      qrcode: data.qr_code,
      copiaecola: data.qr_code_text
    });
    
  } catch (e) {
    res.status(500).json({error: 'Erro ao gerar PIX'});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
