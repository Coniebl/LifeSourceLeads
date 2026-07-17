import React, { useState, useEffect } from "react";

export function AuthSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      src: "/assets/slideshow1.png",
      alt: "Business professionals collaborating",
      title: "Empowering Secure Client Relationships and Growth with LifeLead."
    },
    {
      src: "/assets/slideshow2.png",
      alt: "Secure database and server infrastructure",
      title: "State-of-the-art security protecting your valuable client records."
    },
    {
      src: "/assets/slideshow3.png",
      alt: "Analytics dashboard monitoring leads",
      title: "Real-time client monitoring and intelligent lead analytics."
    },
    {
      src: "/assets/slideshow4.png",
      alt: "Client relationship growth meeting",
      title: "Streamline workflows and accelerate your company's potential."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hidden md:block relative md:w-[55%] lg:w-[60%] h-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
        >
          {/* Slideshow Image */}
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for modern aesthetic & readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
          
          {/* Text Overlay Card */}
          <div className="absolute bottom-16 left-12 right-12 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 transition-all duration-500">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#133020] leading-tight tracking-tight">
              {slide.title}
            </h2>
          </div>
        </div>
      ))}

      {/* Carousel Indicators (Centered at the bottom) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === activeIndex ? "bg-[#ffb347] scale-110" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
