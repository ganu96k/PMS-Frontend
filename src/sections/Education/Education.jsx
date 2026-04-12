import React from "react";
import styles from "./EducationStyles.module.css";

const Education = () => {
  const educationData = [
    {
      id: 1,
      degree: "12th (SSC)",
      institution: "Government School",
      year: "2015",
      details: "Secondary School Certificate",
      percentage: "75%"
    },
    {
      id: 2,
      degree: "Diploma in ENTC",
      institution: "Deogiri Institute of Engineering",
      year: "2018",
      details: "Diploma in Electronics & Telecommunication",
      percentage: "78%"
    },
    {
      id: 3,
      degree: "B.Tech in ENTC",
      institution: "Deogiri Institute of Engineering",
      year: "2020",
      details: "Bachelor of Technology in Electronics & Telecommunication",
      percentage: "7.2 CGPA"
    },
    {
      id: 4,
      degree: "Post Graduate Diploma",
      institution: "CDAC (Centre for Development of Advanced Computing)",
      year: "2023",
      details: "Post Graduate Diploma in Advanced Computing",
      percentage: "85%"
    }
  ];

  return (
    <section className={styles.educationSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Education</h2>
        <p className={styles.sectionSubtitle}>My Academic Journey</p>
        
        <div className={styles.educationGrid}>
          {educationData.map((edu) => (
            <div key={edu.id} className={styles.educationCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.degree}>{edu.degree}</h3>
                <span className={styles.year}>{edu.year}</span>
              </div>
              
              <div className={styles.cardBody}>
                <p className={styles.institution}>{edu.institution}</p>
                <p className={styles.details}>{edu.details}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.percentage}>{edu.percentage}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
