import express from "express";
import path from "path";
import cors from "cors";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Check-in API
  app.post("/api/checkin", async (req, res) => {
    const { formData, pdfBase64 } = req.body;

    if (!formData || !pdfBase64) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // Configuração do remetente (Email configurado no painel Secrets do AI Studio)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.warn("EMAIL_USER ou EMAIL_PASS não configurados. O e-mail não será enviado.");
      return res.json({ 
        success: true, 
        message: "Check-in recebido, mas o e-mail não foi enviado por falta de credenciais." 
      });
    }

    // Configuração do transportador de e-mail (usando Gmail como padrão)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Padrão de nome de arquivo: CHECKIN_CPF_NOME.pdf
    const fileName = `CHECKIN_${(formData.cpf || "000").replace(/\D/g, "")}_${(formData.nomeCompleto || "CLIENTE").toUpperCase().replace(/\s+/g, "_")}.pdf`;

    // --- CONFIGURAÇÃO DO E-MAIL ---
    const mailOptions = {
      from: `"Sistema de Check-in" <${emailUser}>`,
      // ADICIONE OU REMOVA DESTINATÁRIOS AQUI:
      to: "recepcao@pspresort.com.br, rodrigues.solar@hotmail.com", 
      subject: `Novo Check-in: ${formData.nomeCompleto}`,
      text: `Olá,\n\nUm novo check-in foi realizado por ${formData.nomeCompleto}.\n\nSegue em anexo a ficha de registro oficial em PDF.`,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Check-in processado e e-mail enviado." });
    } catch (error) {
      console.error("Erro ao enviar e-mail:", error);
      res.status(500).json({ error: "Erro ao enviar e-mail de notificação." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
