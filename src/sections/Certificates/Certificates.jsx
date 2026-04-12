import React, { useState } from "react";
import styles from "./CertificatesStyles.module.css";

const Certificates = () => {
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const certificates = [
    {
      id: 1,
      title: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      url: "E:\\Ganesh_Document\\Certificates\\AWS_Certificate.pdf",
      description: "Associate level certification"
    },
    {
      id: 2,
      title: "Spring Boot Microservices",
      issuer: "Udemy",
      date: "2022",
      url: "E:\\Ganesh_Document\\Certificates\\SpringBoot_Certificate.pdf",
      description: "Advanced Spring Boot Development"
    },
    {
      id: 3,
      title: "Java Development Expert",
      issuer: "Oracle",
      date: "2021",
      url: "E:\\Ganesh_Document\\Certificates\\Java_Certificate.pdf",
      description: "Professional Java Certification"
    },
    {
      id: 4,
      title: "React Advanced",
      issuer: "LinkedIn Learning",
      date: "2023",
      url: "E:\\Ganesh_Document\\Certificates\\React_Certificate.pdf",
      description: "Advanced React Development"
    },
    {
      id: 5,
      title: "Salesforce Developer",
      issuer: "Salesforce",
      date: "2022",
      url: "E:\\Ganesh_Document\\Certificates\\Salesforce_Certificate.pdf",
      description: "Apex and Salesforce Certification"
    }
  ];

  const handleDownload = (url, title) => {
    // In a real application, you would download the PDF from the server
    alert(`Downloading: ${title}\nPath: ${url}`);
  };

  return (
    <section className={styles.certificatesSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Certifications & Achievements</h2>
        <p className={styles.sectionSubtitle}>Industry-Recognized Credentials</p>

        <div className={styles.certificatesGrid}>
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className={styles.certificateCard}
              onClick={() => setSelectedCertificate(cert)}
            >
              <div className={styles.cardIcon}>🏆</div>
              <h3 className={styles.certTitle}>{cert.title}</h3>
              <p className={styles.issuer}>{cert.issuer}</p>
              <p className={styles.description}>{cert.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.date}>{cert.date}</span>
                <button
                  className={styles.viewBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(cert.url, cert.title);
                  }}
                >
                  Download
                </button>
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
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{selectedCertificate.title}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedCertificate(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                <strong>Issuer:</strong> {selectedCertificate.issuer}
              </p>
              <p>
                <strong>Date:</strong> {selectedCertificate.date}
              </p>
              <p>
                <strong>Path:</strong> {selectedCertificate.url}
              </p>
              <p className={styles.pdfPreviewNote}>
                PDF Preview: Your PDF file will be displayed here
              </p>
              <div className={styles.pdfPlaceholder}>
                <p>📄 PDF Preview</p>
                <p className={styles.smallText}>
                  In production, integrate with a PDF viewer library like
                  react-pdf
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.downloadBtn}
                onClick={() => {
                  handleDownload(
                    selectedCertificate.url,
                    selectedCertificate.title
                  );
                  setSelectedCertificate(null);
                }}
              >
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Certificates;
