import React, { useState } from 'react';
import { Mail, Code, FileCode2, Info, Copy, CheckCircle2, ExternalLink, AlertTriangle } from 'lucide-react';

const codeGs = `function enviarConvites() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dados = planilha.getDataRange().getValues();
  
  // Assumindo que a linha 1 é o cabeçalho:
  var cabecalho = dados[0];
  var indexNome    = cabecalho.indexOf("Nome do Convidado");
  var indexEmail   = cabecalho.indexOf("Email");
  var indexEmpresa = cabecalho.indexOf("Nome da Empresa");
  var indexCodigo  = cabecalho.indexOf("Código do Convite");
  var indexStatus  = cabecalho.indexOf("Status");
  var indexLog     = cabecalho.indexOf("LOG");

  if (indexNome === -1 || indexEmail === -1 || indexEmpresa === -1 || indexCodigo === -1 || indexStatus === -1) {
    SpreadsheetApp.getUi().alert("Erro: Certifique-se de que as colunas 'Nome do Convidado', 'Email', 'Nome da Empresa', 'Código do Convite' e 'Status' existem na primeira linha.");
    return;
  }

  if (indexLog === -1) {
    SpreadsheetApp.getUi().alert("Erro: A coluna 'LOG' não foi encontrada na primeira linha.");
    return;
  }

  var limiteEnviosPorExecucao = 50; // Limite para evitar timeout e bloqueios
  var enviosNestaExecucao = 0;

  var templateHtml = HtmlService.createHtmlOutputFromFile('TemplateEmail').getContent();

  // Fuso horário do Brasil (Brasília)
  var timeZone = "America/Sao_Paulo";

  for (var i = 1; i < dados.length; i++) {
    var linha = dados[i];
    var status = linha[indexStatus];

    if (status !== "Enviado" && linha[indexEmail] !== "") {
      var nome    = linha[indexNome];
      var email   = linha[indexEmail];
      var empresa = linha[indexEmpresa];
      var codigo  = linha[indexCodigo];

      var assunto = "Convite JPR 2026 | " + nome;

      var corpoHtml = templateHtml
        .replace(/{{NOME DO CONVIDADO}}/g, nome)
        .replace(/{{NOME DA EMPRESA}}/g, empresa)
        .replace(/{{CÓDIGO-CONVITE}}/g, codigo);

      try {
        GmailApp.sendEmail(email, assunto, "", {
          htmlBody: corpoHtml,
          name: empresa + " - Convite JPR 2026"
        });

        // Gera timestamp no fuso de Brasília
        var agora = new Date();
        var timestamp = Utilities.formatDate(agora, timeZone, "dd/MM/yyyy HH:mm:ss");

        // Atualiza Status e LOG na planilha
        planilha.getRange(i + 1, indexStatus + 1).setValue("Enviado");
        planilha.getRange(i + 1, indexLog + 1).setValue("Enviado em " + timestamp);

        enviosNestaExecucao++;

        // Pausa de 1.5 segundos entre envios para evitar bloqueios de taxa do Gmail
        Utilities.sleep(1500);

      } catch (e) {
        // Em caso de erro, registra o erro com timestamp também
        var agora = new Date();
        var timestamp = Utilities.formatDate(agora, timeZone, "dd/MM/yyyy HH:mm:ss");

        planilha.getRange(i + 1, indexStatus + 1).setValue("Erro");
        planilha.getRange(i + 1, indexLog + 1).setValue("Erro em " + timestamp + ": " + e.message);
      }

      if (enviosNestaExecucao >= limiteEnviosPorExecucao) {
        SpreadsheetApp.getUi().alert("Limite de " + limiteEnviosPorExecucao + " envios atingido nesta execução para evitar bloqueios. Execute o script novamente para continuar os envios pendentes.");
        break;
      }
    }
  }

  if (enviosNestaExecucao > 0 && enviosNestaExecucao < limiteEnviosPorExecucao) {
    SpreadsheetApp.getUi().alert("Todos os convites pendentes foram enviados com sucesso!");
  } else if (enviosNestaExecucao === 0) {
    SpreadsheetApp.getUi().alert("Nenhum convite pendente para enviar.");
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('✉️ Envio de Convites')
      .addItem('Enviar Convites Pendentes', 'enviarConvites')
      .addToUi();
}`;

const templateHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body, p, h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #334155; 
      background-color: #f0f4f8; 
      padding: 40px 20px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { 
      max-width: 650px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
    }
    .header-img { 
      width: 100%; 
      max-width: 650px; 
      height: auto; 
      display: block; 
    }
    .bar-dark {
      background-color: #1e293b;
      color: #ffffff;
      text-align: center;
      padding: 24px 20px;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
    }
    .bar-blue {
      background-color: #1e293b;
      color: #ffffff;
      text-align: center;
      padding: 16px 20px;
      font-size: 22px;
      font-weight: bold;
    }
    .section-dark {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 40px 30px;
      text-align: center;
    }
    .section-dark p {
      color: #cbd5e1;
      font-size: 16px;
      text-align: left;
      margin-bottom: 20px;
    }
    .section-dark strong { color: #ffffff; }
    .section-light {
      background-color: #ffffff;
      padding: 40px 30px;
      color: #334155;
    }
    .section-light p {
      margin-bottom: 15px;
      font-size: 15px;
    }
    .btn-orange {
      display: inline-block;
      background-color: #f97316;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 50px;
      font-weight: bold;
      font-size: 18px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);
      text-transform: uppercase;
    }
    .title-orange {
      color: #f97316;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
    }
    .code-box {
      display: block;
      background-color: #fff7ed;
      border: 2px dashed #f97316;
      color: #f97316;
      padding: 15px 20px;
      font-size: 24px;
      font-weight: bold;
      border-radius: 8px;
      letter-spacing: 2px;
      text-align: center;
      margin: 25px auto;
      max-width: 300px;
    }
    .instruction-img { 
      width: 100%; 
      max-width: 100%; 
      height: auto; 
      margin: 20px 0; 
      border: 1px solid #e2e8f0; 
      border-radius: 8px;
      display: block; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .closing {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e2e8f0;
      text-align: left;
    }
    .footer { 
      background-color: #ffffff; 
      padding: 35px 30px; 
      border-top: 1px solid #e2e8f0;
    }
    .rules ul { padding-left: 20px; margin-bottom: 20px; }
    .rules li { 
      margin-bottom: 10px; 
      font-size: 12px;
      color: #475569;
      line-height: 1.5;
    }
    .footer-links {
      font-size: 12px;
      color: #64748b;
      text-align: center;
      margin-top: 25px;
    }
    a { color: #f97316; text-decoration: none; font-weight: 500; }
    @media only screen and (max-width: 600px) {
      body { padding: 10px; }
      .section-dark, .section-light, .footer { padding: 30px 20px; }
      .btn-orange { display: block; width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <img src="https://carlosmelchiors.github.io/Eizo_JPR26/public/image/Banner_JPR26.png" alt="JPR 2026" class="header-img" />

    <div class="bar-dark">
      A RADIX Eizo confirma presença na JPR 2026 e convida você para nos visitar em nosso estande.
    </div>

    <div class="bar-blue">
      <span style="color:#f97316; font-weight:900; font-size:20px;">&#9679;</span> Local: Transamerica Expo Center / SP &nbsp;&nbsp;<span style="color:#f97316; font-weight:900; font-size:20px;">&#9679;</span> Estande 56
    </div>

    <div class="section-dark">
      <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 25px;">Sua Jornada rumo à Precisão Diagnóstica começa aqui:</h2>
      <p>Olá, <strong>{{NOME DO CONVIDADO}}</strong>,</p>
      <p>A <strong>RADIX Eizo</strong> e a <strong>Lumix</strong> têm o prazer de convidá-lo(a) para uma experiência transformadora na <strong>56ª Jornada Paulista de Radiologia (JPR 2026)</strong>, de 30 de abril a 3 de maio.</p>
      <p>Prepare-se para elevar o padrão do seu fluxo de trabalho. Em nosso estande, você descobrirá como a tecnologia de ponta está redefinindo o diagnóstico por imagem:</p>
      <ul style="color: #cbd5e1; margin-bottom: 20px; text-align: left; display: inline-block; font-size: 16px; line-height: 1.7;">
        <li style="margin-bottom: 12px;"><strong style="color:#ffffff;">Monitor Médico Eizo RX570MD:</strong> A referência mundial em fidelidade e clareza para diagnósticos complexos.</li>
        <li style="margin-bottom: 12px;"><strong style="color:#ffffff;">Workstation MEDECOM Univen HealthCare:</strong> A revolução na mamografia com Inteligência Artificial, laudos em segundos e precisão absoluta.</li>
      </ul>
      <p>Não perca a chance de ver de perto as soluções que estão moldando o futuro da radiologia na América Latina.</p>
    </div>

    <a href="http://www.radix.med.br" target="_blank" style="display:block;">
      <img src="https://carlosmelchiors.github.io/Eizo_JPR26/public/image/Banner_RX570.png" alt="Monitor RX570" class="header-img" />
    </a>
    <img src="https://carlosmelchiors.github.io/Eizo_JPR26/public/image/banner_Medecom3.png" alt="Banner Medecom" class="header-img" />

    <div class="section-light" style="text-align: center;">
      <a href="https://spr.iweventos.com.br/evento/visitantesjpr2026/home" class="btn-orange">GARANTIR MINHA VAGA</a>
      <h2 class="title-orange">Como utilizar seu convite isento:</h2>
      <p><strong>1.</strong> Na tela inicial do sistema, informe o seu CPF na opção "Quero me inscrever no evento" e clique no botão "Fazer Inscrição".</p>
      <img src="https://carlosmelchiors.github.io/Eizo_JPR26/public/image/Imagem_inst_1.png" alt="Instrução 1" class="instruction-img" />
      <p style="margin-top: 25px;"><strong>2.</strong> Siga com o processo de inclusão dos dados cadastrais, selecione a atividade "Visita à JPR 2026" e confirme. Insira o código abaixo para garantir sua isenção:</p>
      <div class="code-box">{{CÓDIGO-CONVITE}}</div>
      <img src="https://carlosmelchiors.github.io/Eizo_JPR26/public/image/Imagem_inst_2.png" alt="Instrução 2" class="instruction-img" />
      <p style="margin-top: 25px;">No dia do evento, dirija-se à Secretaria de Visitantes com um documento com foto para retirar seu crachá.</p>
      <p>Além da exposição técnica, você também terá acesso ao curso de <strong>Profissionalismo e Gestão em Saúde</strong> (Sala G - Hall F/G), nos dias 30 de abril, 1º e 2 de maio.</p>
    </div>

    <div class="footer">
      <div class="rules">
        <ul>
          <li>Este convite é pessoal, intransferível e isenta apenas a taxa de inscrição para visitação à exposição técnica da JPR 2026.</li>
          <li>A isenção não contempla cursos pagos, workshops ou outras atividades científicas restritas, exceto o curso de Profissionalismo e Gestão em Saúde.</li>
          <li>É obrigatória a apresentação de documento oficial com foto para a retirada do crachá no local do evento.</li>
        </ul>
      </div>
      <div class="closing">
        <h2 style="font-size: 20px; color: #0f172a; margin-bottom: 8px; font-weight: bold;">Dúvidas?</h2>
        <p style="font-size: 16px; color: #334155; margin-bottom: 8px;">Entre em contato com nosso especialista:</p>
        <div style="font-size: 18px; font-weight: bold; color: #f97316; margin-bottom: 4px;">Paulo Castanho</div>
        <div style="font-size: 16px; color: #334155;">
          <a href="mailto&#58;paulo&#64;eizo&#46;com&#46;br" style="color: #334155; text-decoration: none;">paulo&#64;eizo&#46;com&#46;br</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
        <img src="https://carlosmelchiors.github.io/Eizo_JPR26/public/image/banner_logo_RADIX_EIZO.png" alt="Logo RADIX Eizo" style="max-width: 500px; width: 100%; height: auto; display: inline-block;" />
      </div>
      <div class="footer-links">
        &#169; 2026 RADIX Eizo &#38; Lumix. Todos os direitos reservados.
      </div>
    </div>

  </div>
</body>
</html>`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'instructions' | 'preview' | 'code' | 'template'>('instructions');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handleCopy = (text: string, type: 'code' | 'template') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-slate-800">Gerador de Convites JPR 2026</h1>
            </div>
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'instructions' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Instruções
                </div>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'preview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Preview do E-mail
                </div>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'code' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Code.gs
                </div>
              </button>
              <button
                onClick={() => setActiveTab('template')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'template' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4" />
                  TemplateEmail.html
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'instructions' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-semibold mb-4 text-slate-800">Como configurar o envio em massa</h2>
              <p className="text-slate-600 mb-6">
                Siga os passos abaixo para configurar a sua planilha do Google e enviar os convites de forma automatizada, sem ser bloqueado pelo limite de envios do Gmail.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Prepare a Planilha</h3>
                    <p className="text-slate-600 mt-1">Crie uma nova planilha no Google Sheets e adicione os seguintes cabeçalhos exatamente assim na <strong>Linha 1</strong>:</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono">Nome do Convidado</span>
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono">Email</span>
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono">Nome da Empresa</span>
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono">Código do Convite</span>
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono">Status</span>
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-sm font-mono">LOG</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Preencha os dados dos convidados nas linhas abaixo. As colunas "Status" e "LOG" devem ficar vazias (o script irá preenchê-las).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Acesse o Apps Script</h3>
                    <p className="text-slate-600 mt-1">Na sua planilha, vá no menu superior em <strong>Extensões</strong> &gt; <strong>Apps Script</strong>.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Cole o Código (Code.gs)</h3>
                    <p className="text-slate-600 mt-1">No editor que se abrir, substitua todo o código existente pelo código da aba <strong>Code.gs</strong> desta ferramenta. Salve o projeto clicando no ícone de disquete.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Crie o Template HTML</h3>
                    <p className="text-slate-600 mt-1">No editor do Apps Script, clique no ícone de <strong>+</strong> (Adicionar um arquivo) ao lado de "Arquivos" e escolha <strong>HTML</strong>. Nomeie o arquivo exatamente como <strong>TemplateEmail</strong> (sem o .html no nome, o sistema já adiciona).</p>
                    <p className="text-slate-600 mt-2">Cole o código da aba <strong>TemplateEmail.html</strong> desta ferramenta dentro deste novo arquivo e salve.</p>
                    
                    <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800">Sobre as Imagens</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          As imagens do banner e as de instrução já estão configuradas no código para serem carregadas diretamente do seu repositório no GitHub (<code>carlosmelchiors.github.io/Eizo_JPR26</code>).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">5</div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Execute e Autorize</h3>
                    <p className="text-slate-600 mt-1">Volte para a sua planilha e atualize a página (F5). Um novo menu chamado <strong>✉️ Envio de Convites</strong> aparecerá no topo. Clique nele e selecione <strong>Enviar Convites Pendentes</strong>.</p>
                    <p className="text-slate-600 mt-2">Na primeira vez, o Google pedirá autorização. Clique em "Continuar", escolha sua conta, clique em "Avançado" e depois em "Acessar projeto (não seguro)".</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">6</div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-800">Sobre o Limite de Envios</h3>
                    <p className="text-slate-600 mt-1">
                      Para evitar que sua conta seja bloqueada por spam, o script envia no máximo <strong>50 e-mails por vez</strong> e faz uma pequena pausa entre eles. 
                      Se você tiver mais de 50 convidados, o script avisará quando parar. Basta clicar no menu novamente para enviar o próximo lote.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-sm text-slate-500 font-medium">Preview do E-mail (com dados de exemplo)</div>
              </div>
              <div className="p-0">
                <iframe 
                  srcDoc={templateHtml
                    .replace(/{{NOME DO CONVIDADO}}/g, "João Silva")
                    .replace(/{{NOME DA EMPRESA}}/g, "TechMed Solutions")
                    .replace(/{{CÓDIGO-CONVITE}}/g, "JPR2026-XYZ987")
                  } 
                  className="w-full h-[800px] border-0"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex justify-between items-center">
                <div className="text-slate-300 font-mono text-sm flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Code.gs
                </div>
                <button 
                  onClick={() => handleCopy(codeGs, 'code')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
                >
                  {copiedCode ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[700px]">
                <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
                  {codeGs}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex justify-between items-center">
                <div className="text-slate-300 font-mono text-sm flex items-center gap-2">
                  <FileCode2 className="w-4 h-4" />
                  TemplateEmail.html
                </div>
                <button 
                  onClick={() => handleCopy(templateHtml, 'template')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
                >
                  {copiedTemplate ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copiedTemplate ? 'Copiado!' : 'Copiar HTML'}
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[700px]">
                <pre className="text-slate-300 font-mono text-sm whitespace-pre-wrap">
                  {templateHtml}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
