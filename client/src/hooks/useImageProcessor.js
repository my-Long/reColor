import { useState, useCallback, useRef } from 'react';

export function useImageProcessor() {
  const [resultUrl, setResultUrl]     = useState(null);
  const [analysisColors, setAnalysis] = useState(null);
  const [isProcessing, setProcessing] = useState(false);
  const [error, setError]             = useState(null);
  const resultBlobRef                 = useRef(null);

  function setResult(blob) {
    const url = URL.createObjectURL(blob);
    setResultUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
    resultBlobRef.current = blob;
    setAnalysis(null);
  }

  const convertTheme = useCallback(async (file, target, postPairs = []) => {
    setProcessing(true); setError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('target', target);
      const res = await fetch('/api/convert', { method: 'POST', body: form });
      if (!res.ok) throw new Error((await res.json()).error);
      let blob = await res.blob();

      if (postPairs.length > 0) {
        const form2 = new FormData();
        form2.append('image', blob, 'converted.png');
        form2.append('pairs', JSON.stringify(postPairs));
        const res2 = await fetch('/api/replace', { method: 'POST', body: form2 });
        if (res2.ok) blob = await res2.blob();
      }

      setResult(blob);
    } catch (e) { setError(e.message); }
    finally { setProcessing(false); }
  }, []);

  const convertResultTheme = useCallback(async (target) => {
    if (!resultBlobRef.current) return;
    setProcessing(true); setError(null);
    try {
      const form = new FormData();
      form.append('image', resultBlobRef.current, 'result.png');
      form.append('target', target);
      const res = await fetch('/api/convert', { method: 'POST', body: form });
      if (!res.ok) throw new Error((await res.json()).error);
      setResult(await res.blob());
    } catch (e) { setError(e.message); }
    finally { setProcessing(false); }
  }, []);

  const analyzeColors = useCallback(async (file) => {
    setProcessing(true); setError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      if (!res.ok) throw new Error((await res.json()).error);
      const { colors } = await res.json();
      setResultUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
      resultBlobRef.current = null;
      setAnalysis(colors);
    } catch (e) { setError(e.message); }
    finally { setProcessing(false); }
  }, []);

  const replaceColors = useCallback(async (file, pairs) => {
    setProcessing(true); setError(null);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('pairs', JSON.stringify(pairs));
      const res = await fetch('/api/replace', { method: 'POST', body: form });
      if (!res.ok) throw new Error((await res.json()).error);
      setResult(await res.blob());
    } catch (e) { setError(e.message); }
    finally { setProcessing(false); }
  }, []);

  function reset() {
    setResultUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    resultBlobRef.current = null;
    setAnalysis(null);
    setError(null);
  }

  const replaceResultColors = useCallback(async (pairs) => {
    if (!resultBlobRef.current) return;
    setProcessing(true); setError(null);
    try {
      const form = new FormData();
      form.append('image', resultBlobRef.current, 'result.png');
      form.append('pairs', JSON.stringify(pairs));
      const res = await fetch('/api/replace', { method: 'POST', body: form });
      if (!res.ok) throw new Error((await res.json()).error);
      setResult(await res.blob());
    } catch (e) { setError(e.message); }
    finally { setProcessing(false); }
  }, []);

  return { resultUrl, analysisColors, isProcessing, error, convertTheme, convertResultTheme, analyzeColors, replaceColors, replaceResultColors, reset };
}
