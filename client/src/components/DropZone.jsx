import { useRef, useState } from 'react';
import styles from './DropZone.module.css';

export function DropZone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    onFile(file, URL.createObjectURL(file));
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div
      className={`${styles.zone} ${dragging ? styles.over : ''}`}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])} />
      <span className={styles.icon}>+</span>
      <p>拖放图片或点击上传</p>
      <p className={styles.hint}>支持 PNG / JPG / WebP</p>
    </div>
  );
}
