import { Radio, Space } from 'antd';
import styles from './Panel.module.css';

export function ThemeConverter({ value, onChange }) {
  return (
    <div className={styles.panel}>
      <p className={styles.label}>目标主题</p>
      <Radio.Group value={value} onChange={e => onChange(e.target.value)}>
        <Space>
          <Radio.Button value="dark">转为暗色</Radio.Button>
          <Radio.Button value="light">转为亮色</Radio.Button>
        </Space>
      </Radio.Group>
    </div>
  );
}
