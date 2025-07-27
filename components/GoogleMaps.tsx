// components/GoogleMap.tsx

const GoogleMaps = () => {
  return (
    <div className="w-full h-[400px]">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3988.8454484419917!2d98.62704048522122!3d3.6013781948877335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sjln%20setia%20luhur%20komplek%20businnes%20center%20no.%201%20-%203!5e0!3m2!1sen!2sid!4v1742788148832!5m2!1sen!2sid"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default GoogleMaps;
