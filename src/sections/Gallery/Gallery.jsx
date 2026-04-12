import "./Gallery.css";


import img1 from "../../Images/img1.png";
import img2 from "../../Images/img2.png";
import img3 from "../../Images/img3.png";   
import img4 from "../../Images/img4.png";
import img5 from "../../Images/img5.png";
import img6 from "../../Images/img6.png";

function Gallery() {
  const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
     
  ];

  return (
    <section id="gallery" className="gallery-section">
      <h2 className="gallery-title">Gallery</h2>

      <div className="gallery-grid">
        {images.map((img, index) => (
          <div className="gallery-card" key={index}>
            <img src={img} alt={`Gallery ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Gallery;
