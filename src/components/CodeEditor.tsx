import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useGameStore } from '../store/useGameStore';
import { saveScriptToFirebase, fetchFirebaseScripts, FirebaseScriptDoc } from '../services/firebase';
import { Code2, Cpu, CheckCircle2, Play, RefreshCw, CloudUpload, FolderOpen, GraduationCap, Maximize2, Minimize2, Globe } from 'lucide-react';
import { CommunityScriptsModal } from './CommunityScriptsModal';

export const CodeEditor: React.FC = () => {
  const {
    scriptCode,
    setScriptCode,
    powerPlantScriptCode,
    setPowerPlantScriptCode,
    robots,
    selectedRobotId,
    setSelectedRobotId,
    addLog,
    isRunning,
    toggleRunning,
    compileAndRunScript,
    setAcademyModalOpen,
    editorSizeMode,
    setEditorSizeMode,
  } = useGameStore();

  const [activeEditorTab, setActiveEditorTab] = useState<'ROBOT' | 'POWER_PLANT'>('ROBOT');

  const currentCode = activeEditorTab === 'ROBOT' ? scriptCode : powerPlantScriptCode;
  const currentSetCode = activeEditorTab === 'ROBOT' ? setScriptCode : setPowerPlantScriptCode;

  const selectedRobot = robots.find((r) => r.id === selectedRobotId);
  const editorRef = useRef<any>(null);

  // Cloud script & UI states
  const [cloudScripts, setCloudScripts] = useState<FirebaseScriptDoc[]>([]);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [scriptName, setScriptName] = useState('MineIron.cs');
  const [showScriptMenu, setShowScriptMenu] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);

  useEffect(() => {
    loadCloudScripts();
  }, []);

  const loadCloudScripts = async () => {
    try {
      const list = await fetchFirebaseScripts();
      setCloudScripts(list);
    } catch {
      setCloudScripts([]);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      currentSetCode(value);
    }
  };

  const handleCloudSave = async () => {
    setIsSavingCloud(true);
    try {
      const saved = await saveScriptToFirebase(scriptName, currentCode, selectedRobotId);
      addLog('success', `C# Script '${saved.name}' bulut deposuna kaydedildi!`);
      await loadCloudScripts();
    } catch (err: any) {
      addLog('error', `Kayıt hatası: ${err.message || err}`);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleSelectCloudScript = (script: FirebaseScriptDoc) => {
    currentSetCode(script.code);
    setScriptName(script.name);
    setShowScriptMenu(false);
    addLog('info', `C# Script '${script.name}' yüklendi.`);
  };

  return (
    <div className="editor-container">
      {/* Editor Top Bar */}
      <div className="editor-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code2 className="w-4 h-4 text-cyan-400" />
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(15,23,42,0.6)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(51,65,85,0.6)' }}>
            <button
              onClick={() => setActiveEditorTab('ROBOT')}
              style={{
                background: activeEditorTab === 'ROBOT' ? '#0284c7' : 'transparent',
                color: activeEditorTab === 'ROBOT' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '3px 10px',
                borderRadius: '5px',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--font-hud)',
                cursor: 'pointer',
              }}
            >
              ROBOT KODU
            </button>
            <button
              onClick={() => setActiveEditorTab('POWER_PLANT')}
              style={{
                background: activeEditorTab === 'POWER_PLANT' ? '#10b981' : 'transparent',
                color: activeEditorTab === 'POWER_PLANT' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '3px 10px',
                borderRadius: '5px',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--font-hud)',
                cursor: 'pointer',
              }}
            >
              SANTRAL KODU
            </button>
          </div>
          <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.4)', fontFamily: 'Fira Code, monospace' }}>
            Roslyn WASM
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginLeft: 'auto' }}>
          {/* Cyberpunk Academy & Guide Button */}
          <button
            onClick={() => setAcademyModalOpen(true)}
            className="ui-btn"
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.7rem',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(0, 242, 254, 0.25) 100%)',
              border: '1px solid rgba(0, 242, 254, 0.5)',
              color: '#00f2fe',
              fontWeight: 700,
              boxShadow: '0 0 10px rgba(0, 242, 254, 0.2)',
            }}
            title="C# Otomasyon Akademisi ve Oynanabilir Görev Rehberi"
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Akademi</span>
          </button>

          {/* Community Script Hub Button */}
          <button
            onClick={() => setIsCommunityModalOpen(true)}
            className="ui-btn"
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.7rem',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
              border: '1px solid rgba(249, 115, 22, 0.5)',
              color: '#fdba74',
              fontWeight: 700,
              boxShadow: '0 0 10px rgba(249, 115, 22, 0.2)',
            }}
            title="Topluluk Scriptlerini İncele ve Yükle"
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>Topluluk (5)</span>
          </button>

          {/* Cloud Scripts Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                loadCloudScripts();
                setShowScriptMenu(!showScriptMenu);
              }}
              className="ui-btn ui-btn-secondary"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Scriptlerim ({cloudScripts.length})</span>
            </button>

            {showScriptMenu && (
              <div style={{ position: 'absolute', right: 0, marginTop: '4px', width: '220px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.6)', zIndex: 50, padding: '6px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', padding: '4px 6px', borderBottom: '1px solid #1e293b', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Script Kütüphanesi
                </div>
                {cloudScripts.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '6px', textAlign: 'center' }}>
                    Kayıtlı script yok.
                  </div>
                ) : (
                  cloudScripts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectCloudScript(s)}
                      style={{ width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: '4px', background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}
                    >
                      <span style={{ fontFamily: 'Fira Code, monospace' }}>{s.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Robot Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#060911', padding: '2px 5px', borderRadius: '6px', border: '1px solid #1e293b', maxWidth: '160px' }}>
            <Cpu className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedRobotId}
              onChange={(e) => setSelectedRobotId(e.target.value)}
              className="ui-select"
              style={{ border: 'none', background: 'transparent', padding: '1px 2px', fontSize: '0.7rem', width: '100%', textOverflow: 'ellipsis' }}
            >
              {robots.map((r) => (
                <option key={r.id} value={r.id} style={{ background: '#0f172a', color: '#f1f5f9' }}>
                  {r.name} ({r.scriptName})
                </option>
              ))}
            </select>
          </div>

          {/* Editor Panel Size Controls (Maximize / Minimize Toggle) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(15,23,42,0.8)', padding: '2px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <button
              onClick={() => setEditorSizeMode(editorSizeMode === 'expanded' ? 'normal' : 'expanded')}
              className={`ui-btn ui-btn-icon ${editorSizeMode === 'expanded' ? 'ui-btn-cyan' : ''}`}
              style={{ padding: '0.2rem', background: editorSizeMode === 'expanded' ? 'rgba(0,242,254,0.2)' : 'transparent', border: 'none' }}
              title={editorSizeMode === 'expanded' ? 'Varsayılan Boyuta Dön' : 'Editörü Genişlet / Büyüt (Rahat Kodlama Modu)'}
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <button
              onClick={() => setEditorSizeMode('hidden')}
              className="ui-btn ui-btn-icon"
              style={{ padding: '0.2rem', background: 'transparent', border: 'none' }}
              title="Editörü Gizle / Paneli Sakla (Simülatöre Tam Ekran Ver)"
            >
              <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div style={{ flex: 1, position: 'relative', background: '#1e1e1e', overflow: 'hidden' }}>
        <Editor
          height="100%"
          defaultLanguage="csharp"
          theme="vs-dark"
          value={currentCode}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13.5,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Editor Footer Bar */}
      <div className="editor-footer-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.72rem', color: '#94a3b8' }}>
            {selectedRobot?.name} için script hazır
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={scriptName}
            onChange={(e) => setScriptName(e.target.value)}
            placeholder="Script.cs"
            className="ui-input"
            style={{ width: '110px' }}
          />

          <button
            onClick={handleCloudSave}
            disabled={isSavingCloud}
            className="ui-btn ui-btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            <CloudUpload className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isSavingCloud ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
          
          <button
            onClick={() => {
              compileAndRunScript();
              if (!isRunning) toggleRunning();
            }}
            className={`ui-btn ${isRunning ? 'ui-btn-danger' : 'ui-btn-primary'}`}
            style={{ padding: '0.35rem 0.9rem', fontSize: '0.78rem' }}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Durdur</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>C# Kodunu Çalıştır</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Community Script Hub Modal */}
      <CommunityScriptsModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        onApplyScript={(code, title) => {
          currentSetCode(code);
          setScriptName(title.split(' ')[1] || 'Community.cs');
        }}
      />
    </div>
  );
};
