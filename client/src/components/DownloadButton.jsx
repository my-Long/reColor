import { Button } from 'antd';
import styles from './DownloadButton.module.css';

export function DownloadButton({ url, filename = 'result.png' }) {
  if (!url) return null;
  return (
    <a href={url} download={filename} className={styles.link}>
      <Button type="primary" style={{ background: '#0f766e', borderColor: '#0f766e' }}>
        下载结果
      </Button>
    </a>
  );
}
