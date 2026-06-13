import { Button } from 'antd';
import styles from './Panel.module.css';

export function ColorAnalyzer({ file, onAnalyze, disabled }) {
  return (
    <div className={styles.panel}>
      <p className={styles.desc}>分析图片中出现频率最高的 15 种颜色，结果显示在右侧面板。</p>
      <Button type="primary" block disabled={!file || disabled} onClick={onAnalyze}>
        开始分析
      </Button>
    </div>
  );
}
