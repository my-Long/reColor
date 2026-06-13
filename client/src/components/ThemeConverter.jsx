import { useState } from 'react';
import { Button, Radio, Space } from 'antd';
import styles from './Panel.module.css';

export function ThemeConverter({ file, onConvert, disabled }) {
  const [target, setTarget] = useState('dark');

  return (
    <div className={styles.panel}>
      <p className={styles.label}>目标主题</p>
      <Radio.Group value={target} onChange={e => setTarget(e.target.value)}>
        <Space>
          <Radio.Button value="dark">转为暗色</Radio.Button>
          <Radio.Button value="light">转为亮色</Radio.Button>
        </Space>
      </Radio.Group>
      <Button
        type="primary"
        block
        disabled={!file || disabled}
        onClick={() => onConvert(target)}
      >
        开始转换
      </Button>
    </div>
  );
}
