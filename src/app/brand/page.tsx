'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeft } from 'lucide-react';

export default function BrandPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxedRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Load and render SVG to canvas for PNG export
    const loadLogo = async (svgUrl: string, canvas: HTMLCanvasElement, size: number) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        setReady(true);
      };
      img.src = svgUrl;
    };

    if (canvasRef.current) {
      loadLogo('/lark-logo.svg', canvasRef.current, 512);
    }
    if (canvasBoxedRef.current) {
      loadLogo('/lark-logo-boxed.svg', canvasBoxedRef.current, 512);
    }
  }, []);

  const downloadPNG = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-8">
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <h1 className="font-serif text-4xl text-stone-900 mb-4">Lark Brand Assets</h1>
        <p className="text-stone-500 mb-12">Download logo files in PNG format (512x512)</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Logo on white */}
          <div className="border border-stone-200 rounded-2xl p-8">
            <div className="aspect-square bg-stone-50 rounded-xl flex items-center justify-center mb-6 p-8">
              <canvas ref={canvasRef} className="max-w-full max-h-full" style={{ width: 200, height: 200 }} />
            </div>
            <h3 className="font-medium text-stone-900 mb-2">Logo (Dark on Light)</h3>
            <p className="text-sm text-stone-500 mb-4">Bird with root, dark color</p>
            <button
              onClick={() => downloadPNG(canvasRef.current, 'lark-logo.png')}
              disabled={!ready}
              className="flex items-center gap-2 w-full justify-center py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              <Download size={18} />
              Download PNG
            </button>
          </div>

          {/* Logo boxed */}
          <div className="border border-stone-200 rounded-2xl p-8">
            <div className="aspect-square bg-stone-50 rounded-xl flex items-center justify-center mb-6 p-8">
              <canvas ref={canvasBoxedRef} className="max-w-full max-h-full" style={{ width: 200, height: 200 }} />
            </div>
            <h3 className="font-medium text-stone-900 mb-2">Logo (Boxed)</h3>
            <p className="text-sm text-stone-500 mb-4">Bird with root in dark box</p>
            <button
              onClick={() => downloadPNG(canvasBoxedRef.current, 'lark-logo-boxed.png')}
              disabled={!ready}
              className="flex items-center gap-2 w-full justify-center py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              <Download size={18} />
              Download PNG
            </button>
          </div>
        </div>

        {/* SVG Downloads */}
        <div className="mt-12 p-6 bg-stone-50 rounded-2xl">
          <h3 className="font-medium text-stone-900 mb-4">SVG Files (Vector)</h3>
          <div className="flex gap-4">
            <a
              href="/lark-logo.svg"
              download="lark-logo.svg"
              className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-sm hover:border-stone-300 transition-colors"
            >
              <Download size={16} />
              lark-logo.svg
            </a>
            <a
              href="/lark-logo-boxed.svg"
              download="lark-logo-boxed.svg"
              className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-sm hover:border-stone-300 transition-colors"
            >
              <Download size={16} />
              lark-logo-boxed.svg
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
