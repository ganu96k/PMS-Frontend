import React from "react";
import styles from "./SkillsModernStyles.module.css";

const SkillsModern = () => {
  const skillCategories = [
    {
      category: "Languages",
      skills: [
        { name: "Java", icon: "☕" },
        { name: "JavaScript", icon: "⚛️" },
        { name: "Python", icon: "🐍" }
      ]
    },
    {
      category: "Frontend",
      skills: [
        { name: "React", icon: "⚛️" },
        { name: "HTML/CSS", icon: "🎨" },
        { name: "Bootstrap", icon: "🅱️" }
      ]
    },
    {
      category: "Backend",
      skills: [
        { name: "Spring Boot", icon: "🍃" },
        { name: "REST APIs", icon: "🔌" },
        { name: "Microservices", icon: "🔗" }
      ]
    },
    {
      category: "Database",
      skills: [
        { name: "MySQL", icon: "🗄️" },
        { name: "MongoDB", icon: "🍃" },
        { name: "JPA/Hibernate", icon: "📊" }
      ]
    },
    {
      category: "Tools & Platforms",
      skills: [
        { name: "Git", icon: "🔀" },
        { name: "GitHub", icon: "🐙" },
        { name: "Postman", icon: "📮" },
        { name: "AWS", icon: "☁️" }
      ]
    },
    {
      category: "CRM & Cloud",
      skills: [
        { name: "Salesforce", icon: "☁️" },
        { name: "Apex", icon: "⚡" },
        { name: "AWS Services", icon: "🔷" }
      ]
    }
  ];

  return (
    <section className={styles.skillsSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Technical Skills</h2>
        <p className={styles.sectionSubtitle}>Technologies & Tools I Master</p>

        <div className={styles.skillsContainer}>
          {skillCategories.map((category, idx) => (
            <div key={idx} className={styles.categoryCard}>
              <h3 className={styles.categoryTitle}>{category.category}</h3>
              <div className={styles.skillsList}>
                {category.skills.map((skill, index) => (
                  <div key={index} className={styles.skillItem}>
                    <div className={styles.skillIcon}>{skill.icon}</div>
                    <p className={styles.skillName}>{skill.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Skills Summary */}
        <div className={styles.skillsSummary}>
          <div className={styles.summaryCard}>
            <h4>Expertise Level</h4>
            <div className={styles.progressBar}>
              <div className={styles.progress} style={{ width: "85%" }}>Advanced</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <h4>Experience</h4>
            <p>5+ Years in Full Stack Development</p>
          </div>
          <div className={styles.summaryCard}>
            <h4>Specialization</h4>
            <p>Enterprise Applications & Microservices</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillsModern;
