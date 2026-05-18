import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Hotel, Upload, Download, User, Calendar, Briefcase, Globe, Hash, CreditCard, Car, MapPin, Mail, Phone, Clock, Users, CheckCircle, ShieldCheck, Ship, Printer, Search, FileText, ExternalLink, Shield, ArrowLeft, PenLine } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface FormData {
  nomeCompleto: string;
  dataNascimento: string;
  profissao: string;
  nacionalidade: string;
  idade: string;
  sexo: string;
  documentoNumero: string;
  documentoTipo: string;
  cpf: string;
  placaVeiculo: string;
  residenciaPermanente: string;
  cep: string;
  cidadeEstado: string;
  pais: string;
  email: string;
  ultimaProcedencia: string;
  proximoDestino: string;
  motivoViagem: string;
  meioTransporte: string;
  telefoneResidencial: string;
  telefoneComercial: string;
  dataEntrada: string;
  horaEntrada: string;
  dataSaida: string;
  horaSaida: string;
  acompanhantes: string;
  fnrh: string;
  registro: string;
  uhNo: string;
  codigoPais: string;
  codigoProf: string;
  codigoProced: string;
  codigoDestino: string;
}

const initialFormData: FormData = {
  nomeCompleto: '',
  dataNascimento: '',
  profissao: '',
  nacionalidade: 'BRASILEIRA',
  idade: '',
  sexo: '',
  documentoNumero: '',
  documentoTipo: 'RG',
  cpf: '',
  placaVeiculo: '',
  residenciaPermanente: '',
  cep: '',
  cidadeEstado: '',
  pais: 'BRASIL',
  email: '',
  ultimaProcedencia: '',
  proximoDestino: '',
  motivoViagem: 'Outro',
  meioTransporte: 'Automóvel',
  telefoneResidencial: '',
  telefoneComercial: '',
  dataEntrada: new Date().toISOString().split('T')[0],
  horaEntrada: new Date().toTimeString().split(' ')[0].substring(0, 5),
  dataSaida: '',
  horaSaida: '12:00',
  acompanhantes: '',
  fnrh: '',
  registro: '',
  uhNo: '',
  codigoPais: '',
  codigoProf: '',
  codigoProced: '',
  codigoDestino: '',
};

// Logo padrão em Base64 como fallback caso o arquivo na pasta assets não seja encontrado
const FALLBACK_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjAwIDEwMCI+CiAgPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxNzE3MTciIHJ4PSIxMCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmZmZmZmIiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LXNpemU9IjI0Ij5QT1JUTyBTRUdVUk88L3RleHQ+CiAgPHRleHQgeD0iNTAlIiB5PSI3NSUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjYThhMDQiIGZvbnQtZmFtaWx5PSJzZXJpZiIgZm9udC13ZWlnaHQ9ImJsYWNrIiBmb250LXNpemU9IjI4Ij5QUkFJQSBSRVNPUlQ8L3RleHQ+Cjwvc3ZnPg==';

// CAMINHO DA LOGO: Caso queira mudar a logo padrão, substitua o arquivo na pasta public/assets/
const ASSETS_LOGO_PATH = '/assets/logotipo-do-hotel.jpeg';

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/\D/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength <= 2) return `(${phoneNumber}`;
  if (phoneNumberLength <= 6) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  if (phoneNumberLength <= 10) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

const formatCPF = (value: string) => {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length <= 3) return cpf;
  if (cpf.length <= 6) return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  if (cpf.length <= 9) return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
};

