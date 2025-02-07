import { useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';

export const useSignaturePad = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    padRef.current = new SignaturePad(canvasRef.current, {
      backgroundColor: 'rgb(255, 255, 255)'
    });

    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext('2d')?.scale(ratio, ratio);
      
      padRef.current?.clear();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const clearSignature = () => {
    padRef.current?.clear();
  };

  const getSignatureData = () => {
    if (padRef.current?.isEmpty()) return null;
    return padRef.current?.toDataURL();
  };

  return {
    signatureRef: canvasRef,
    clearSignature,
    getSignatureData,
  };
};