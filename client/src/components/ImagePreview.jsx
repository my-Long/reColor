import styles from './ImagePreview.module.css';

export function ImagePreview({ originalUrl, resultUrl, analysisColors, isProcessing }) {
  return (
    <div className={styles.grid}>
      <Panel label="原图" url={originalUrl} />
      <Panel label="结果" url={resultUrl} colors={analysisColors} processing={isProcessing} />
    </div>
  );
}

function Panel({ label, url, colors, processing }) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>{label}</div>
      <div className={styles.body}>
        {processing && <div className={styles.spinner}><span /></div>}
        {!processing && url && <img src={url} alt={label} />}
        {!processing && colors && (
          <div className={styles.colorList}>
            {colors.map(({ hex, pct }) => (
              <div key={hex} className={styles.colorRow}>
                <span className={styles.swatch} style={{ background: hex }} />
                <span className={styles.hex}>{hex}</span>
                <div className={styles.barWrap}>
                  <div className={styles.bar} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <span className={styles.pct}>{pct}%</span>
              </div>
            ))}
          </div>
        )}
        {!processing && !url && !colors && <p className={styles.empty}>待处理</p>}
      </div>
    </div>
  );
}
