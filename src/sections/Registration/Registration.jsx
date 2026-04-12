import { useState } from "react";
import styles from "./Registration.module.css";

function Registration() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    mobile: "",
    Company: "",
    enquiry: "",
    LeadSource: "Web"

  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const salesforceURL =
      "https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8";

    const formBody = new URLSearchParams({
      oid: "00DgL00000EWS7a",
      retURL: "https://ganesh-portfolio-ashen.vercel.app/",

      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      company: formData.Company,
      description: formData.enquiry,
      LeadSource: formData.LeadSource,
    });

    fetch(salesforceURL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
    });

    console.log("Registration Data:", formData);
    alert("Registration Successful!");
  };

  return (
    <section className={styles.container}>
      <h2>Registration</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="middleName"
          placeholder="Middle Name"
          value={formData.middleName}
          onChange={handleChange}
        />

        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="Company"
          placeholder="Company Name"
          value={formData.Company}
          onChange={handleChange}
          required
        />

        <textarea
          name="enquiry"
          placeholder="Enter your enquiry here..."
          value={formData.enquiry}
          onChange={handleChange}
          rows="6"
          style={{ width: "100%", padding: "10px" }}
          required
        ></textarea>

        <button type="submit">Register</button>
      </form>
    </section>
  );
}

export default Registration;
