"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

const QRCodeComponent = ({ value }: { value: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: 200,
        margin: 2,
      }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [value]);

  return <canvas ref={canvasRef} />;
};

export default QRCodeComponent;
