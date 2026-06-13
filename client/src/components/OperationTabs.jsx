import styles from './OperationTabs.module.css';

const TABS = [
  { id: 'convert', label: '主题转换' },
  { id: 'analyze', label: '颜色分析' },
  { id: 'replace', label: '颜色替换' },
];

export function OperationTabs({ active, onChange }) {
  return (
    <div className={styles.tabs}>
      {TABS.map(t => (
        <button
          key={t.id}
          className={`${styles.tab} ${active === t.id ? styles.active : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
