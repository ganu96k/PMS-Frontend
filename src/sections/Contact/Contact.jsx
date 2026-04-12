import styles from './ContactStyles.module.css';

function Contact() {
  return (
    <section id="contact" className={styles.container}>
      <h1 className="sectionTitle">Contact</h1>

      {/* FORM */}
      <form
        action="https://formsubmit.co/kaleganesh3611@gmail.com"
        method="POST"
      >
        <input type="text" name="name" placeholder="Name" required />
        <input type="email" name="email" placeholder="Email" required />
        <textarea name="message" placeholder="Message" required></textarea>

        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_template" value="table" />

        <input type="submit" value="Submit" />
      </form>

      {/* DETAILS + MAP */}
      <div className={styles.contactLayout}>
        <div className={styles.contactInfo}>
          <h2>Contact Details</h2>

          <p><strong>Name:</strong> Ganesh Kale</p>
          <p className={styles.infoItem}>
  <i className="bi bi-phone-fill"></i>
  <a href="tel:9130015910">+91 9130015910</a>
</p>

          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:kaleganesh3611@gmail.com">
              kaleganesh3611@gmail.com
            </a>
          </p>
          <p>
            <strong>Work Email:</strong>{" "}
            <a href="mailto:ganesh.kale@digicloudsolns.com">
              ganesh.kale@digicloudsolns.com
            </a>
          </p>
          <p>
            <strong>Address:</strong><br />
            At Post Bidkin,<br />
            Tq Paithan,<br />
            Dist. Chhatrapati Sambhajinagar
          </p>
        </div>

        <div className={styles.mapContainer}>
          <iframe
            title="Google Map"
            src="https://www.google.com/maps?q=Bidkin,Paithan,Maharashtra&output=embed"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

export default Contact;
