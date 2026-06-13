import { useState, useEffect } from 'react';
import { Button, ConfigProvider, theme } from 'antd';
import { SyncOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { DropZone }       from './components/DropZone.jsx';
import { ThemeConverter } from './components/ThemeConverter.jsx';
import { ReplaceModal }   from './components/ReplaceModal.jsx';
import { SettingsModal }  from './components/SettingsModal.jsx';
import { DownloadButton } from './components/DownloadButton.jsx';
import { Lightbox }       from './components/Lightbox.jsx';
import { useImageProcessor }  from './hooks/useImageProcessor.js';
import { useSettingsStore }   from './store/settingsStore.js';
import styles from './App.module.css';

export default function App() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl,  setOriginalUrl]  = useState(null);
  const [replaceOpen,       setReplaceOpen]       = useState(false);
  const [resultReplaceOpen, setResultReplaceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightbox,     setLightbox]     = useState(null);
  const [target,       setTarget]       = useState('dark');
  const [lastTarget,   setLastTarget]   = useState(null);
  const { toDark, toLight, uiTheme, setUiTheme } = useSettingsStore();

  const { resultUrl, isProcessing, error, convertTheme, replaceColors, replaceResultColors, reset } = useImageProcessor();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', uiTheme);
  }, [uiTheme]);

  function handleFile(file, url) {
    setOriginalUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
    setOriginalFile(file);
  }

  function handleReset() {
    setOriginalUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setOriginalFile(null);
    setReplaceOpen(false);
    setLightbox(null);
    reset();
  }

  async function handleReplace(pairs) {
    await replaceColors(originalFile, pairs);
    setReplaceOpen(false);
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: uiTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      }}
    >
      <div className={styles.app}>
        <header className={styles.header}>
          <div>
            <h1>reColor</h1>
            <p>博客图片主题转换工具</p>
          </div>
          <div className={styles.headerActions}>
            <Button
              icon={uiTheme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              title={uiTheme === 'dark' ? '切换到白天模式' : '切换到黑夜模式'}
              onClick={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')}
            />
            <Button onClick={() => setSettingsOpen(true)}>设置</Button>
            <Button danger disabled={!originalFile} onClick={handleReset}>重置</Button>
          </div>
        </header>

        <main className={styles.columns}>
          {/* 左列：原图 */}
          <div className={styles.col}>
            <div className={styles.imageArea}>
              {originalUrl
                ? <img src={originalUrl} alt="原图" className={styles.clickable} onClick={() => setLightbox(originalUrl)} />
                : <DropZone onFile={handleFile} />
              }
            </div>

            <div className={styles.controls}>
              <div className={styles.selectorRow}>
                <ThemeConverter value={target} onChange={setTarget} />
                {originalUrl && (
                  <Button onClick={() => document.getElementById('reupload').click()}>
                    重新上传
                    <input id="reupload" type="file" accept="image/*" hidden onChange={e => {
                      const f = e.target.files[0];
                      if (f) handleFile(f, URL.createObjectURL(f));
                      e.target.value = '';
                    }} />
                  </Button>
                )}
              </div>
              <div className={styles.btnRow}>
               
                <Button
                  style={{ flex: 1 }}
                  disabled={!originalFile || isProcessing}
                  onClick={() => setReplaceOpen(true)}
                >
                  颜色替换
                </Button>
                 <Button
                  type="primary"
                  style={{ flex: 1 }}
                  disabled={!originalFile || isProcessing}
                  onClick={() => { setLastTarget(target); convertTheme(originalFile, target, (target === 'dark' ? toDark : toLight).filter(p => p.enabled)); }}
                >
                  开始转换
                </Button>
              </div>
            </div>
          </div>

          {/* 右列：结果图 */}
          <div className={styles.col}>
            <div className={styles.imageArea}>
              {isProcessing && <div className={styles.spinner}><span /></div>}
              {!isProcessing && resultUrl && <img src={resultUrl} alt="结果" className={styles.clickable} onClick={() => setLightbox(resultUrl)} />}
              {!isProcessing && !resultUrl && <p className={styles.empty}>处理结果将在此显示</p>}
            </div>

            <div className={styles.controls}>
              {error && <p className={styles.error}>{error}</p>}
              <div className={styles.btnRow}>
                <Button
                  icon={<SyncOutlined />}
                  disabled={!resultUrl || isProcessing || !lastTarget}
                  onClick={() => replaceResultColors((lastTarget === 'dark' ? toDark : toLight).filter(p => p.enabled))}
                  title="重新应用设置配色"
                />
                <Button
                  disabled={!resultUrl || isProcessing}
                  onClick={() => setResultReplaceOpen(true)}
                >
                  颜色替换
                </Button>
              </div>
              <DownloadButton url={resultUrl} filename={originalFile ? `recolor-${originalFile.name}` : 'result.png'} />
              {!resultUrl && !error && <p className={styles.hint}>完成处理后可在此操作</p>}
            </div>
          </div>
        </main>

        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />

        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

        {replaceOpen && (
          <ReplaceModal
            file={originalFile}
            onReplace={handleReplace}
            onClose={() => setReplaceOpen(false)}
            disabled={isProcessing}
          />
        )}

        {resultReplaceOpen && (
          <ReplaceModal
            file={resultUrl}
            onReplace={async pairs => { await replaceResultColors(pairs); setResultReplaceOpen(false); }}
            onClose={() => setResultReplaceOpen(false)}
            disabled={isProcessing}
          />
        )}
      </div>
    </ConfigProvider>
  );
}
