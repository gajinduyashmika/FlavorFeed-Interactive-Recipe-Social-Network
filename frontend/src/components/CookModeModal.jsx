import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CookModeModal = ({ isOpen, onClose, recipeTitle, instructions = [] }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const step = instructions[currentStepIdx] || { stepNumber: 1, text: '', timerMinutes: 0 };
  const totalSteps = instructions.length;

  // Reset timer whenever step changes
  useEffect(() => {
    if (step.timerMinutes && step.timerMinutes > 0) {
      setTimerSeconds(step.timerMinutes * 60);
    } else {
      setTimerSeconds(0);
    }
    setIsTimerRunning(false);
  }, [currentStepIdx, step.timerMinutes]);

  // Handle countdown interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play a subtle notification vibration / beep if available
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      // Completed all steps!
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setIsCompleted(false);
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((currentStepIdx + 1) / totalSteps) * 100;

  return (
    <div className="cook-mode-overlay">
      <div className="cook-mode-card glass-panel">
        {/* Top Header */}
        <div className="cook-mode-header flex-between">
          <div className="cook-header-title">
            <span className="cook-mode-badge">⚡ Cook Mode Active</span>
            <h2>{recipeTitle}</h2>
          </div>
          <button onClick={onClose} className="close-btn" aria-label="Close Cook Mode">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Main Content Body */}
        <div className="cook-body">
          {!isCompleted ? (
            <>
              <div className="step-indicator">
                Step {currentStepIdx + 1} of {totalSteps}
              </div>

              <div className="step-text-display">
                <p>{step.text}</p>
              </div>

              {/* Timer Box if step has timerMinutes */}
              {step.timerMinutes > 0 && (
                <div className="step-timer-box">
                  <div className="timer-display-time">
                    {formatTimer(timerSeconds)}
                  </div>
                  <div className="timer-controls">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`timer-ctrl-btn ${isTimerRunning ? 'pause' : 'play'}`}
                    >
                      {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                      <span>{isTimerRunning ? 'Pause Timer' : 'Start Timer'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(step.timerMinutes * 60);
                      }}
                      className="timer-reset-btn"
                      title="Reset Timer"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="celebration-view">
              <div className="trophy-icon">
                <Award size={64} color="var(--accent-secondary)" />
              </div>
              <h3>Bon Appétit!</h3>
              <p>You have successfully completed every step for {recipeTitle}. Plating time!</p>
              <button onClick={onClose} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                <CheckCircle size={18} />
                <span>Return to Recipe</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        {!isCompleted && (
          <div className="cook-footer flex-between">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="btn btn-secondary"
            >
              <ChevronLeft size={18} />
              <span>Previous Step</span>
            </button>

            <button onClick={handleNext} className="btn btn-primary">
              <span>{currentStepIdx === totalSteps - 1 ? 'Finish Dish 🎉' : 'Next Step'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .cook-mode-overlay {
          position: fixed;
          inset: 0;
          background: rgba(8, 10, 14, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .cook-mode-card {
          width: 100%;
          max-width: 760px;
          background: #141822;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .cook-mode-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .cook-mode-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.35rem;
        }
        .cook-header-title h2 {
          font-size: 1.35rem;
          color: #fff;
        }
        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .close-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }
        .progress-container {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          transition: width 0.3s ease;
        }
        .cook-body {
          padding: 3rem 2.5rem;
          min-height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .step-indicator {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
        }
        .step-text-display p {
          font-size: 1.45rem;
          font-family: var(--font-heading);
          font-weight: 600;
          color: #fff;
          line-height: 1.5;
          max-width: 600px;
        }
        .step-timer-box {
          margin-top: 2.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          padding: 1.25rem 2rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .timer-display-time {
          font-family: monospace;
          font-size: 2.2rem;
          font-weight: 700;
          color: var(--accent-secondary);
          letter-spacing: 0.05em;
        }
        .timer-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .timer-ctrl-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .timer-ctrl-btn.play {
          background: var(--accent-primary);
          color: #fff;
        }
        .timer-ctrl-btn.pause {
          background: #374151;
          color: #fff;
        }
        .timer-reset-btn {
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
        }
        .timer-reset-btn:hover {
          color: #fff;
        }
        .celebration-view {
          text-align: center;
        }
        .celebration-view h3 {
          font-size: 2rem;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        .celebration-view p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 480px;
        }
        .cook-footer {
          padding: 1.25rem 2rem;
          border-top: 1px solid var(--border-subtle);
          background: rgba(255, 255, 255, 0.02);
        }
      `}</style>
    </div>
  );
};
