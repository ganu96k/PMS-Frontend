import styles from './ProjectsStyles.module.css';
import fitLift from '../../assets/fitlift.png';
import ProjectCard from '../../common/ProjectCard';
import Lincon from    '../../assets/lincon-logo.png'; 
import SKF from  '../../assets/skf-logo-black.png';
import Tapas from '../../assets/Tapas_Logo.png';

function Projects() {
  return (
    <section id="projects" className={styles.container}>
      <h1 className="sectionTitle">Projects</h1>
      <div className={styles.projectsContainer}>

        <ProjectCard
          src={Lincon}
          link="  " 
          h3="Lincon Poly"
          p="Sales cloud platforme  " 
        
        />

         <ProjectCard
          src={Tapas}
          link="  " 
          h3="Tapas Elder Care"
          p="Salesforce Plateforme " 
        
        />


        <ProjectCard
          src={SKF}
          link="  " 
          h3="SKF S2M "
          h5="(Magnetic Bearing Unit)"
          p="Sales cloud " 
        
        />



        <ProjectCard
          src={fitLift}
          link="https://github.com/Ade-mir/company-landing-page-2"
          h3="FitLift"
          p="Fitness App"
        />
      </div>
    </section>
  );
}

export default Projects;
