import React, { useState, useEffect } from "react";

const About: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = [
    {
      src: "https://ik.imagekit.io/3ielec51e/Screenshot_79.png?updatedAt=1754764157299",
      alt: "Easy to search",
      caption: "Search Feature",
    },
    {
      src: "https://ik.imagekit.io/3ielec51e/folder.png?updatedAt=1754762918886",
      alt: "Folder Organization",
      caption: "Organize Projects",
    },
    {
      src: "https://ik.imagekit.io/3ielec51e/Screenshot_80.png?updatedAt=1754764607377",
      alt: "Easy to post",
      caption: "Post Easily",
    },
  ];

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Style logic for slider images (desktop)
  const getStyle = (index: number) => {
    const total = images.length;
    const offset = (index - activeIndex + total) % total;

    let translateX = 0;
    let scale = 1;
    let zIndex = 0;

    if (offset === 0) {
      translateX = 0;
      scale = 1.2;
      zIndex = 3;
    } else if (offset === 1) {
      translateX = 250;
      scale = 0.9;
      zIndex = 2;
    } else if (offset === total - 1) {
      translateX = -250;
      scale = 0.9;
      zIndex = 2;
    } else {
      translateX = 0;
      scale = 0.7;
      zIndex = 1;
    }

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      zIndex,
      transition: "all 0.6s ease",
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transformOrigin: "center center",
      opacity: zIndex === 1 ? 0 : 1,
    };
  };

  return (
    <div
      className="min-h-screen font-mono transition-colors duration-500 ease-in-out 
      bg-gradient-to-r from-gray-900 via-blue-900 to-blue-700 
      dark:from-gray-950 dark:via-blue-950 dark:to-blue-800 
      text-gray-100 dark:text-blue-300 px-2 sm:px-6 py-6 sm:py-10"
    >
      {/* Header */}
      <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6">
        About CodeShare
      </h1>

      {/* Description */}
      <section className="max-w-full sm:max-w-4xl mx-auto text-sm sm:text-lg leading-relaxed">
        <p className="mb-2 sm:mb-4">
          <strong>CodeShare</strong> is a platform for developers to share,
          store, and collaborate on code. Upload multiple code files, organize
          them in folders, and find files easily via a friends section. Share
          projects with all or select groups, and collaborate live. We aim to
          make coding social, secure, and organized for beginners and pros alike
          in a dynamic community.
        </p>
        <p className="mb-2 sm:mb-4">
          Whether you're a beginner learning to code or a professional developer
          building complex systems, CodeShare helps you connect, share, and grow
          with a vibrant developer community.
        </p>
      </section>

      {/* Slider - Desktop */}
      <section className="hidden sm:flex py-6 sm:py-10 px-4 my-8 sm:my-16">
        <div className="relative w-[750px] max-w-full h-[20px] overflow-visible">
          {images.map((img, i) => (
            <div
              key={i}
              style={getStyle(i)}
              className="w-[700px] -translate-x-1/2 -translate-y-1/2 shadow-lg rounded-lg bg-white/10 dark:bg-gray-900/40 backdrop-blur-md p-2"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto rounded"
              />
              {i === activeIndex && (
                <p className="text-center text-sm text-gray-200 dark:text-gray-300 mt-2">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Image Stack */}
      <section className="block sm:hidden py-6 px-4 my-8">
        <div className="space-y-4">
          {images.map((img, i) => (
            <div
              key={i}
              className="w-full max-w-[90vw] mx-auto shadow-lg rounded-lg bg-white/10 dark:bg-gray-900/40 backdrop-blur-md p-2"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-auto rounded"
              />
              <p className="text-center text-xs text-gray-200 dark:text-gray-300 mt-2">
                {img.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Placeholder Div */}
      <div className="relative w-full max-w-[100vw] h-[150px] sm:h-[300px]"></div>

      {/* Future Updates */}
      <section className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-md rounded-lg shadow-md p-4 sm:p-8 max-w-full sm:max-w-3xl mx-auto text-center mb-8 sm:mb-12 mt-10 sm:mt-20">
        <h2 className="text-lg sm:text-2xl font-semibold mb-4 sm:mb-6">
          Future Updates 🚀
        </h2>
        {/* Chat with Friends */}
        <div className="text-left mb-4 sm:mb-6">
          <h3 className="text-base sm:text-xl font-bold text-gray-100 dark:text-blue-200 mb-2">
            1. Chat with Friends
          </h3>
          <p className="text-gray-200 dark:text-gray-300 leading-relaxed text-xs sm:text-base">
            We’re working on integrating real-time chat features directly into
            CodeShare. This means you’ll be able to connect with your friends,
            teammates, or collaborators without ever leaving the platform.
          </p>
        </div>
        {/* Share Code Snippets */}
        <div className="text-left">
          <h3 className="text-base sm:text-xl font-bold text-gray-100 dark:text-blue-200 mb-2">
            2. Share Code Snippets
          </h3>
          <p className="text-gray-200 dark:text-gray-300 leading-relaxed text-xs sm:text-base">
            Alongside the chat feature, we’ll introduce the ability to share code
            snippets seamlessly within your conversations.
          </p>
        </div>
      </section>

      {/* Donation Section */}
      <section className="bg-white/10 dark:bg-gray-900/40 backdrop-blur-md rounded-lg shadow-lg p-4 sm:p-8 max-w-full sm:max-w-3xl mx-auto text-center animate-fadeIn delay-200">
        <h2 className="text-lg sm:text-2xl font-semibold mb-4">Support Our Project ❤️</h2>
        <p className="mb-4 sm:mb-6 text-xs sm:text-base text-gray-200 dark:text-gray-300">
          CodeShare is built with love and passion for the developer community.
          If you find this platform helpful, consider supporting us.
        </p>
        {/* Donate Button - Hidden on mobile, shown on sm+ */}
        <button
          onClick={() => setShowModal(true)}
          className="hidden sm:block bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
        >
          Donate Now
        </button>
        {/* QR Code - Shown on mobile */}
        <div className="block sm:hidden">
          <h3 className="text-base font-semibold mb-4 text-center">Scan to Donate</h3>
          <img
            src="https://ik.imagekit.io/3ielec51e/WhatsApp%20Image%202025-08-10%20at%2000.09.13_9a84ea8f.jpg?updatedAt=1754764808250"
            alt="Donation QR"
            className="mx-auto w-full max-w-[80vw] h-auto rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="hidden sm:flex fixed inset-0 z-50 items-center justify-center bg-black bg-opacity-60 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm mx-2 sm:mx-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 left-1/2 -translate-x-1/2 text-gray-600 dark:text-gray-300 hover:text-red-500 text-xl sm:text-2xl"
            >
              &times;
            </button>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center">
              Scan to Donate
            </h3>
            <img
              src="https://ik.imagekit.io/3ielec51e/WhatsApp%20Image%202025-08-10%20at%2000.09.13_9a84ea8f.jpg?updatedAt=1754764808250"
              alt="Donation QR"
              className="mx-auto w-full max-w-[80vw] sm:max-w-[70vw] h-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