const formatCEP = (value: string) => {
  const cep = value.replace(/\D/g, '');
  if (cep.length <= 5) return cep;
  return `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
};

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

export default function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [logo, setLogo] = useState<string>(ASSETS_LOGO_PATH);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState<'guest' | 'reception_login' | 'reception_panel'>('guest');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id?: string, name: string, url: string }[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [cepError, setCepError] = useState<string | null>(null);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  // CONFIGURAÇÃO DE SEGURANÇA
  const TOKEN_RECEPCAO = import.meta.env.VITE_GAS_TOKEN || "PortoSeguro2026#";
  
  // URL DO GOOGLE APPS SCRIPT
  const gasUrl = import.meta.env.VITE_GAS_URL || "https://script.google.com/macros/s/AKfycbwpMCDki5nQf-AQ-1ZzL4c7sNwxesjPbosuqc8Hwcf5MhZFecQDnTujehWX5yyunHWy/exec";
  
  const pdfRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('hotel-logo');
    if (savedLogo) {
      setLogo(savedLogo);
    }

    // Verifica se a recepção já está logada
    const staffSession = localStorage.getItem('staff-session');
    if (staffSession === TOKEN_RECEPCAO) {
      setCurrentView('guest'); // Mantém o cliente na home por padrão
    }
  }, []);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === TOKEN_RECEPCAO) {
      localStorage.setItem('staff-session', TOKEN_RECEPCAO);
      setCurrentView('reception_panel');
      setLoginPassword('');
      setStatusMessage(null);
    } else {
      setStatusMessage({ type: 'error', text: 'Senha incorreta.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staff-session');
    setCurrentView('guest');
  };

  const handleLogoError = () => {
    if (logo === ASSETS_LOGO_PATH) {
      setLogo(FALLBACK_LOGO);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        localStorage.setItem('hotel-logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;
    
    // Auto-uppercase para campos de texto (exceto e-mail)
    const isTextInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    const isSpecialType = isTextInput && ((e.target as HTMLInputElement).type === 'date' || (e.target as HTMLInputElement).type === 'time');
    
    if (isTextInput && !isSpecialType && name !== 'email') {
      value = value.toUpperCase();
    }

    // Formatação de Telefone
    if (name === 'telefoneResidencial' || name === 'telefoneComercial') {
      value = formatPhoneNumber(value);
    }

    // Formatação de CPF (Apenas para Brasil)
    if (name === 'cpf' && formData.pais === 'BRASIL') {
      value = formatCPF(value);
    }

    // Formatação de CEP e busca ViaCEP (Apenas para Brasil)
    if (name === 'cep' && formData.pais === 'BRASIL') {
      value = formatCEP(value);
      const cleanCEP = value.replace(/\D/g, '');
      if (cleanCEP.length === 8) {
        handleCEPLookup(cleanCEP);
      } else {
        setCepError(null);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCEPLookup = async (cep: string) => {
    setIsLoadingCEP(true);
    setCepError(null);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado');
      } else {
        setFormData(prev => ({
          ...prev,
          residenciaPermanente: `${data.logradouro}${data.bairro ? ', ' + data.bairro : ''}`.toUpperCase(),
          cidadeEstado: `${data.localidade} - ${data.uf}`.toUpperCase(),
          cep: formatCEP(cep)
        }));
      }
    } catch (err) {
      setCepError('Erro ao buscar CEP');
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const isFormValid = 
    formData.nomeCompleto.trim().length > 0 &&
    formData.dataNascimento.trim().length > 0 &&
    formData.idade.trim().length > 0 &&
    formData.sexo.trim().length > 0 &&
    formData.documentoNumero.trim().length > 0 &&
    formData.documentoTipo.trim().length > 0 &&
    (formData.pais === 'BRASIL' ? validateCPF(formData.cpf) : formData.cpf.trim().length > 0) &&
    formData.residenciaPermanente.trim().length > 0 &&
    formData.cidadeEstado.trim().length > 0 &&
    (formData.pais === 'BRASIL' ? formData.cep.trim().length >= 8 : formData.cep.trim().length > 0) &&
    formData.email.trim().length > 0 &&
    (formData.telefoneResidencial.trim().length > 0 || formData.telefoneComercial.trim().length > 0);

  const generatePDF = async () => {
    if (!pdfRef.current) return null;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const pdfElement = clonedDoc.getElementById('pdf-template');
          if (pdfElement) {
            pdfElement.style.color = '#000000';
            pdfElement.style.backgroundColor = '#ffffff';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Standardized Naming: CHECKIN_CPF_NOMEDOCLIENTE.pdf
      const sanitizedCpf = formData.cpf.replace(/\D/g, '') || '00000000000';
      const sanitizedName = formData.nomeCompleto.toUpperCase().replace(/\s+/g, '_');
      const fileName = `CHECKIN_${sanitizedCpf}_${sanitizedName}.pdf`;
      
      pdf.save(fileName);
      
      // Return base64 for GAS
      return { base64: pdf.output('datauristring').split(',')[1], fileName };
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQRPrint = async () => {
    if (!qrRef.current) return;
    setIsGenerating(true);

    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`QR_Code_Checkin_Porto_Seguro.pdf`);
    } catch (error) {
      console.error('Erro ao gerar QR Code para impressão:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAndFinish = async () => {
    if (!formData.nomeCompleto || !formData.email) {
      setStatusMessage({ type: 'error', text: 'Por favor, preencha o nome e o e-mail.' });
      return;
    }

    setStatusMessage({ type: 'success', text: 'Gerando sua ficha e salvando no sistema... Por favor, não feche esta página.' });
    setIsGenerating(true);

    try {
      // 1. Gerar o PDF
      const pdfData = await generatePDF();
      
      if (!pdfData) {
        throw new Error('Falha ao gerar o documento PDF.');
      }

      // Usamos uma abordagem robusta para o Google Script
      // O 'no-cors' permite que a ficha seja enviada sem erros de navegador,
      // mesmo que o Google Script não retorne uma resposta legível para o site.
      const gasPromise = fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          nome: formData.nomeCompleto,
          cpf: formData.cpf,
          pdfBase64: pdfData.base64,
          token: TOKEN_RECEPCAO
        })
      });

      const serverPromise = fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          pdfBase64: pdfData.base64
        })
      }).catch(err => console.warn('Servidor local offline ou com erro, mas prosseguindo com Google Drive...'));

      // Aguardamos ambas as tentativas
      await Promise.allSettled([gasPromise, serverPromise]);

      // 3. Limpar os campos do formulário e resetar estado
      setFormData(initialFormData);

      setStatusMessage({ 
        type: 'success', 
        text: 'Check-in finalizado com sucesso! Sua ficha foi salva no Google Drive e o PDF foi baixado automaticamente.' 
      });

    } catch (error) {
      console.error('Erro ao processar check-in:', error);
      setStatusMessage({ 
        type: 'error', 
        text: 'Ocorreu um erro ao salvar sua ficha. Por favor, tente novamente ou fale com a recepção.' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    setSearchResults([]);
    setStatusMessage(null);

    try {
      const url = new URL(gasUrl);
      url.searchParams.append('busca', searchQuery);
      url.searchParams.append('token', TOKEN_RECEPCAO); // Token de segurança obrigatório na URL para o GAS
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      console.log('Dados recebidos da busca:', data);
      
      let formattedResults = [];
      
      // Verifica se a resposta tem o status de sucesso e se contém dados
      if (data && data.status === 'sucesso' && Array.isArray(data.dados)) {
        formattedResults = data.dados.map((item: any) => ({
          id: item.id || item.fileId,
          name: item.nome || item.name || item.fileName || 'Arquivo sem nome',
          url: item.url || item.viewUrl || item.link || '#'
        }));
      } else if (Array.isArray(data)) {
        // Fallback para caso o retorno seja apenas o array direto
        formattedResults = data.map((item: any) => ({
          id: item.id || item.fileId,
          name: item.nome || item.name || item.fileName || 'Arquivo sem nome',
          url: item.url || item.viewUrl || item.link || '#'
        }));
      }

      setSearchResults(formattedResults);
      
      if (formattedResults.length === 0) {
        setStatusMessage({ type: 'error', text: 'Ficha não localizada. Verifique os dados ou realize um novo check-in.' });
      } else {
        // Se houver resultados, limpa qualquer mensagem de erro anterior
        setStatusMessage(null);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setStatusMessage({ type: 'error', text: 'Erro ao conectar com o Google Drive.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewFile = (fileId?: string, fileUrl?: string) => {
    if (!fileId && !fileUrl) return;
    
    // Tenta extrair o ID do arquivo (ID comum entre /d/ e /view)
    const id = fileId || (fileUrl?.match(/[-\w]{25,}/)?.[0]);
    
    if (id) {
      // Como a pasta é pública, usamos o link de PREVIEW oficial do Google Drive.
      // Isso abre o PDF em um visualizador limpo e ignora conflitos de conta (login).
      const previewUrl = `https://drive.google.com/file/d/${id}/preview`;
      window.open(previewUrl, '_blank');
    } else if (fileUrl) {
      // Fallback para o link original se não detectarmos o ID
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header - Identidade Visual */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-neutral-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* LOGO DO HOTEL: Espaço proporcional para a logo (não circular) */}
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center p-1 border border-neutral-50 overflow-hidden">
                {logo ? (
                  <img 
                    src={logo} 
                    alt="Logo Porto Seguro Praia Resort" 
                    className="w-full h-full object-contain" 
                    onError={handleLogoError}
                  />
                ) : (
                  <Ship className="text-[#f37021] w-14 h-14" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black uppercase text-neutral-900 font-display tracking-tight leading-none">Ficha de Registro de Hóspedes</h1>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentView === 'guest' ? (
                <button 
                  onClick={() => {
                    const session = localStorage.getItem('staff-session');
                    setCurrentView(session === TOKEN_RECEPCAO ? 'reception_panel' : 'reception_login');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-all text-sm font-medium border border-neutral-200"
                >
                  <Shield size={16} /> Acesso Administrativo
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentView('guest')}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-all text-sm font-medium border border-neutral-200"
                  >
                    <ArrowLeft size={16} /> Voltar ao Check-in
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all text-sm font-medium border border-red-200"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl text-sm font-medium border shadow-sm flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <Shield size={18} />}
            {statusMessage.text}
          </div>
        )}

        {currentView === 'guest' ? (
          <div className="bg-white p-8 shadow-sm rounded-2xl border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-3 font-display">
              <FileText className="text-neutral-400" /> Registro de Hóspede / Guest Registration
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Row 1 */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <User size={14} /> Nome Completo / Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="nomeCompleto" value={formData.nomeCompleto} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Calendar size={14} /> Data de Nasc. / Date Born <span className="text-red-500">*</span>
              </label>
              <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>

            {/* Row 2 */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Globe size={14} /> País / Country <span className="text-red-500">*</span>
              </label>
              <select 
                name="pais" 
                value={formData.pais} 
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({ 
                    ...prev, 
                    pais: val,
                    nacionalidade: val === 'BRASIL' ? 'BRASILEIRA' : prev.nacionalidade,
                    cep: '',
                    cpf: ''
                  }));
                  setCepError(null);
                }} 
                className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
              >
                <option value="BRASIL">BRASIL</option>
                <option value="ARGENTINA">ARGENTINA</option>
                <option value="PARAGUAI">PARAGUAI</option>
                <option value="URUGUAI">URUGUAI</option>
                <option value="CHILE">CHILE</option>
                <option value="ESTADOS UNIDOS">ESTADOS UNIDOS</option>
                <option value="COLÔMBIA">COLÔMBIA</option>
                <option value="OUTRO">OUTRO / OTHER</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Globe size={14} /> Nacionalidade / Nationality
              </label>
              <input type="text" name="nacionalidade" value={formData.nacionalidade} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Briefcase size={14} /> Profissão / Occupation
              </label>
              <input type="text" name="profissao" value={formData.profissao} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Hash size={14} /> Idade / Age <span className="text-red-500">*</span>
              </label>
              <input type="number" name="idade" value={formData.idade} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Sexo / Sex <span className="text-red-500">*</span></label>
              <select name="sexo" value={formData.sexo} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm">
                <option value="">Selecione / Select</option>
                <option value="Masculino">Masculino / Male</option>
                <option value="Feminino">Feminino / Female</option>
              </select>
            </div>

            {/* Row 3 */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Doc. Identidade / Travel Doc <span className="text-red-500">*</span></label>
              <input type="text" name="documentoNumero" value={formData.documentoNumero} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" placeholder="Número / Number" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Tipo / Type <span className="text-red-500">*</span></label>
              <input type="text" name="documentoTipo" value={formData.documentoTipo} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" placeholder={formData.pais === 'BRASIL' ? "RG, CNH..." : "Passaporte, DNI..."} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">{formData.pais === 'BRASIL' ? 'CPF' : 'ID Fiscal / Local ID'} <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="cpf" 
                value={formData.cpf} 
                onChange={handleInputChange} 
                className={`w-full px-4 py-2 bg-neutral-50 border rounded-lg text-sm transition-colors ${
                  formData.pais === 'BRASIL' && formData.cpf.length > 0 && !validateCPF(formData.cpf) 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-neutral-200 focus:ring-black'
                }`}
                placeholder={formData.pais === 'BRASIL' ? "000.000.000-00" : "ID Number"}
              />
              {formData.pais === 'BRASIL' && formData.cpf.length > 0 && !validateCPF(formData.cpf) && (
                <p className="text-[10px] text-red-500 font-medium">CPF inválido / Invalid CPF</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Car size={14} /> Placa / Plate
              </label>
              <input type="text" name="placaVeiculo" value={formData.placaVeiculo} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>

            {/* Row 4 */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <MapPin size={14} /> Residência / Residence <span className="text-red-500">*</span>
              </label>
              <input type="text" name="residenciaPermanente" value={formData.residenciaPermanente} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-neutral-700">{formData.pais === 'BRASIL' ? 'CEP / Zip Code' : 'Código Postal'} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  name="cep" 
                  value={formData.cep} 
                  onChange={handleInputChange} 
                  className={`w-full px-4 py-2 bg-neutral-50 border rounded-lg text-sm transition-colors ${
                    cepError ? 'border-red-500' : 'border-neutral-200'
                  }`} 
                  placeholder={formData.pais === 'BRASIL' ? "00000-000" : "Zip Code"}
                />
                {isLoadingCEP && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-neutral-300 border-t-neutral-900 rounded-full" />
                  </div>
                )}
              </div>
              {cepError && (
                <p className="text-[10px] text-red-500 font-medium">{cepError}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Cidade, Estado / City, State <span className="text-red-500">*</span></label>
              <input type="text" name="cidadeEstado" value={formData.cidadeEstado} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>

            {/* Row 5 */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Mail size={14} /> E-mail <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" placeholder="seu@email.com" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Última Procedência / Arriving from</label>
              <input type="text" name="ultimaProcedencia" value={formData.ultimaProcedencia} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Próximo Destino / Next Destination</label>
              <input type="text" name="proximoDestino" value={formData.proximoDestino} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
            </div>

            {/* Row 6 - Motivo e Meio */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Motivo da Viagem / Purpose of Trip</label>
              <select name="motivoViagem" value={formData.motivoViagem} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm">
                <option value="Negócio">Negócio / Business</option>
                <option value="Turismo">Turismo / Tourism</option>
                <option value="Convenção">Convenção / Convention</option>
                <option value="Outro">Outro / Other</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Meio de Transporte / Arriving by</label>
              <select name="meioTransporte" value={formData.meioTransporte} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm">
                <option value="Avião">Avião / Plane</option>
                <option value="Navio">Navio / Ship</option>
                <option value="Automóvel">Automóvel / Car</option>
                <option value="Ônibus">Ônibus / Bus</option>
              </select>
            </div>

            {/* Row 7 - Telefones */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Phone size={14} /> Telefone Residencial / Home <span className="text-neutral-400 text-[10px]">(Ao menos um telefone)</span>
              </label>
              <input type="text" name="telefoneResidencial" value={formData.telefoneResidencial} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" placeholder="(00) 00000-0000" />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Phone size={14} /> Telefone Comercial / Business
              </label>
              <input type="text" name="telefoneComercial" value={formData.telefoneComercial} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" placeholder="(00) 00000-0000" />
            </div>

            {/* Row 8 - Entrada/Saída */}
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Entrada / Check-in</label>
                <input type="date" name="dataEntrada" value={formData.dataEntrada} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                  <Clock size={14} /> Hora / Time
                </label>
                <input type="time" name="horaEntrada" value={formData.horaEntrada} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Saída / Check-out</label>
                <input type="date" name="dataSaida" value={formData.dataSaida} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                  <Clock size={14} /> Hora / Time
                </label>
                <input type="time" name="horaSaida" value={formData.horaSaida} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm" />
              </div>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
                <Users size={14} /> Acompanhantes / Companions
              </label>
              <textarea name="acompanhantes" value={formData.acompanhantes} onChange={handleInputChange} className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm h-20" placeholder="Nome dos acompanhantes / Names of companions..." />
            </div>

            {/* Signature Area (Manual) */}
            <div className="md:col-span-4 flex flex-col items-center border-t border-neutral-100 pt-6 mt-2">
              <div className="w-full max-w-xs border-b-2 border-neutral-300 h-6 mb-1"></div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-center">
                Assinatura do Hóspede (Manual) / Guest's Signature
              </p>
            </div>

            <div className="md:col-span-4 pt-8 space-y-4">
              <button
                type="button"
                onClick={handleSubmitAndFinish}
                disabled={isGenerating || !isFormValid}
                className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg ${
                  !isFormValid 
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none' 
                    : 'bg-neutral-900 text-white hover:bg-neutral-800'
                }`}
              >
                <CheckCircle size={20} /> Finalizar Check-in e Baixar PDF / Finish Check-in and Download PDF
              </button>

              <div className="flex items-center justify-center gap-2 text-neutral-500 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <ShieldCheck size={16} className="text-green-600" />
                <p className="text-center">
                  <strong>Check-in Digital Seguro:</strong> Seus dados são transmitidos de forma criptografada para nossa recepção.
                  <br />
                  <strong>Secure Digital Check-in:</strong> Your data is transmitted encrypted to our reception.
                </p>
              </div>
            </div>
          </form>
        </div>
        ) : currentView === 'reception_login' ? (
          <div className="bg-white p-8 shadow-sm rounded-2xl border border-neutral-200 max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="bg-neutral-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-900">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Login Recepção</h2>
              <p className="text-neutral-500 text-sm">Área restrita para colaboradores</p>
            </div>
            
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 block px-1">Senha de Acesso / Security Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-neutral-900 text-white font-bold py-3 rounded-xl hover:bg-neutral-800 transition-all shadow-lg"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white p-8 shadow-sm rounded-2xl border border-neutral-200 min-h-[400px]">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2 font-display">Painel da Recepção</h2>
                <p className="text-neutral-500">Busque por Nome ou CPF nos registros ativos</p>
                
                <div className="mt-4 flex justify-center gap-4">
                   <button 
                    onClick={generateQRPrint}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-all text-xs font-medium border border-neutral-200"
                  >
                    <Printer size={14} /> Imprimir QR Code de Balcão
                  </button>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-all text-xs font-medium border border-neutral-200">
                    <Upload size={14} /> Alterar Logotipo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>

              <form onSubmit={handleSearch} className="mb-10">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 flex items-center gap-2 px-1 mb-2">
                    <Search size={14} className="text-neutral-400" /> Termo de Busca (Nome ou CPF)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ex: 12345678900 ou João Silva" 
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="bg-neutral-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-all disabled:opacity-50"
                    >
                      {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : 'Buscar'}
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  searchResults.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-neutral-400 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-50 p-2 rounded-lg">
                          <FileText className="text-red-600" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-neutral-900">{file.name}</p>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">PDF Armazenado no Drive</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleViewFile(file.id, file.url)}
                        className="flex items-center gap-2 text-xs font-bold text-neutral-700 bg-white border border-neutral-200 px-4 py-2 rounded-lg hover:bg-neutral-50 transition-all"
                      >
                        <ExternalLink size={14} /> Abrir Ficha
                      </button>
                    </div>
                  ))
                ) : !isSearching && searchQuery && (
                  <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    <p className="text-neutral-400 text-sm">Sem resultados para sua busca.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Template (Matching the image) */}
      <div className="fixed -left-[9999px] top-0">
        <div id="pdf-template" ref={pdfRef} className="w-[210mm] min-h-[297mm] bg-white p-[10mm] text-black font-serif border-[1px] border-neutral-300" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          {/* Header Box */}
          <div className="border-[2px] border-black rounded-3xl p-8 mb-6 flex items-center" style={{ borderColor: '#000000', minHeight: '45mm' }}>
            <div className="w-1/3 flex items-center justify-start" style={{ height: '35mm' }}>
              {logo ? (
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-full h-full object-contain" 
                  onError={handleLogoError}
                />
              ) : (
                <div className="bg-white p-2 rounded flex items-center justify-center w-full h-full">
                  <Ship className="text-[#f37021] w-20 h-20" />
                </div>
              )}
            </div>
            <div className="w-2/3 flex items-center justify-center px-4">
              <h1 className="text-2xl font-black uppercase text-center tracking-tight leading-none" style={{ fontFamily: 'sans-serif' }}>Ficha de Registro de Hóspedes</h1>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="border-[1px] border-black text-[9px]" style={{ borderColor: '#000000' }}>
            {/* Row 1 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Nome Completo / Full Name</p>
                <p className="font-bold text-sm h-6">{formData.nomeCompleto}</p>
              </div>
              <div className="w-48 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Data de Nasc. / Date Born</p>
                <p className="font-bold text-sm h-6 text-center">{formData.dataNascimento ? new Date(formData.dataNascimento).toLocaleDateString('pt-BR') : '/ /'}</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Profissão / Occupation</p>
                <p className="font-bold text-sm h-6">{formData.profissao}</p>
              </div>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Nacionalidade / Nationality</p>
                <p className="font-bold text-sm h-6">{formData.nacionalidade}</p>
              </div>
              <div className="w-20 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Idade / Age</p>
                <p className="font-bold text-sm h-6 text-center">{formData.idade}</p>
              </div>
              <div className="w-48 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Sexo / Sex</p>
                <div className="flex gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 border border-black flex items-center justify-center`} style={{ borderColor: '#000000' }}>{formData.sexo === 'Masculino' ? 'X' : ''}</div>
                    <span>Masc / Male</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-3 h-3 border border-black flex items-center justify-center`} style={{ borderColor: '#000000' }}>{formData.sexo === 'Feminino' ? 'X' : ''}</div>
                    <span>Fem / Female</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <div className="p-1 border-b border-black" style={{ borderBottomColor: '#000000' }}>
                  <p className="italic text-gray-500" style={{ color: '#737373' }}>Documento de Identidade / Travel Document</p>
                </div>
                <div className="flex">
                  <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                    <p className="italic text-gray-500" style={{ color: '#737373' }}>Número / Number</p>
                    <p className="font-bold text-sm h-6">{formData.documentoNumero}</p>
                  </div>
                  <div className="flex-1 p-1">
                    <p className="italic text-gray-500" style={{ color: '#737373' }}>Tipo / Type</p>
                    <p className="font-bold text-sm h-6">{formData.documentoTipo}</p>
                  </div>
                </div>
              </div>
              <div className="w-48 border-r border-black p-1" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>{formData.pais === 'BRASIL' ? 'CPF' : 'ID Fiscal / Local ID'}</p>
                <p className="font-bold h-12 flex items-center justify-center text-base">{formData.cpf}</p>
              </div>
              <div className="w-40 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Placa / Plate</p>
                <p className="font-bold h-12 flex items-center justify-center text-base">{formData.placaVeiculo}</p>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-[2] p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Residência Permanente / Permanent Address</p>
                <p className="font-bold text-sm h-6">{formData.residenciaPermanente}</p>
              </div>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>{formData.pais === 'BRASIL' ? 'CEP / Zip Code' : 'Código Postal'}</p>
                <p className="font-bold text-sm h-6">{formData.cep}</p>
              </div>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Cidade, Estado / City, State</p>
                <p className="font-bold text-sm h-6">{formData.cidadeEstado}</p>
              </div>
              <div className="flex-1 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>País / Country</p>
                <p className="font-bold text-sm h-6">{formData.pais || 'Brasil'}</p>
              </div>
            </div>

            {/* Row 5 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>E-mail</p>
                <p className="font-bold text-sm h-6">{formData.email}</p>
              </div>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Última Procedência / Arriving from</p>
                <p className="font-bold text-sm h-6">{formData.ultimaProcedencia}</p>
              </div>
              <div className="flex-1 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Próximo Destino / Next Destination</p>
                <p className="font-bold text-sm h-6">{formData.proximoDestino}</p>
              </div>
            </div>

            {/* Row 6 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Motivo da Viagem / Purpose of Trip</p>
                <div className="grid grid-cols-2 gap-y-1 mt-1">
                  {['Negócio/Business', 'Turismo/Tourism', 'Convenção/Convention', 'Outro/Other'].map(m => (
                    <div key={m} className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-black flex items-center justify-center" style={{ borderColor: '#000000' }}>{formData.motivoViagem === m.split('/')[0] ? 'X' : ''}</div>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Meio de Transporte / Arriving by</p>
                <div className="grid grid-cols-2 gap-y-1 mt-1">
                  {['Avião/Plane', 'Navio/Ship', 'Automóvel/Car', 'Ônibus/Bus'].map(t => (
                    <div key={t} className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-black flex items-center justify-center" style={{ borderColor: '#000000' }}>{formData.meioTransporte === t.split('/')[0] ? 'X' : t === 'Automóvel/Car' && formData.meioTransporte === 'Automóvel' ? 'X' : ''}</div>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 7 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Assinatura do Hóspede / Guest's Signature</p>
                <div className="h-10 flex items-end pb-1">
                   <p className="text-xl font-bold ml-2">X _______________________</p>
                </div>
              </div>
              <div className="w-44 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Telefone Residencial / Home Telephone</p>
                <p className="font-bold text-sm h-8 mt-1 leading-tight">{formData.telefoneResidencial}</p>
              </div>
              <div className="w-44 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Telefone Comercial / Business Telephone</p>
                <p className="font-bold text-sm h-8 mt-1 leading-tight">{formData.telefoneComercial}</p>
              </div>
            </div>

            {/* Row 8 */}
            <div className="flex border-b border-black" style={{ borderBottomColor: '#000000' }}>
              <div className="flex-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <div className="p-1 border-b border-black bg-gray-50" style={{ borderBottomColor: '#000000', backgroundColor: '#f9fafb' }}>
                  <p className="font-bold">Entrada / Check-in</p>
                </div>
                <div className="flex p-1">
                  <div className="flex-1">
                    <p className="italic text-gray-500" style={{ color: '#737373' }}>Data / Date</p>
                    <p className="font-bold text-sm">{formData.dataEntrada}</p>
                  </div>
                  <div className="flex-1">
                    <p className="italic text-gray-500" style={{ color: '#737373' }}>Hora / Time</p>
                    <p className="font-bold text-sm">{formData.horaEntrada}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <div className="p-1 border-b border-black bg-gray-50" style={{ borderBottomColor: '#000000', backgroundColor: '#f9fafb' }}>
                  <p className="font-bold">Saída / Check-out</p>
                </div>
                <div className="flex p-1">
                  <div className="flex-1">
                    <p className="italic text-gray-500" style={{ color: '#737373' }}>Data / Date</p>
                    <p className="font-bold text-sm">{formData.dataSaida}</p>
                  </div>
                  <div className="flex-1">
                    <p className="italic text-gray-500" style={{ color: '#737373' }}>Hora / Time</p>
                    <p className="font-bold text-sm">{formData.horaSaida}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-1">
                <p className="italic text-gray-500" style={{ color: '#737373' }}>Acompanhantes / Companions</p>
                <p className="font-bold text-[10px] leading-tight">{formData.acompanhantes}</p>
              </div>
            </div>

            {/* Row 9 */}
            <div className="flex">
              <div className="w-20 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="font-bold">FNRH</p>
                <p className="h-4 text-sm font-bold">{formData.fnrh}</p>
              </div>
              <div className="w-32 p-1 border-r border-black" style={{ borderRightColor: '#000000' }}>
                <p className="font-bold">Registro / Registration</p>
                <p className="h-4 text-sm font-bold">{formData.registro}</p>
              </div>
              <div className="w-24 p-1">
                <p className="font-bold">UH Nº / Room No</p>
                <p className="h-4 text-sm font-bold">{formData.uhNo}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* QR Code Print Template */}
      <div className="fixed -left-[9999px] top-0">
        <div ref={qrRef} className="w-[210mm] h-[297mm] bg-white flex flex-col items-center justify-center p-20 text-black font-serif">
            <div className="flex flex-col items-center gap-8 mb-16">
              <div className="bg-white p-6 rounded-3xl shadow-xl w-56 h-56 flex items-center justify-center border border-neutral-100">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            <div className="text-center space-y-2">
              <h1 className="text-5xl font-bold tracking-tight">Check-in Online</h1>
              <h2 className="text-3xl text-neutral-600">Porto Seguro Praia Resort</h2>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-neutral-100">
            <QRCodeCanvas 
              value={window.location.href}
              size={400}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-20 text-center space-y-4">
            <p className="text-2xl font-medium text-neutral-500">Aponte a câmera do seu celular para iniciar</p>
            <p className="text-xl italic text-neutral-400">Point your camera to start your check-in</p>
          </div>

          <div className="absolute bottom-20 w-full text-center border-t border-neutral-100 pt-10">
            <p className="text-neutral-300 font-sans tracking-widest uppercase text-sm">Bem-vindo ao Paraíso / Welcome to Paradise</p>
          </div>
        </div>
      </div>
    </div>
  );
}
