import React, { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { TUTORIAL_STEPS } from './constants/tutorialSteps';
import { Header } from './components/Header';
import { CanvasGrid } from './components/CanvasGrid';
import { CodeEditor } from './components/CodeEditor';
import { InventoryPanel } from './components/InventoryPanel';
import { TutorialModal } from './components/TutorialModal';
import { ApiReferencePanel } from './components/ApiReferencePanel';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ScriptMarketplaceModal } from './components/ScriptMarketplaceModal';
import { WelcomePortalModal } from './components/WelcomePortalModal';

import { subscribeToAuth, syncUserToFirestore } from './services/firebaseService';

import { Code2, Maximize2 } from 'lucide-react';

export const App: React.FC = () => {
  const {
    isRunning,
    tickRate,
    stepTick,
    isApiModalOpen,
    setApiModalOpen,
    isAcademyModalOpen,
    setAcademyModalOpen,
    isLeaderboardOpen,
    setLeaderboardOpen,
    isMarketplaceOpen,
    setMarketplaceOpen,
    isWelcomeOpen,
    setWelcomeOpen,
    editorSizeMode,
    setEditorSizeMode,
    scriptCode,
    setScriptCode,
    language,
    addLog,
  } = useGameStore();

  // Central Game Loop Tick Controller
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isRunning) {
      intervalId = setInterval(() => {
        stepTick();
      }, tickRate);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, tickRate, stepTick]);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      if (user) {
        const name = user.displayName || user.email?.split('@')[0] || 'Mühendis';
        localStorage.setItem('syntax_factory_user_id', user.uid);
        localStorage.setItem('syntax_factory_user_name', name);

        // Fetch role from Firestore
        const role = await syncUserToFirestore(user);

        useGameStore.setState({
          authUser: user,
          userRole: role,
          isAnonymousPlayer: false,
          userDisplayName: name,
          isWelcomeOpen: false,
        });
        addLog('success', `[OTURUM HESABI]: Oturum doğrulandı (${role.toUpperCase()}): ${name}.`);

        // Load personal Cloud Save State & scripts from Firestore
        await useGameStore.getState().loadGameStateFromCloud(user.uid);
      } else {
        useGameStore.setState({
          authUser: null,
          userRole: 'user',
        });
      }
    });

    return () => unsubscribe();
  }, [addLog]);

  const handleInsertSnippet = (snippet: string) => {
    if (scriptCode.includes('Execute(')) {
      const updated = scriptCode.replace(
        /(public void Execute\([^)]*\)\s*\{)/,
        `$1\n        ${snippet}`
      );
      setScriptCode(updated);
    } else {
      setScriptCode(`${scriptCode}\n${snippet}`);
    }
    addLog('info', `'${snippet}' kodu C# editörüne eklendi.`);
  };

  const {
    isTutorialModeActive,
    tutorialStepIndex,
    tutorialCompleted,
    startTutorialStage,
    exitTutorialMode,
  } = useGameStore();

  const activeTutorialStep = TUTORIAL_STEPS[tutorialStepIndex];
  const isStepCompleted = tutorialCompleted.includes(activeTutorialStep?.id || 0);

  return (
    <div className="app-layout">
      {/* Top Header & Simulation Telemetry */}
      <Header />

      {/* Main Split Layout with Dynamic Editor Sizing */}
      <main
        className="main-content"
        style={{
          gridTemplateColumns:
            editorSizeMode === 'expanded'
              ? '0.35fr 1.65fr'
              : editorSizeMode === 'hidden'
              ? '1fr'
              : '1fr 1fr',
          transition: 'grid-template-columns 0.3s ease-in-out',
        }}
      >
        {/* Left Side: 2D Grid Canvas Engine & Inventory/Logs */}
        <section className="left-pane">
          {/* Tutorial Stage Active Banner */}
          {isTutorialModeActive && activeTutorialStep && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                border: '1px solid #00f2fe',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '0.85rem' }}>
                    {activeTutorialStep.title} (Özel Harita)
                  </span>
                  {isStepCompleted ? (
                    <span style={{ fontSize: '0.68rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.2)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.4)', fontWeight: 800 }}>
                      [✓ GÖREV TAMAMLANDI]
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.2)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.4)', fontWeight: 700 }}>
                      [! GÖREV BEKLENİYOR]
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                  Hedef: {activeTutorialStep.targetObjectiveText}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isStepCompleted && activeTutorialStep.id < TUTORIAL_STEPS.length && (
                  <button
                    onClick={() => startTutorialStage(activeTutorialStep.id + 1)}
                    className="ui-btn ui-btn-primary"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.72rem', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
                  >
                    <span>Sonraki Bölüme Geç (Bölüm {activeTutorialStep.id + 1})</span>
                  </button>
                )}

                <button
                  onClick={exitTutorialMode}
                  className="ui-btn ui-btn-secondary"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
                >
                  <span>Serbest Moda Dön</span>
                </button>
              </div>
            </div>
          )}

          <div className="canvas-container">
            <div className="canvas-header">
              <span className="canvas-title">
                {isTutorialModeActive ? `EĞİTİM HARİTASI: BÖLÜM ${activeTutorialStep?.id}` : '2D GRID SIMULATOR (20x20)'}
              </span>
              {isTutorialModeActive && (
                <span className="text-xs text-slate-400">
                  Görevi başarmak için sağ taraftaki C# kodunu düzenleyip Çalıştırın
                </span>
              )}
            </div>
            <CanvasGrid />
          </div>

          <div className="panel-wrapper">
            <InventoryPanel />
          </div>
        </section>

        {/* Right Side: C# Monaco Code Editor (Shown if not hidden) */}
        {editorSizeMode !== 'hidden' && (
          <section className="right-pane">
            <CodeEditor />
          </section>
        )}
      </main>

      {/* Floating Restore Editor Button (Shown when hidden) */}
      {editorSizeMode === 'hidden' && (
        <button
          onClick={() => setEditorSizeMode('normal')}
          className="ui-btn"
          style={{
            position: 'fixed',
            top: '70px',
            right: '24px',
            zIndex: 40,
            background: '#0f172a',
            border: '1px solid #334155',
            boxShadow: 'none',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            color: '#38bdf8',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(8px)',
          }}
          title={language === 'en' ? 'Show C# Code Editor' : 'C# Kod Editörünü Göster'}
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>{language === 'en' ? 'SHOW C# EDITOR' : 'C# EDİTÖRÜNÜ GÖSTER'}</span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}

      {/* Global C# Robot API Reference Modal */}
      <ApiReferencePanel
        isOpen={isApiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onInsertSnippet={handleInsertSnippet}
      />

      {/* Global C# Automation Academy & Guide Modal */}
      <TutorialModal
        isOpen={isAcademyModalOpen}
        onClose={() => setAcademyModalOpen(false)}
      />

      {/* Phase 10 Welcome Portal Modal */}
      <WelcomePortalModal
        isOpen={isWelcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onOpenLeaderboard={() => setLeaderboardOpen(true)}
        onOpenMarketplace={() => setMarketplaceOpen(true)}
        onOpenTutorial={() => setAcademyModalOpen(true)}
      />

      {/* Phase 10 Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />

      {/* Phase 10 Community C# Script Marketplace Modal */}
      <ScriptMarketplaceModal
        isOpen={isMarketplaceOpen}
        onClose={() => setMarketplaceOpen(false)}
      />
    </div>
  );
};

export default App;
