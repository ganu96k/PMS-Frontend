import { useState } from "react";
import styles from "./CertificatesStyles.module.css";

// Import real PDFs from the local folder
import CopadoCert from "../../Certificates/COPADO ESSENTIALS+ Certificate.pdf";
import PD1Cert from "../../Certificates/Cert6136677_PlatformDeveloperI_20250503.pdf";
import AdminCert from "../../Certificates/Cert6308821_Administrator_20250628.pdf";
import AgentforceCert from "../../Certificates/Cert6331176_AgentforceSpecialist_20250704.pdf";
import SalesCloudCert from "../../Certificates/Cert7541564_SalesCloudConsultant_20260314.pdf";

const Certificates = () => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const certificates = [
    {
      id: 1,
      title: "Salesforce Certified Platform Developer I",
      issuer: "Salesforce",
      date: "May 2025",
      url: PD1Cert,
      description: "Proven knowledge and skills in building custom declarative and programmatic applications on the Salesforce platform.",
      credentialId: "24503791",
      icon: "☁️"
    },
    {
      id: 2,
      title: "Salesforce Certified Administrator",
      issuer: "Salesforce",
      date: "June 2025",
      url: AdminCert,
      description: "Broad knowledge of Salesforce applications, configuring the platform, and managing users and data.",
      credentialId: "24618205",
      icon: "⚙️"
    },
    {
      id: 3,
      title: "Agentforce Specialist",
      issuer: "Salesforce",
      date: "July 2025",
      url: AgentforceCert,
      description: "Specialized certification for Agentforce and AI-driven automation on the Salesforce platform.",
      credentialId: "24683211",
      icon: "🤖"
    },
    {
      id: 4,
      title: "Sales Cloud Consultant",
      issuer: "Salesforce",
      date: "March 2026",
      url: SalesCloudCert,
      description: "Expertise in designing and implementing Sales Cloud solutions that meet business requirements.",
      credentialId: "25814562",
      icon: "📈"
    },
    {
      id: 5,
      title: "COPADO ESSENTIALS+",
      issuer: "Copado",
      date: "2025",
      url: CopadoCert,
      description: "Mastery of Copado Essentials for Salesforce DevOps, version control, and deployment management.",
      credentialId: "CO-ESS-987",
      icon: "🚀"
    }
  ];

  return (
    <section className={styles.certificatesSection} id="certificates">
      <div className={styles.container}>
        <div className={styles.headerArea}>
          <h2 className={styles.sectionTitle}>Professional Certifications</h2>
          <div className={styles.titleUnderline}></div>
          <p className={styles.sectionSubtitle}>
            Verified credentials and industry-standard certifications in Salesforce Ecosystem & DevOps.
          </p>
        </div>

        <div className={styles.certificatesGrid}>
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className={styles.certificateCard}
              onClick={() => setSelectedCertificate(cert)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.certIcon}>{cert.icon}</span>
                <div className={styles.issuerTag}>{cert.issuer}</div>
              </div>
              <h3 className={styles.certTitle}>{cert.title}</h3>
              <p className={styles.description}>{cert.description}</p>
              <div className={styles.cardFooter}>
                <div className={styles.metaInfo}>
                  <span className={styles.dateLabel}>Issued:</span>
                  <span className={styles.dateValue}>{cert.date}</span>
                </div>
                <button className={styles.viewBtn}>View PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Certificate Preview */}
      {selectedCertificate && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedCertificate(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <h2>{selectedCertificate.title}</h2>
                <span className={styles.modalIssuer}>{selectedCertificate.issuer} Verified</span>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedCertificate(null)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.certSidebar}>
                <div className={styles.sidebarItem}>
                  <label>Credential ID</label>
                  <span>{selectedCertificate.credentialId}</span>
                </div>
                <div className={styles.sidebarItem}>
                  <label>Issued Date</label>
                  <span>{selectedCertificate.date}</span>
                </div>
                <div className={styles.sidebarItem}>
                  <label>Status</label>
                  <span className={styles.statusBadge}>ACTIVE</span>
                </div>
                <a 
                  href={selectedCertificate.url} 
                  download 
                  className={styles.downloadLink}
                >
                  📥 Download Full PDF
                </a>
              </div>
              
              <div className={styles.pdfContainer}>
                <iframe
                  src={`${selectedCertificate.url}#toolbar=0`}
                  title={selectedCertificate.title}
                  className={styles.pdfIframe}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Certificates;

