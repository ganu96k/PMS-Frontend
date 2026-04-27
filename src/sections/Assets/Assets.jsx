import { useState } from "react";
import styles from "./AssetsStyles.module.css";

function Assets() {
  const [expandedId, setExpandedId] = useState(null);

  const assets = [
    {
      id: 1,
      title: "Salesforce to Zoho eSign",
      description: "Integration solution for document signing workflow",
      category: "Integration",
      technologies: ["Salesforce", "Zoho", "API", "eSign", "Automation"],
      logo: "salesforce-zoho",
      details: {
        overview:
          "A comprehensive integration solution that connects Salesforce CRM with Zoho Sign for automated document signing workflows.",
        workflow: [
          "1. Document created in Salesforce (Custom Object)",
          "2. API trigger initiates signing request to Zoho",
          "3. Recipient receives signing link via email",
          "4. Document signed in Zoho Sign portal",
          "5. Signed document returned to Salesforce",
          "6. Workflow updates contract status automatically",
        ],
        keyFeatures: [
          "Real-time document sync between platforms",
          "Automated email notifications",
          "Signature verification and validation",
          "Audit trail logging",
          "Multi-level approval workflow",
          "Template-based signing process",
        ],
        benefits:
          "Eliminates manual document handling, reduces contract cycle time by 70%, ensures compliance, and provides complete audit trail.",
        techStack:
          "Salesforce (Apex, Flow), Zoho Sign API, REST APIs, Node.js backend",
      },
    },
    {
      id: 2,
      title: "Upload Excel Logic in Salesforce",
      description: "Excel batch import automation for data management",
      category: "Data Management",
      technologies: ["Salesforce", "Excel", "Data Import", "Apex", "Batch"],
      logo: "excel-salesforce",
      details: {
        overview:
          "Intelligent Excel upload system that validates and imports bulk data into Salesforce with error handling and rollback capabilities.",
        workflow: [
          "1. User uploads Excel file from Salesforce UI",
          "2. File validation engine checks format and data types",
          "3. Data mapping engine aligns columns to Salesforce objects",
          "4. Batch processing validates business rules",
          "5. Duplicate detection prevents data pollution",
          "6. Data inserted into Salesforce with transaction rollback on error",
          "7. Import report with success/failure details",
        ],
        keyFeatures: [
          "Support for multiple sheets in single Excel file",
          "Column mapping with drag-and-drop interface",
          "Real-time validation with error highlighting",
          "Duplicate detection using fuzzy matching",
          "Transaction rollback on validation failure",
          "Import history and audit trail",
          "Support for related object imports",
        ],
        benefits:
          "Reduces manual data entry time by 90%, prevents data quality issues, enables batch operations for up to 10,000 records, provides error recovery.",
        techStack:
          "Salesforce (Apex, LWC), Excel.js, JavaScript, Batch Apex, Queueable",
      },
    },
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSvgLogo = (logoType) => {
    if (logoType === "salesforce-zoho") {
      return (
        <svg viewBox="0 0 100 100" className={styles.logo}>
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#00A1DF", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#005BA1", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Salesforce cloud */}
          <circle cx="35" cy="50" r="20" fill="url(#grad1)" />
          {/* Zoho document */}
          <rect x="55" y="30" width="25" height="35" rx="2" fill="#1F73E6" />
          <line x1="60" y1="40" x2="75" y2="40" stroke="#fff" strokeWidth="2" />
          <line x1="60" y1="50" x2="75" y2="50" stroke="#fff" strokeWidth="2" />
          <line x1="60" y1="60" x2="75" y2="60" stroke="#fff" strokeWidth="2" />
          {/* Connection arrow */}
          <path
            d="M 55 50 L 45 50"
            stroke="#27AE60"
            strokeWidth="3"
            fill="none"
            markerEnd="url(#arrowgreen)"
          />
          <defs>
            <marker
              id="arrowgreen"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <polygon points="0,0 10,5 0,10" fill="#27AE60" />
            </marker>
          </defs>
        </svg>
      );
    } else if (logoType === "excel-salesforce") {
      return (
        <svg viewBox="0 0 100 100" className={styles.logo}>
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#217346", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#0F5132", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          {/* Excel spreadsheet */}
          <rect x="15" y="25" width="35" height="40" rx="2" fill="url(#grad2)" />
          <line x1="22" y1="35" x2="43" y2="35" stroke="#fff" strokeWidth="1.5" />
          <line x1="22" y1="45" x2="43" y2="45" stroke="#fff" strokeWidth="1.5" />
          <line x1="22" y1="55" x2="43" y2="55" stroke="#fff" strokeWidth="1.5" />
          <line x1="28" y1="25" x2="28" y2="65" stroke="#fff" strokeWidth="1.5" />
          <line x1="37" y1="25" x2="37" y2="65" stroke="#fff" strokeWidth="1.5" />
          {/* Salesforce cloud */}
          <circle cx="70" cy="45" r="16" fill="#00A1DF" />
          <circle cx="65" cy="42" r="3" fill="#fff" />
          <circle cx="75" cy="42" r="3" fill="#fff" />
          <circle cx="70" cy="50" r="3" fill="#fff" />
          {/* Upload arrow */}
          <path
            d="M 52 45 L 62 45"
            stroke="#F39C12"
            strokeWidth="3"
            fill="none"
            markerEnd="url(#arrowyellow)"
          />
          <path d="M 62 40 L 62 50" stroke="#F39C12" strokeWidth="3" />
          <defs>
            <marker
              id="arrowyellow"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <polygon points="0,0 10,5 0,10" fill="#F39C12" />
            </marker>
          </defs>
        </svg>
      );
    }
  };

  return (
    <section className={styles.assetsSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Assets & Solutions</h2>
        <p className={styles.subtitle}>
          Integration and automation solutions for business process optimization
        </p>

        <div className={styles.assetsGrid}>
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={`${styles.assetCard} ${
                expandedId === asset.id ? styles.expanded : ""
              }`}
              onClick={() => toggleExpand(asset.id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.logoWrapper}>
                  {getSvgLogo(asset.logo)}
                </div>
                <div className={styles.titleSection}>
                  <h3 className={styles.assetTitle}>{asset.title}</h3>
                  <p className={styles.assetCategory}>{asset.category}</p>
                </div>
                <div className={styles.expandIcon}>
                  <span>{expandedId === asset.id ? "−" : "+"}</span>
                </div>
              </div>

              <p className={styles.description}>{asset.description}</p>

              <div className={styles.technologies}>
                {asset.technologies.map((tech, idx) => (
                  <span key={idx} className={styles.techBadge}>
                    {tech}
                  </span>
                ))}
              </div>

              {expandedId === asset.id && (
                <div className={styles.detailsContent}>
                  <div className={styles.detailSection}>
                    <h4>Overview</h4>
                    <p>{asset.details.overview}</p>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Workflow & Flow</h4>
                    <ol className={styles.workflowList}>
                      {asset.details.workflow.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Key Features</h4>
                    <ul className={styles.featuresList}>
                      {asset.details.keyFeatures.map((feature, idx) => (
                        <li key={idx}>
                          <span className={styles.checkmark}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Benefits</h4>
                    <p className={styles.benefitsText}>
                      {asset.details.benefits}
                    </p>
                  </div>

                  <div className={styles.detailSection}>
                    <h4>Technology Stack</h4>
                    <p className={styles.techStackText}>
                      {asset.details.techStack}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Assets;
