const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8080;

const MISTIC_API_URL =
  'https://api.misticpay.com/api/transactions/create';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

function somenteNumeros(valor = '') {
  return String(valor).replace(/\D/g, '');
}

function removerPrefixoBase64(base64 = '') {
  return String(base64).replace(
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
    ''
  );
}

function criarTransactionId() {
  return `RETEC-${Date.now()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`;
}

async function enviarTelegram(mensagem) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // A notificação é opcional.
  if (!token || !chatId) {
    return;
  }

  try {
    const resposta = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: mensagem,
          parse_mode: 'HTML'
        })
      }
    );

    if (!resposta.ok) {
      const texto = await resposta.text();
      console.error(
        'Erro ao enviar mensagem ao Telegram:',
        resposta.status,
        texto
      );
    }
  } catch (erro) {
    console.error('Falha de conexão com o Telegram:', erro.message);
  }
}

// GERAÇÃO DA COBRANÇA PIX
app.post('/gerar-pix', async (req, res) => {
  try {
    const {
      valor,
      descricao,
      nome,
      cpf
    } = req.body;

    const valorNumerico = Number(valor);
    const cpfLimpo = somenteNumeros(cpf);
    const nomeLimpo = String(nome || '').trim();
    const descricaoLimpa =
      String(descricao || 'Aluguel de caçamba').trim();

    if (
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      return res.status(400).json({
        error: 'Valor da cobrança inválido.'
      });
    }

    if (nomeLimpo.length < 3) {
      return res.status(400).json({
        error: 'Informe corretamente o nome do cliente.'
      });
    }

    if (cpfLimpo.length !== 11) {
      return res.status(400).json({
        error: 'CPF inválido.'
      });
    }

    if (
      !process.env.MISTIC_CLIENT_ID ||
      !process.env.MISTIC_CLIENT_SECRET
    ) {
      console.error(
        'As credenciais da Mistic Pay não estão configuradas.'
      );

      return res.status(500).json({
        error: 'O meio de pagamento não está configurado.'
      });
    }

    const transactionId = criarTransactionId();

    const respostaMistic = await fetch(MISTIC_API_URL, {
      method: 'POST',
      headers: {
        ci: process.env.MISTIC_CLIENT_ID,
        cs: process.env.MISTIC_CLIENT_SECRET,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        amount: Number(valorNumerico.toFixed(2)),
        payerName: nomeLimpo,
        payerDocument: cpfLimpo,
        transactionId,
        description: descricaoLimpa
      })
    });

    const textoResposta = await respostaMistic.text();

    let resultado;

    try {
      resultado = JSON.parse(textoResposta);
    } catch {
      console.error(
        'Resposta não JSON da Mistic Pay:',
        respostaMistic.status,
        textoResposta
      );

      return res.status(502).json({
        error: 'Resposta inválida do provedor de pagamento.'
      });
    }

    if (!respostaMistic.ok) {
      console.error(
        'Erro retornado pela Mistic Pay:',
        respostaMistic.status,
        resultado
      );

      const mensagem =
        resultado?.message ||
        resultado?.error ||
        'Não foi possível gerar o PIX.';

      return res.status(respostaMistic.status).json({
        error: mensagem
      });
    }

    const transacao = resultado?.data;

    if (
      !transacao?.qrCodeBase64 ||
      !transacao?.copyPaste
    ) {
      console.error(
        'Resposta incompleta da Mistic Pay:',
        resultado
      );

      return res.status(502).json({
        error:
          'O provedor não retornou o QR Code ou o código PIX.'
      });
    }

    console.log('PIX CRIADO:', {
      transactionId: transacao.transactionId,
      estado: transacao.transactionState,
      valor: valorNumerico
    });

    // Mantém os mesmos nomes esperados pelo seu index.html.
    return res.json({
      qrCodeBase64: removerPrefixoBase64(
        transacao.qrCodeBase64
      ),
      copiaecola: transacao.copyPaste,
      id:
        transacao.transactionId ||
        transactionId,
      status:
        transacao.transactionState ||
        'PENDENTE'
    });
  } catch (erro) {
    console.error('Erro ao gerar PIX:', erro);

    return res.status(500).json({
      error:
        'Erro interno ao gerar o PIX. Tente novamente.'
    });
  }
});

// WEBHOOK DA MISTIC PAY
app.post('/webhook-pix', async (req, res) => {
  try {
    const {
      transactionId,
      transactionType,
      transactionMethod,
      clientName,
      clientDocument,
      status,
      value,
      fee,
      e2e
    } = req.body || {};

    console.log('WEBHOOK MISTIC PAY RECEBIDO:', {
      transactionId,
      transactionType,
      transactionMethod,
      clientName,
      clientDocument,
      status,
      value,
      fee,
      e2e
    });

    if (!transactionId || !status) {
      return res.status(400).json({
        error: 'Webhook sem transactionId ou status.'
      });
    }

    const statusNormalizado =
      String(status).toUpperCase();

    if (statusNormalizado === 'COMPLETO') {
      // Pelo exemplo da documentação, value está em centavos.
      const valorPago =
        Number.isFinite(Number(value))
          ? Number(value) / 100
          : 0;

      const taxa =
        Number.isFinite(Number(fee))
          ? Number(fee) / 100
          : 0;

      console.log('PIX CONFIRMADO:', {
        transactionId,
        valorPago,
        taxa,
        e2e
      });

      await enviarTelegram(
        [
          '✅ <b>PIX confirmado!</b>',
          '',
          `<b>Transação:</b> ${transactionId}`,
          `<b>Cliente:</b> ${clientName || 'Não informado'}`,
          `<b>Documento:</b> ${
            clientDocument || 'Não informado'
          }`,
          `<b>Valor:</b> R$ ${valorPago.toFixed(2)}`,
          `<b>Taxa:</b> R$ ${taxa.toFixed(2)}`,
          `<b>E2E:</b> ${e2e || 'Não informado'}`
        ].join('\n')
      );
    }

    // Responde rapidamente para a Mistic Pay não reenviar
    // o webhook por falta de confirmação.
    return res.sendStatus(200);
  } catch (erro) {
    console.error('Erro no webhook:', erro);
    return res.sendStatus(500);
  }
});

// Rota opcional para verificar se o servidor está no ar.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    paymentProvider: 'Mistic Pay'
  });
});

// Entrega o site para as demais rotas.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor RETEC rodando na porta ${PORT}`);
});
