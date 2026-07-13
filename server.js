const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // pra servir o index.html

const PORT = process.env.PORT || 8080;
const PIX_TOKEN = process.env.PIX_TOKEN; // coloca no Railway Variables
const DESCONTO = 0.30;

// BANCO TEMPORÁRIO - depois troca por DB de verdade
let pagamentos = {};

// 1. GERAR PIX
app.post('/gerar-pix', async (req, res) => {
  try {
    const { valor, nome, cpf } = req.body;
    
    const valorComDesconto = (parseFloat(valor) - DESCONTO).toFixed(2);
    const id = 'pix_' + Date.now();

    const response = await axios.post(
      'https://api.pix.direct/cobranca',
      {
        valor: valorComDesconto,
        identificacao: id,
        descricao: `Caçamba R$ ${valor}`
      },
      { headers: { 'Authorization': `Bearer ${PIX_TOKEN}` } }
    );

    // Salva pra consultar depois
    pagamentos[id] = {
      status: 'PENDING',
      valorOriginal: valor,
      valorPago: valorComDesconto,
      qr: response.data.qrCode,
      copiaecola: response.data.copiaecola
    };

    res.json({
      id: id,
      qrCode: response.data.qrCode,
      copiaecola: response.data.copiaecola,
      valor: valorComDesconto
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ erro: 'Erro ao gerar PIX' });
  }
});


// 2. WEBHOOK - AQUI QUE ATUALIZA PRA PAGO
app.post('/webhook', express.json(), async (req, res) => {
  console.log('WEBHOOK RECEBIDO:', req.body);
  
  const { status, identificacao, valor } = req.body;
  
  if(status === 'PAID' && pagamentos[identificacao]){
    pagamentos[identificacao].status = 'PAID';
    console.log(`PAGAMENTO CONFIRMADO: ${identificacao} - R$ ${valor}`);
    
    // AQUI VOCÊ PODE AVISAR NO TELEGRAM TAMBÉM
    // await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {...})
  }
  
  res.sendStatus(200); // pix.direct exige 200
});


// 3. CONSULTAR STATUS - pro site atualizar sozinho
app.get('/status-pix/:id', (req, res) => {
  const id = req.params.id;
  if(pagamentos[id]){
    res.json({ status: pagamentos[id].status });
  } else {
    res.status(404).json({ erro: 'PIX não encontrado' });
  }
});


app.listen(PORT, () => {
  console.log(`Rodando na porta ${PORT}`);
});
