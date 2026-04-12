import styles from './HeroStyles.module.css';
import heroImg from '../../assets/ganeshlogodark.png';
import sun from '../../assets/sun.svg';
import moon from '../../assets/moon.svg';
import twitterLight from '../../assets/twitter-light.svg';
import twitterDark from '../../assets/twitter-dark.svg';
import githubLight from '../../assets/github-light.svg';
import githubDark from '../../assets/github-dark.svg';
import linkedinLight from '../../assets/linkedin-light.svg';
import linkedinDark from '../../assets/linkedin-dark.svg';
import CV from '../../assets/Ganesh Kale.pdf';
import { useTheme } from '../../common/ThemeContext';
import digicloudLogo from '../../assets/digicloudlogo.png';
import TransparentImage from '../../assets/TransparentImage.png';

function Hero() {
  const { theme, toggleTheme } = useTheme();

  const themeIcon = theme === 'light' ? sun : moon;
  const twitterIcon = theme === 'light' ? twitterLight : twitterDark;
  const githubIcon = theme === 'light' ? githubLight : githubDark;
  const linkedinIcon = theme === 'light' ? linkedinLight : linkedinDark;

  return (
    <section id="hero" className={styles.container}>
      <div className={styles.colorModeContainer}>
<ul
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "64px",
    margin: 0,
    padding: "0 60px",
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    gap: "32px",
    background: "linear-gradient(90deg, #1695c7ff, #9e2424ff)",
    boxShadow: "0 4px 12px rgba(0, 127, 0, 0.15)",
    zIndex: 1000,
  }}
>
  {[
    { name: "Home", link: "#hero" },
    { name: "Skills", link: "#skills" },
    { name: "News", link: "#news" },
    { name: "Projects", link: "#projects" },
  
 { name: "Gallery", link: "#gallery" },

    
  ].map((item) => (
    <li key={item.name}>
      <a
        href={item.link}
        style={{
          color: "#ffffff",
          textDecoration: "none",
          fontSize: "15px",
          fontWeight: 500,
          padding: "8px 14px",
          borderRadius: "6px",
          transition: "background 0.3s ease",
        }}
        onMouseEnter={(e) =>
          (e.target.style.background = "rgba(255,255,255,0.15)")
        }
        onMouseLeave={(e) =>
          (e.target.style.background = "transparent")
        }
      >
        {item.name}
      </a>
    </li>
  ))}
</ul>
 {/* 🔥 Marquee Added */}
      <div className={styles.marquee}>
        <span>
          🚀 Salesforce Developer &nbsp; | &nbsp; React Projects &nbsp; | &nbsp;
          CRM Solutions &nbsp; | &nbsp; Open for Opportunities 🚀
        </span>
      </div>

        <img
          src={TransparentImage}
          className={styles.hero}
          alt="Certificates"
        />
        <img
          src={heroImg}
          className={styles.hero}
          alt="Profile picture of Ganesh Kale"
        />
        <img
          className={styles.colorMode}
          src={themeIcon}
          alt="Color mode icon"
          onClick={toggleTheme}
        />
        <div className={styles.company}>
  <img
    src={digicloudLogo}
    alt="DigiCloud Solutions logo"
    className={styles.companyLogo}
  />
  <span className={styles.role}>
    Salesforce Developer @ DigiCloud Solutions
  </span>
</div>
      </div>

      

      <div className={styles.info}>
        <h1>
          <b>Ganesh   Kale</b>
        </h1>

        

        <h2>Salesforce Developer</h2>
        <span>
          <a href="https://x.com/GaneshK63030522" target="_blank">
            <img src={twitterIcon} alt="Twitter icon" />
          </a>
          <a href="https://github.com/ganu96k" target="_blank">
            <img src={githubIcon} alt="Github icon" />
          </a>
          <a href="https://www.linkedin.com/in/ganesh-kale-098433249/" target="_blank">
            <img src={linkedinIcon} alt="Linkedin icon" />
          </a>
        </span>
        <p className={styles.description}>
        Empowering businesses with scalable, smart Salesforce solutions.
        </p>

        
    <div className={styles.buttonGroup}>
  <a href={CV} download>
    <button className="hover">Resume</button>
  </a>

  <a href="/register">
    <button className="hover">Register</button>
  </a>

  <a href="/login">
    <button className="hover">Log in</button>
  </a>
</div>

      </div>
    </section>
  );
}

export default Hero;
