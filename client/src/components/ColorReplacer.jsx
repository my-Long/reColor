import { useState } from 'react';
import styles from './Panel.module.css';
import replStyles from './ColorReplacer.module.css';

const emptyPair = () => ({ from: '#E0E0E0', to: '#FFFFFF', fuzz: 8 });

export function ColorReplacer({ file, onReplace, disabled }) {
  const [pairs, setPairs] = useState([emptyPair()]);

  function update(i, key, val) {
    setPairs(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  }

  function remove(i) { setPairs(p => p.filter((_, idx) => idx !== i)); }

  return (
    <div className={styles.panel}>
      <div className={replStyles.pairs}>
        {pairs.map((pair, i) => (
          <div key={i} className={replStyles.row}>
            <div className={replStyles.colorPair}>
              <label>
                <span>原色</span>
                <div className={replStyles.colorInput}>
                  <input type="color" value={pair.from} onChange={e => update(i, 'from', e.target.value.toUpperCase())} />
                  <input type="text" value={pair.from} onChange={e => update(i, 'from', e.target.value.toUpperCase())} className={replStyles.hexText} maxLength={7} />
                </div>
              </label>
              <span className={replStyles.arrow}>→</span>
              <label>
                <span>新色</span>
                <div className={replStyles.colorInput}>
                  <input type="color" value={pair.to} onChange={e => update(i, 'to', e.target.value.toUpperCase())} />
                  <input type="text" value={pair.to} onChange={e => update(i, 'to', e.target.value.toUpperCase())} className={replStyles.hexText} maxLength={7} />
                </div>
              </label>
            </div>
            <label className={replStyles.fuzz}>
              <span>模糊 {pair.fuzz}%</span>
              <input type="range" min={0} max={30} value={pair.fuzz} onChange={e => update(i, 'fuzz', +e.target.value)} />
            </label>
            {pairs.length > 1 && (
              <button className={replStyles.remove} onClick={() => remove(i)}>移除</button>
            )}
          </div>
        ))}
      </div>
      <div className={replStyles.actions}>
        <button className={replStyles.addBtn} onClick={() => setPairs(p => [...p, emptyPair()])}>+ 添加颜色对</button>
        <button className={styles.btn} disabled={!file || disabled} onClick={() => onReplace(pairs)}>
          开始替换
        </button>
      </div>
    </div>
  );
}
