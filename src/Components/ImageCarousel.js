import React from "react";
import Slider from "react-slick";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageCarousel = () => {
  const settings = {
    dots: true, // Shows dots below the carousel
    infinite: true, // Loops through the images
    speed: 1000, // Transition speed
    slidesToShow: 1, // Number of slides visible at once
    slidesToScroll: 1, // Number of slides to scroll at once
    autoplay: true, // Automatically scrolls through the images
    autoplaySpeed: 3000, // Speed of autoplay in milliseconds
  };

  const images = [
    '/Images/InvoiceManagement.jpg',
    // '/Images/1_OnDqrUzPWIRTERjN4OHGhg.png',
    // '/Images/INTERSOFT-NEWS-ARTICLES_V001-04-1024x576.webp',
    '/Images/Inventory-Management.jpg',   
    '/Images/Invoice-Approval.jpg',
    '/Images/Vendor_management-1-768x385.jpg'
    
    // Add more image URLs here
  ];

  return (
    <div className="new-carousel-container">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="new-courosel-image">
            {/* Access images from public folder */}
            <img src={process.env.PUBLIC_URL + `${image}`} alt={`Slide ${index}`} style={{ width: "100%" }} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageCarousel;
