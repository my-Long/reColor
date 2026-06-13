import { useState } from 'react';
import { Drawer, Button, Switch } from 'antd';
import { useSettingsStore } from '../store/settingsStore.js';
import styles from './SettingsModal.module.css';

const SECTIONS = [
  { id: 'toDark',  label: '转为暗色', desc: '原图 → 暗色图 完成后，自动执行以下颜色替换' },
  { id: 'toLight', label: '转为亮色', desc: '原图 → 亮色图 完成后，自动执行以下颜色替换' },
];

const emptyPair = () => ({ from: '#FFFFFF', to: '#232323', fuzz: 5, enabled: true });

export function SettingsModal({ open, onClose }) {
  const { toDark, toLight, setAll } = useSettingsStore();
  const [active, setActive] = useState('toDark');
  const [draft, setDraft]   = useState({ toDark, toLight });

  // 每次打开时用 store 最新值初始化 draft
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    if (open) setDraft({ toDark, toLight });
    setPrevOpen(open);
  }

  const pairs = draft[active];

  function update(i, key, val) {
    setDraft(d => ({ ...d, [active]: d[active].map((p, idx) => idx === i ? { ...p, [key]: val } : p) }));
  }
  function add()     { setDraft(d => ({ ...d, [active]: [emptyPair(), ...d[active]] })); }
  function remove(i) { setDraft(d => ({ ...d, [active]: d[active].filter((_, idx) => idx !== i) })); }

  function handleSave() { setAll(draft); onClose(); }

  const section = SECTIONS.find(s => s.id === active);

  return (
    <Drawer
      title="设置"
      placement="right"
      open={open}
      onClose={onClose}
      width={580}
      footer={
        <div className={styles.footer}>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleSave}>保存</Button>
        </div>
      }
      styles={{ body: { padding: 0, display: 'flex', overflow: 'hidden' } }}
    >
      <div className={styles.body}>
        <nav className={styles.nav}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`${styles.navItem} ${active === s.id ? styles.navActive : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <p className={styles.desc}>{section.desc}</p>
            <Button size="small" type="dashed" onClick={add}>+ 添加</Button>
          </div>

          <div className={styles.pairs}>
            {pairs.length === 0 && <p className={styles.empty}>暂无映射，点击右上角添加</p>}
            {pairs.map((pair, i) => (
              <div key={i} className={`${styles.row} ${!pair.enabled ? styles.rowDisabled : ''}`}>
                <div className={styles.rowTop}>
                  <Switch size="small" checked={pair.enabled} onChange={v => update(i, 'enabled', v)} />
                  <Button size="small" danger type="text" onClick={() => remove(i)}>移除</Button>
                </div>
                <div className={styles.rowMain}>
                  <div className={styles.colorPair}>
                    <ColorInput label="原色" value={pair.from} onChange={v => update(i, 'from', v)} disabled={!pair.enabled} />
                    <span className={styles.arrow}>→</span>
                    <ColorInput label="新色" value={pair.to}   onChange={v => update(i, 'to',   v)} disabled={!pair.enabled} />
                  </div>
                  <label className={styles.fuzz}>
                    <span>模糊 {pair.fuzz}%</span>
                    <input type="range" min={0} max={30} value={pair.fuzz} disabled={!pair.enabled}
                      onChange={e => update(i, 'fuzz', +e.target.value)} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function ColorInput({ label, value, onChange, disabled }) {
  return (
    <label className={styles.colorLabel}>
      <span>{label}</span>
      <div className={styles.colorInput}>
        <input type="color" value={value.length === 7 ? value : '#ffffff'} disabled={disabled}
          onChange={e => onChange(e.target.value.toUpperCase())} />
        <input type="text" value={value} maxLength={7} placeholder="#RRGGBB" disabled={disabled}
          className={styles.hexText}
          onChange={e => onChange(e.target.value.toUpperCase())} />
      </div>
    </label>
  );
}
