import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'antd';
import styles from './ReplaceModal.module.css';

const emptyPair = () => ({ from: '#E0E0E0', to: '#FFFFFF', fuzz: 8 });

export function ReplaceModal({ file, onReplace, onClose, disabled }) {
  const [pairs, setPairs] = useState([emptyPair()]);

  function update(i, key, val) {
    setPairs(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }
  function remove(i) { setPairs(p => p.filter((_, idx) => idx !== i)); }

  return createPortal(
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span>颜色替换</span>
          <Button type="text" size="small" onClick={onClose}>✕</Button>
        </div>

        <div className={styles.body}>
          {pairs.map((pair, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.colorPair}>
                <ColorInput label="原色" value={pair.from} onChange={v => update(i, 'from', v)} />
                <span className={styles.arrow}>→</span>
                <ColorInput label="新色" value={pair.to}   onChange={v => update(i, 'to',   v)} />
              </div>
              <label className={styles.fuzz}>
                <span>模糊容差 {pair.fuzz}%</span>
                <input type="range" min={0} max={30} value={pair.fuzz}
                  onChange={e => update(i, 'fuzz', +e.target.value)} />
              </label>
              {pairs.length > 1 && (
                <Button size="small" danger type="text" onClick={() => remove(i)}>移除</Button>
              )}
            </div>
          ))}
          <Button block type="dashed" onClick={() => setPairs(p => [...p, emptyPair()])}>
            + 添加颜色对
          </Button>
        </div>

        <div className={styles.footer}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" disabled={!file || disabled} onClick={() => onReplace(pairs)}>
            {disabled ? '处理中…' : '开始替换'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <label className={styles.colorLabel}>
      <span>{label}</span>
      <div className={styles.colorInput}>
        <input type="color" value={value.length === 7 ? value : '#E0E0E0'}
          onChange={e => onChange(e.target.value.toUpperCase())} />
        <input type="text" value={value} maxLength={7} placeholder="#RRGGBB"
          className={styles.hexText}
          onChange={e => onChange(e.target.value.toUpperCase())} />
      </div>
    </label>
  );
}
