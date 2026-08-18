import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { TUTORIAL_STEPS, TutorialStep } from '../constants/tutorialSteps';
import { GraduationCap, Code2, CheckCircle2, ArrowRight, ArrowLeft, X, Sparkles, Target, AlertCircle } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const { startTutorialStage, tutorialStepIndex, setTutorialStepIndex, tutorialCompleted } = useGameStore();

  if (!isOpen) return null;

  const activeStep: TutorialStep = TUTORIAL_STEPS[tutorialStepIndex];
  const isCurrentStepCompleted = tutorialCompleted.includes(activeStep.id);

  const handleStartPlayableStage = () => {
    startTutorialStage(activeStep.id);
    onClose();
  };

  const handleNext = () => {
    if (tutorialStepIndex < TUTORIAL_STEPS.length - 1) {
      setTutorialStepIndex(tutorialStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (tutorialStepIndex > 0) {
      setTutorialStepIndex(tutorialStepIndex - 1);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="sku-card"
        style={{
          background: '#090e17',
          border: '1px solid #00f2fe',
          boxShadow: '0 20px 50px -10px rgba(0, 242, 254, 0.25)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#00f2fe', padding: '6px', borderRadius: '8px', color: '#090e17' }}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ fontWeight: 800, color: '#f1f5f9', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>C# OTOMASYON AKADEMİSİ</span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Oynanabilir Görevler
                </span>
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Komutları simülatörde bizzat çalıştırarak canlı hedefleri tamamlayın
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#070b14', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              İlerleme Durumu: Seviye {activeStep.id} / {TUTORIAL_STEPS.length}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'Fira Code, monospace' }}>
              %{Math.round((tutorialCompleted.length / TUTORIAL_STEPS.length) * 100)} Tamamlandı
            </span>
          </div>
          <div style={{ height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(tutorialCompleted.length / TUTORIAL_STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg, #00f2fe 0%, #a855f7 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '0.5rem 1.25rem', background: '#090e17', overflowX: 'auto', borderBottom: '1px solid #1e293b' }}>
          {TUTORIAL_STEPS.map((step, idx) => {
            const isCurrent = idx === tutorialStepIndex;
            const isDone = tutorialCompleted.includes(step.id);

            return (
              <button
                key={step.id}
                onClick={() => setTutorialStepIndex(idx)}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: isCurrent ? '1px solid #00f2fe' : '1px solid #1e293b',
                  background: isCurrent ? 'rgba(0, 242, 254, 0.15)' : '#070b14',
                  color: isCurrent ? '#00f2fe' : isDone ? '#34d399' : '#94a3b8',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <span>{step.id}.</span>}
                <span>Bölüm {step.id}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content Scrollable */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Active Step Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f1f5f9' }}>{activeStep.title}</h4>
              {isCurrentStepCompleted && (
                <span style={{ fontSize: '0.68rem', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Görev Tamamlandı</span>
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>{activeStep.subtitle}</p>
          </div>

          {/* Real-time Objective Verification Card */}
          <div
            style={{
              background: isCurrentStepCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.08)',
              border: isCurrentStepCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isCurrentStepCompleted ? '#34d399' : '#38bdf8', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target className="w-3.5 h-3.5" />
              <span>Canlı Oynanabilir Görev Teyidi:</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: '1.4', fontWeight: 600 }}>
              {activeStep.targetObjectiveText}
            </p>

            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: isCurrentStepCompleted ? '#34d399' : '#94a3b8' }}>
              {isCurrentStepCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span style={{ fontWeight: 700 }}>Tebrikler! Simülasyonda hedeflenen görevi başardınız. Sonraki seviyeye geçebilirsiniz.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Kodu editöre yükleyip Simülasyonu Çalıştır butonuna basarak görevi doğrulayın.</span>
                </>
              )}
            </div>
          </div>

          {/* Concepts Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>Öğrenilen API Komutları:</span>
            <code style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.72rem', color: '#facc15', background: 'rgba(250, 204, 21, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
              {activeStep.conceptsText}
            </code>
          </div>

          {/* Code Preview & Load Action Button */}
          <div style={{ background: '#04070d', border: '1px solid #1e293b', borderRadius: '8px', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Bu Seviye İçin Hazır C# Kodu:</span>
              </span>

              <button
                onClick={handleStartPlayableStage}
                className="ui-btn ui-btn-primary"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Özel Bölüm Haritasını Yükle ve Oyna</span>
              </button>
            </div>

            <pre
              style={{
                fontFamily: 'Fira Code, monospace',
                fontSize: '0.72rem',
                color: '#34d399',
                background: '#070b14',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #1e293b',
                maxHeight: '180px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}
            >
              {activeStep.starterCode}
            </pre>
          </div>
        </div>

        {/* Footer Controls */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#070b14', borderTop: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handlePrev}
            disabled={tutorialStepIndex === 0}
            className="ui-btn ui-btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', opacity: tutorialStepIndex === 0 ? 0.4 : 1 }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Önceki Seviye</span>
          </button>

          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {activeStep.id === TUTORIAL_STEPS.length && isCurrentStepCompleted
              ? 'Tüm Seviyeler Tamamlandı! +$1,000 Ödül Kazandınız.'
              : 'Görevi başardıkça sonraki seviyeler açılır.'}
          </span>

          <button
            onClick={handleNext}
            disabled={tutorialStepIndex === TUTORIAL_STEPS.length - 1}
            className="ui-btn ui-btn-cyan"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', opacity: tutorialStepIndex === TUTORIAL_STEPS.length - 1 ? 0.4 : 1 }}
          >
            <span>Sonraki Seviye</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
