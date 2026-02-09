'use client';

import React from 'react';

interface CertificateTemplateProps {
    studentName: string;
    courseName: string;
    completionDate: string;
    workloadHours?: number;
    certificateNumber: string;
    verificationUrl: string;
    founderName?: string; // Will default to "Lilian Vanessa Nicacio Gusmão"
    founderTitle?: string; // Will default to "Fundadora"
    founderSignatureUrl?: string; // Optional
    logoUrl?: string; // Default: /brand/logo-figura-viva.jpg
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
    studentName,
    courseName,
    completionDate,
    workloadHours,
    certificateNumber,
    verificationUrl,
    founderName = "Lilian Vanessa Nicacio Gusmão",
    founderTitle = "Fundadora",
    founderSignatureUrl,
    logoUrl = "/brand/logo-figura-viva.jpg"
}) => {
    return (
        <div className="certificate-container">
            {/* Design System & Fonts */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;600&family=Great+Vibes&display=swap');

                :root {
                    --fv-green: #5D7052;
                    --fv-earth: #8C4B3E; /* Terracotta derived */
                    --fv-paper: #F9F7F2; /* Creamy paper */
                    --fv-dark: #2C2C2C;
                }

                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                
                .certificate-container {
                    width: 297mm;
                    height: 210mm;
                    padding: 15mm;
                    background: var(--fv-paper);
                    color: var(--fv-dark);
                    font-family: 'Cormorant Garamond', serif;
                    position: relative;
                    box-sizing: border-box;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                }

                /* Watermark */
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 150mm;
                    opacity: 0.08;
                    pointer-events: none;
                    z-index: 0;
                }

                /* Double Border */
                .certificate-border {
                    width: 100%;
                    height: 100%;
                    border: 1px solid var(--fv-earth);
                    padding: 3px; /* Space between borders */
                    box-sizing: border-box;
                    z-index: 1;
                    position: relative;
                }

                .certificate-inner-border {
                    width: 100%;
                    height: 100%;
                    border: 3px solid var(--fv-green);
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10mm 20mm;
                    position: relative;
                }

                /* Corner Ornaments (CSS Only) */
                .corner {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-style: solid;
                    border-color: var(--fv-earth);
                    z-index: 2;
                }
                .tl { top: 8mm; left: 8mm; border-width: 2px 0 0 2px; }
                .tr { top: 8mm; right: 8mm; border-width: 2px 2px 0 0; }
                .bl { bottom: 8mm; left: 8mm; border-width: 0 0 2px 2px; }
                .br { bottom: 8mm; right: 8mm; border-width: 0 2px 2px 0; }

                /* Header */
                .header-section {
                    text-align: center;
                    margin-bottom: 1rem;
                }

                .brand-logo {
                    height: 20mm;
                    margin-bottom: 4mm;
                    display: block;
                    margin-left: auto;
                    margin-right: auto;
                }

                .institute-name {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.2rem;
                    color: var(--fv-green);
                    font-weight: 600;
                    margin-bottom: 2mm;
                }

                .cert-title {
                    font-size: 3.5rem;
                    color: var(--fv-earth);
                    line-height: 1;
                    margin: 0;
                    font-weight: 400;
                }

                /* Body */
                .body-content {
                    text-align: center;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    width: 100%;
                }

                .certifies-text {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.4rem;
                    font-style: italic;
                    color: #555;
                    margin-bottom: 1rem;
                }

                .student-name {
                    font-size: 3rem;
                    font-family: 'Cormorant Garamond', serif;
                    font-weight: 700;
                    color: var(--fv-dark);
                    border-bottom: 1px solid var(--fv-earth);
                    display: inline-block;
                    padding: 0 2rem 0.5rem 2rem;
                    margin-bottom: 1.5rem;
                    min-width: 50%;
                }

                .course-block {
                    margin-bottom: 1rem;
                }
                
                .course-intro {
                    font-size: 1.3rem;
                    color: #444;
                }

                .course-name {
                    font-size: 2rem;
                    color: var(--fv-green);
                    font-weight: 600;
                    display: block;
                    margin-top: 0.5rem;
                }

                .meta-info {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.9rem;
                    color: #666;
                    margin-top: 1rem;
                }

                /* Footer */
                .footer-section {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 2rem;
                    position: relative;
                }

                .signature-block {
                    text-align: center;
                    min-width: 250px;
                }

                .signature-line {
                    height: 1px;
                    background-color: var(--fv-earth);
                    width: 100%;
                    margin: 10px 0;
                }

                .founder-name {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--fv-dark);
                    display: block;
                }

                .founder-title {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05rem;
                    color: var(--fv-green);
                    display: block;
                }
                
                .signature-img {
                    height: 60px;
                    display: block;
                    margin: 0 auto -10px auto;
                }

                .validation-block {
                    text-align: right;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.75rem;
                    color: #888;
                }

                .validation-url {
                    display: block;
                    color: var(--fv-dark);
                    text-decoration: none;
                    margin-top: 2px;
                    font-weight: 600;
                }

                /* Seal */
                .seal {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90px;
                    height: 90px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    color: var(--fv-green);
                    border: 2px solid var(--fv-green);
                    border-radius: 50%;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 600;
                    background: rgba(255,255,255,0.8);
                    box-shadow: 0 0 0 4px var(--fv-paper), 0 0 0 5px var(--fv-earth);
                }
            `}</style>

            {logoUrl && <img src={logoUrl} alt="Watermark" className="watermark" />}

            <div className="certificate-border">
                {/* Decorative Corners */}
                <div className="corner tl"></div>
                <div className="corner tr"></div>
                <div className="corner bl"></div>
                <div className="corner br"></div>

                <div className="certificate-inner-border">
                    {/* Header */}
                    <div className="header-section">
                        {logoUrl && <img src={logoUrl} alt="Instituto Figura Viva" className="brand-logo" />}
                        <div className="institute-name">Instituto Figura Viva</div>
                        <h1 className="cert-title">Certificado de Conclusão</h1>
                    </div>

                    {/* Body */}
                    <div className="body-content">
                        <p className="certifies-text">Certificamos que</p>
                        <div className="student-name">{studentName}</div>

                        <div className="course-block">
                            <span className="course-intro">concluiu com êxito o curso</span>
                            <span className="course-name">{courseName}</span>
                        </div>

                        <div className="meta-info">
                            {workloadHours && <span>Carga horária: <strong>{workloadHours} horas</strong> • </span>}
                            <span>Concluído em: <strong>{completionDate}</strong></span>
                        </div>
                    </div>

                    {/* Seal */}
                    <div className="seal">
                        <div>
                            Figura<br />Viva<br />Oficial
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer-section">
                        <div className="signature-block">
                            {/* Signature Image (Optional) */}
                            {founderSignatureUrl ? (
                                <img src={founderSignatureUrl} alt="Assinatura" className="signature-img" />
                            ) : <div style={{ height: '50px' }}></div>}

                            <div className="signature-line"></div>
                            <span className="founder-name">{founderName}</span>
                            <span className="founder-title">{founderTitle}</span>
                        </div>

                        <div className="validation-block">
                            <div>Certificado Nº: <strong>{certificateNumber}</strong></div>
                            <div>Verifique a autenticidade em:</div>
                            <a href={verificationUrl} className="validation-url">{verificationUrl}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
