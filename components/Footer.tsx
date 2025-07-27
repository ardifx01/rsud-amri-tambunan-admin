import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white text-center py-4 mt-32 w-full posistion: fixed bottom-0">
      <p>&copy; {currentYear} Fans Cosa. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
