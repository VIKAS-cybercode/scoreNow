import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Carousel.css";  // Import the updated CSS file

const Carousel = () => {
  return (
    <div className="carousel-container">
      <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
        {/* Indicators */}
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="2"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="3"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="4"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="5"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="6"></button>
          <button type="button" data-bs-target="#carouselExample" data-bs-slide-to="7"></button>
        </div>

        {/* Carousel Inner */}
        <div className="carousel-inner">
          <div className="carousel-item active" data-bs-interval="2000">
            <img src="/images/slide1.jpg" className="d-block w-100" alt="Slide 1" />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img src="/images/slide2.jpg" className="d-block w-100" alt="Slide 2" />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img src="/images/slide3.jpg" className="d-block w-100" alt="Slide 3" />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img src="/images/slide4.jpg" className="d-block w-100" alt="Slide 4" />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img src="/images/slide5.jpg" className="d-block w-100" alt="Slide 5" />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img src="/images/slide6.jpg" className="d-block w-100" alt="Slide 6" />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img src="/images/slide7.jpg" className="d-block w-100" alt="Slide 7" />
          </div>
          <div className="carousel-item" data-bs-interval="2000">
            <img src="/images/slide8.webp" className="d-block w-100" alt="Slide 8" />
          </div>
        </div>

        {/* Controls */}
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
    </div>
  );
};

export default Carousel;
