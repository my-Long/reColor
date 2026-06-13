import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Lightbox.module.css';

export function Lightbox({ src, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <img
        src={src}
        className={styles.img}
        onClick={e => e.stopPropagation()}
        alt="预览"
      />
      <button className={styles.close} onClick={onClose}>✕</button>
    </div>,
    document.body
  );
}
