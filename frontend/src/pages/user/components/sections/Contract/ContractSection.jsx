import React, { useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { useContracts } from '../../../hooks/useContracts';
import { ContractContainer, ContractHeader, ContractTitle } from './Contract.styles';

const ContractSection = () => {
  const { user } = useAuth();
  const {
    contractStatus,
    uploadedContract,
    isUploading,
    uploadProgress,
    contractFile,
    error,
    uploadContract,
    handleContractFileChange,
    setContractFile
  } = useContracts(user?.id);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Hide all scrollbars completely */
      html, body, * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      
      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
      
      /* Force hide any remaining scrollbars */
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleContractFileChange(file);
    }
  };

  const handleContractUpload = async () => {
    try {
      await uploadContract(contractFile);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDownloadContract = () => {
    const userName = user?.name || user?.firstName + ' ' + user?.lastName || 'Client';
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    const contractContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Contrat de Services - IA Italia</title>
        <style>
            @page {
                margin: 2cm;
                size: A4;
            }
            
            body {
                font-family: 'Georgia', serif;
                line-height: 1.8;
                color: #1a1a1a;
                background: white;
            }
            
            .header {
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #2c3e50;
                padding-bottom: 20px;
            }
            
            .header h1 {
                font-size: 28px;
                color: #2c3e50;
                margin: 0;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .header h2 {
                font-size: 24px;
                color: #34495e;
                margin: 10px 0;
                font-weight: bold;
            }
            
            .company-name {
                font-size: 32px;
                color: #2980b9;
                font-weight: bold;
                margin: 15px 0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .section {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-left: 5px solid #3498db;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .section h3 {
                font-size: 20px;
                color: #2c3e50;
                margin: 0 0 15px 0;
                font-weight: bold;
                display: flex;
                align-items: center;
            }
            
            .section-number {
                background: #3498db;
                color: white;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-weight: bold;
            }
            
            .section p {
                margin: 10px 0;
                text-align: justify;
            }
            
            .section ul {
                margin: 15px 0;
                padding-left: 25px;
            }
            
            .section li {
                margin: 8px 0;
                position: relative;
                list-style-type: none;
            }
            
            .section li:before {
                content: "•";
                color: #3498db;
                font-weight: bold;
                position: absolute;
                left: -15px;
            }
            
            .client-info {
                margin: 30px 0;
                padding: 25px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 10px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            
            .client-info h3 {
                color: white;
                margin: 0 0 15px 0;
                font-size: 20px;
                text-align: center;
            }
            
            .client-info p {
                margin: 10px 0;
                font-size: 16px;
            }
            
            .client-info strong {
                color: #ffd700;
                font-weight: bold;
            }
            
            .signatures {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
                gap: 40px;
            }
            
            .signature-box {
                flex: 1;
                text-align: center;
                padding: 20px;
                border: 2px solid #bdc3c7;
                border-radius: 10px;
                background: #ecf0f1;
            }
            
            .signature-box p {
                margin: 0 0 20px 0;
                font-weight: bold;
                color: #2c3e50;
            }
            
            .signature-line {
                border-bottom: 2px solid #2c3e50;
                height: 40px;
                margin-top: 20px;
                position: relative;
            }
            
            .date-location {
                text-align: center;
                margin: 40px 0;
                font-size: 16px;
                font-weight: bold;
                color: #2c3e50;
            }
            
            .highlight {
                background: #fff3cd;
                padding: 3px 6px;
                border-radius: 3px;
                border-left: 3px solid #ffc107;
            }
            
            @media print {
                body { 
                    margin: 0;
                    background: white;
                }
                .section {
                    background: white;
                    border: 1px solid #ddd;
                }
                .client-info {
                    background: #f0f0f0 !important;
                    color: black !important;
                }
                .client-info h3,
                .client-info strong {
                    color: black !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Conditions Générales du</h1>
            <h2>Contrat de Services</h2>
            <div class="company-name">IA ITALIA</div>
        </div>
        
        <div class="section">
            <h3><span class="section-number">1</span>Accompagnement et prestations fournies</h3>
            <p>Le Prestataire a pour rôle d'accompagner le Client dans la préparation complète de son dossier d'études et de mobilité à l'étranger.</p>
            <p>Les prestations commandées comprennent notamment :</p>
            <ul>
                <li>Traduction officielle et apostille des documents requis</li>
                <li>Préinscription auprès des établissements concernés</li>
                <li>Préparation et accompagnement aux tests en ligne (si requis)</li>
                <li>Dépôt et suivi de la demande de bourse et de foyer universitaire</li>
                <li>Préparation complète du dossier de visa (hors décision consulaire)</li>
            </ul>
            <p class="highlight">Le Prestataire s'engage à fournir un accompagnement administratif et organisationnel. Aucune garantie d'acceptation universitaire, de bourse, de logement ou de visa n'est donnée, ces décisions relevant exclusivement des autorités et organismes compétents.</p>
            <p>Le coût total de la prestation est fixé à : DT. Le paiement s'effectue en plusieurs tranches, selon l'échéancier communiqué au Client et accepté par ce dernier.</p>
        </div>
        
        <div class="section">
            <h3><span class="section-number">2</span>Paiement – Modalités financières</h3>
            <p><strong>Conditions essentielles :</strong></p>
            <ul>
                <li>Le dossier complet du Client ne sera remis qu'après paiement intégral de la totalité du montant convenu.</li>
                <li>Tout retard ou non-paiement d'une tranche suspend automatiquement les prestations en cours.</li>
                <li>Les montants versés sont strictement non remboursables, quelle que soit l'issue du dossier (refus, abandon, retard ou changement de projet).</li>
            </ul>
            <p><strong>Les tarifs du Prestataire n'incluent pas notamment :</strong></p>
            <ul>
                <li>Frais universitaires</li>
                <li>Frais de tests officiels de langue</li>
                <li>Frais consulaires et de visa</li>
                <li>Frais liés aux administrations étrangères</li>
            </ul>
            <p>Ces frais restent entièrement à la charge du Client.</p>
        </div>
        
        <div class="section">
            <h3><span class="section-number">3</span>Frais non inclus</h3>
            <p>Les frais mentionnés à l'article 2 restent entièrement à la charge du Client et ne sont pas inclus dans la prestation du Prestataire.</p>
        </div>
        
        <div class="section">
            <h3><span class="section-number">4</span>Obligations du Client</h3>
            <p>Le Client s'engage à :</p>
            <ul>
                <li>Fournir des documents authentiques, complets et exacts</li>
                <li>Respecter les délais de transmission des informations demandées</li>
                <li>Être joignable par téléphone et email valides</li>
                <li>Suivre les consignes administratives communiquées par le Prestataire</li>
            </ul>
            <p class="highlight">Tout manquement du Client pouvant entraîner un retard ou un refus ne saurait engager la responsabilité du Prestataire.</p>
        </div>
        
        <div class="section">
            <h3><span class="section-number">5</span>Durée du contrat</h3>
            <p>Le présent contrat prend effet à compter de sa signature et prend fin après l'exécution complète des prestations commandées ou en cas de rupture selon les conditions ci-après.</p>
        </div>
        
        <div class="section">
            <h3><span class="section-number">6</span>Rupture du contrat</h3>
            <p>En cas de résiliation du contrat par le Client :</p>
            <ul>
                <li>Aucun montant versé ne sera remboursé</li>
                <li>Les prestations déjà réalisées ou en cours restent dues</li>
            </ul>
            <p>Si la rupture intervient avant l'exécution totale des prestations, le Client peut, sous réserve d'accord écrit, reporter le service à une date ultérieure ou le transférer à une autre personne.</p>
        </div>
        
        <div class="client-info">
            <h3>Informations du Client</h3>
            <p><strong>Client :</strong> ${userName}</p>
            <p><strong>Passeport :</strong> [À compléter]</p>
        </div>
        
        <div class="section">
            <h3><span class="section-number">8</span>Acceptation des conditions</h3>
            <p>La signature du présent contrat vaut reconnaissance et acceptation sans réserve de l'ensemble des conditions générales ci-dessus.</p>
        </div>
        
        <div class="date-location">
            <p>Fait à Tunis Le / /</p>
        </div>
        
        <div class="signatures">
            <div class="signature-box">
                <p>Cachet et Signature du Prestataire</p>
                <div class="signature-line"></div>
            </div>
            <div class="signature-box">
                <p>Signature du Client</p>
                <div class="signature-line"></div>
            </div>
        </div>
    </body>
    </html>
    `;
    
    printWindow.document.write(contractContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = function() {
      printWindow.print();
      // Optional: close window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  };

  return (
    <ContractContainer>
    
    <div className="min-h-screen w-full space-y-6 py-6 px-0">
     <div style={{ textAlign: 'center' }}>
                 <ContractTitle>Gestion du Contrat</ContractTitle>
                 <p style={{ color: '#d1d5db', fontSize: '1.125rem', marginTop: '0.5rem' }}>
Vous pouvez consulter votre contrat modèle ci-dessous et le télécharger pour le signer.

                 </p>
               </div>
      
      {/* PDF Viewing Section */}
      <div className style={{ marginTop: '3rem' }}>
        <div className>
          <h3 className="text-lg font-semibold text-white mb-4">
            📄 Voir et Télécharger le Contrat
          </h3>
          <div className="space-y-6">
            
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.open('/contrat.pdf', '_blank')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Voir le Contrat
              </button>
              
              <button
                onClick={handleDownloadContract}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-center"
              >
                <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Télécharger le Contrat
              </button>
            </div>
            
            <div className>
              <p className="text-gray-400 text-xs">
                <strong>Note:</strong> Le contrat doit être téléversé au format PDF après avoir été signé.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section - Show only when status is PENDING */}
      {contractStatus === 'PENDING' && (
        <div className="space-y-6">
          <div className>
            <h3 className="text-lg font-semibold text-white mb-2">
              📋 Instructions
            </h3>
            <ul className="text-gray-300 space-y-1 text-sm">
              <li>• Téléversez votre contrat signé au format PDF</li>
              <li>• Taille maximale: 10MB</li>
              <li>• Assurez-vous que le document est clair et lisible</li>
              <li>• Une fois téléversé, le contrat sera vérifié par l'administration</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center">
            <div className="mb-4">
              <span className="text-4xl">📁</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Téléverser le Contrat Signé
            </h3>
            <p className="text-gray-400 mb-4">
              Glissez-déposez votre fichier PDF ici ou cliquez pour sélectionner
            </p>
            
            <input
              id="contract-file-input"
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <label
              htmlFor="contract-file-input"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              Sélectionner un fichier
            </label>
            
            {contractFile && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">
                  ✅ Fichier sélectionné: {contractFile.name}
                </p>
                <p className="text-gray-400 text-xs">
                  Taille: {(contractFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {contractFile && (
            <button
              onClick={handleContractUpload}
              disabled={isUploading}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Téléversement en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Téléverser le Contrat
                </>
              )}
            </button>
          )}

          {uploadProgress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">❌ {error}</p>
            </div>
          )}
        </div>
      )}

      {/* Status-specific messages - Show when user already has contract */}
      {(contractStatus === 'UPLOADED' || contractStatus === 'CONFIRMED' || contractStatus === 'REJECTED') && (
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              📋 Statut de votre contrat
            </h3>
            <div className="space-y-2">
              <p className="text-gray-300 text-sm">
                <strong>État actuel:</strong> {
                  contractStatus === 'UPLOADED' ? 'En cours de vérification' :
                  contractStatus === 'CONFIRMED' ? 'Approuvé' :
                  'Rejeté'
                }
              </p>
              {uploadedContract && (
                <>
                  <p className="text-gray-300 text-sm">
                    <strong>Fichier:</strong> {uploadedContract.fileName}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <strong>Date de soumission:</strong> {new Date(uploadedContract.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="text-center py-8">
            <span className="text-4xl mb-4 block">
              {contractStatus === 'UPLOADED' ? '⏳' :
               contractStatus === 'CONFIRMED' ? '🎉' : '❌'}
            </span>
            <h3 className="text-lg font-semibold text-white mb-2">
              {contractStatus === 'UPLOADED' ? 'Contrat en cours de vérification' :
               contractStatus === 'CONFIRMED' ? 'Contrat Approuvé!' : 'Contrat Rejeté'}
            </h3>
            <p className="text-gray-400">
              {contractStatus === 'UPLOADED' ? 
                'Votre contrat est en cours d\'examen par l\'administration. Vous recevrez une notification dès qu\'une décision sera prise.' :
               contractStatus === 'CONFIRMED' ? 
                'Félicitations! Votre contrat a été approuvé. Vous pouvez maintenant continuer avec les prochaines étapes de votre dossier.' :
                'Votre contrat a été rejeté. Veuillez contacter le support pour plus d\'informations.'
              }
            </p>
          </div>
        </div>
      )}
    </div>
    </ContractContainer>
  );
};

export default ContractSection;