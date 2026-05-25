import { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Heart,
  Brain,
  Eye,
  ArrowRight,
  HelpCircle,
  Award,
  Terminal,
  Activity,
  Code2,
  Check,
  Layers,
  Compass
} from 'lucide-react';
import './AboutCodeLens.css';

export default function AboutCodeLens({ onStartCoding }) {
  const whySectionRef = useRef(null);
  
  // Interactive Simulator State
  const [simulatorStep, setSimulatorStep] = useState('buggy'); // 'buggy' | 'fixing' | 'solved'

  const scrollToWhy = () => {
    whySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    let frameId;
    const handleMouseMove = (e) => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  const handleFixCode = () => {
    setSimulatorStep('fixing');
    setTimeout(() => {
      setSimulatorStep('solved');
    }, 1000);
  };

  const handleResetSimulator = () => {
    setSimulatorStep('buggy');
  };

  return (
    <div className="about-container animate-fade-in">
      {/* Aurora Ambient Lighting Effects */}
      <div className="aurora-background">
        <div className="aurora-light aurora-violet"></div>
        <div className="aurora-light aurora-cyan"></div>
        <div className="aurora-light aurora-blue"></div>
      </div>

      {/* ---- HERO SECTION ---- */}
      <section className="about-hero glow-section">
        {/* Spotlight Glow and Interactive Particles */}
        <div className="hero-spotlight"></div>
        <div className="hero-particles">
          <div className="particle p-1"></div>
          <div className="particle p-2"></div>
          <div className="particle p-3"></div>
          <div className="particle p-4"></div>
          <div className="particle p-5"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge animate-fade-in-up">
            <Sparkles size={14} className="badge-icon" />
            <span>Human-Centered AI Coding Mentor</span>
          </div>
          
          <h1 className="hero-title animate-fade-in-up delay-1">
            Understand errors.<br />
            <span className="gradient-text">Fix code with confidence.</span>
          </h1>
          
          <p className="hero-subtitle animate-fade-in-up delay-2">
            CodeLens helps learners turn confusing syntax errors into clear, calm next steps.
          </p>

          <p className="hero-description animate-fade-in-up delay-3">
            See what went wrong, why it happened, and how to improve without feeling overwhelmed.
          </p>
          
          <div className="hero-actions animate-fade-in-up delay-4">
            <button className="primary-btn glow-btn" onClick={onStartCoding}>
              <span>Try CodeLens Now</span>
              <ArrowRight size={16} />
            </button>
            <button className="secondary-btn glow-btn" onClick={scrollToWhy}>
              <span>Discover Our Philosophy</span>
            </button>
          </div>
        </div>

        {/* Premium Interactive Workspace Mockup / Simulator */}
        <div className="hero-mockup-wrapper glow-card animate-fade-in-up delay-5">
          <div className="mockup-header-tabs">
            <div className="mockup-dot red"></div>
            <div className="mockup-dot yellow"></div>
            <div className="mockup-dot green"></div>
            <span className="mockup-title">interactive_demo.py</span>
          </div>

          <div className="mockup-grid">
            {/* Mock Editor */}
            <div className="mock-editor">
              <div className="editor-line-numbers">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
              <div className="editor-code-area">
                <div className="code-line">
                  <span className="code-keyword">def</span> <span className="code-func">calculate_average</span>(numbers)
                  {simulatorStep === 'buggy' && <span className="code-error-squiggly"></span>}
                </div>
                <div className="code-line indent">
                  total = <span className="code-num">0</span>
                </div>
                <div className="code-line indent">
                  <span className="code-keyword">for</span> num <span className="code-keyword">in</span> numbers:
                </div>
                <div className="code-line indent-2">
                  total += num
                </div>
              </div>

              <div className="editor-footer-hint">
                {simulatorStep === 'buggy' && (
                  <button className="simulator-action-btn glow-btn" onClick={handleFixCode}>
                    <Code2 size={13} />
                    <span>Run CodeLens Fix</span>
                  </button>
                )}
                {simulatorStep === 'fixing' && (
                  <button className="simulator-action-btn loading glow-btn" disabled>
                    <span className="spinner-sm"></span>
                    <span>Analyzing Syntax...</span>
                  </button>
                )}
                {simulatorStep === 'solved' && (
                  <button className="simulator-action-btn success glow-btn" onClick={handleResetSimulator}>
                    <Check size={13} />
                    <span>Code Corrected! Reset?</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mock Explanation Panel */}
            <div className="mock-explanation">
              {simulatorStep === 'buggy' && (
                <div className="mock-explanation-content">
                  <div className="mock-exp-badge warning">
                    <Activity size={12} />
                    <span>Syntax Issue Detected</span>
                  </div>
                  <h4 className="mock-exp-title">Missing Colon</h4>
                  <p className="mock-exp-text">
                    Python is looking for a colon (<code className="code-token">:</code>) at the end of line 1.
                  </p>
                  <div className="mock-exp-section">
                    <span className="mock-section-label">Analogy</span>
                    <p className="mock-section-desc">
                      Like leaving the colon out of a time stamp (writing 1030 instead of 10:30), Python needs a signal to know where the header ends and the code body begins.
                    </p>
                  </div>
                </div>
              )}

              {simulatorStep === 'fixing' && (
                <div className="mock-explanation-content center">
                  <div className="mock-loader-spinner"></div>
                  <p className="mock-loader-text">AI is explaining... zero judgment</p>
                </div>
              )}

              {simulatorStep === 'solved' && (
                <div className="mock-explanation-content success">
                  <div className="mock-exp-badge success">
                    <Check size={12} />
                    <span>Issue Resolved</span>
                  </div>
                  <h4 className="mock-exp-title">Perfect!</h4>
                  <p className="mock-exp-text">
                    You added the colon (<code className="code-token">:</code>). Python now knows that lines 2-4 belong inside your function block.
                  </p>
                  <div className="mock-exp-section success-border">
                    <span className="mock-section-label green">Learning Tip</span>
                    <p className="mock-section-desc">
                      Always double-check your function headers! In Python, <code className="code-token">def</code>, <code className="code-token">for</code>, <code className="code-token">while</code>, and <code className="code-token">if</code> statements always require a colon at the end.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---- 1. WHAT CODELENS IS ---- */}
      <section className="about-section section-statement glow-section">
        <div className="statement-card glow-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="statement-glow"></div>
          <p className="statement-label" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
            What is CodeLens?
          </p>
          <blockquote className="statement-quote" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            A calm, supportive AI pair-programmer that lives right in your editor. We translate cryptic compiler warnings into warm, educational guidance.
          </blockquote>
        </div>
      </section>

      {/* ---- 2. WHY IT HELPS BEGINNERS ---- */}
      <section ref={whySectionRef} className="about-section section-why glow-section">
        <div className="section-header-center">
          <div className="intro-badge">
            <Heart size={14} />
            <span>Beginner First</span>
          </div>
          <h2>Why It Helps Beginners</h2>
        </div>

        <div className="why-cards-grid">
          <div className="why-card glow-card primary">
            <div className="why-icon-box primary"><Brain size={20}/></div>
            <h3>Reduces Confusion</h3>
            <p>We replace dense technical jargon with everyday analogies you already understand.</p>
          </div>
          <div className="why-card glow-card success">
            <div className="why-icon-box success"><Heart size={20}/></div>
            <h3>Explains Calmly</h3>
            <p>Errors are normal. We explain what went wrong with zero judgment and maximum support.</p>
          </div>
          <div className="why-card glow-card warning">
            <div className="why-icon-box warning"><Eye size={20}/></div>
            <h3>Fix On Demand</h3>
            <p>We show the corrected code side-by-side only when you are ready to see the answer.</p>
          </div>
        </div>
      </section>

      {/* ---- 3. HOW IT IS DIFFERENT ---- */}
      <section className="about-section section-different glow-section">
        <div className="section-header-center">
          <div className="intro-badge">
            <Compass size={14} />
            <span>Platform Differences</span>
          </div>
          <h2>How It Is Different</h2>
        </div>

        <div className="story-cards-container">
          <div className="story-card glow-card">
            <div className="story-icon"><Code2 size={20} /></div>
            <div className="story-content">
              <h4>Integrated Editor</h4>
              <p>No copy-pasting. CodeLens runs directly in a professional Monaco workspace.</p>
            </div>
          </div>
          <div className="story-card glow-card">
            <div className="story-icon"><Award size={20} /></div>
            <div className="story-content">
              <h4>Beginner Safe</h4>
              <p>Optimized explicitly for learners, not for writing production code for you.</p>
            </div>
          </div>
          <div className="story-card glow-card">
            <div className="story-icon"><Sparkles size={20} /></div>
            <div className="story-content">
              <h4>NVIDIA Enhanced</h4>
              <p>Powered by advanced Llama 3 models via NVIDIA NIM for instant analysis.</p>
            </div>
          </div>
          <div className="story-card glow-card">
            <div className="story-icon"><Terminal size={20} /></div>
            <div className="story-content">
              <h4>Offline Fallback</h4>
              <p>Local pattern matching handles basic syntax errors even without an API key.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 4. HOW IT BUILDS CONFIDENCE ---- */}
      <section className="about-section section-timeline glow-section">
        <div className="section-header-center">
          <div className="intro-badge">
            <Layers size={14} />
            <span>The Workflow</span>
          </div>
          <h2>How It Builds Confidence</h2>
        </div>
        
        <div className="story-cards-container">
          <div className="story-card glow-card">
            <div className="story-icon"><HelpCircle size={20} /></div>
            <div className="story-content">
              <h4>1. Understand the Mistake</h4>
              <p>Learn exactly why the compiler failed without feeling overwhelmed.</p>
            </div>
          </div>
          <div className="story-card glow-card">
            <div className="story-icon"><Eye size={20} /></div>
            <div className="story-content">
              <h4>2. Compare the Fix</h4>
              <p>Visually see the difference between your logic and the correct syntax.</p>
            </div>
          </div>
          <div className="story-card glow-card">
            <div className="story-icon"><Check size={20} /></div>
            <div className="story-content">
              <h4>3. Try Again Without Fear</h4>
              <p>Apply your new knowledge immediately and watch your code run successfully.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- CALL TO ACTION ---- */}
      <section className="about-footer-cta animate-fade-in-up glow-section">
        <div className="cta-content">
          <h2>Ready to learn code confidently?</h2>
          <p>Open CodeLens and write code in a space designed to support you.</p>
          <button className="primary-btn cta-btn glow-btn" onClick={onStartCoding}>
            <span>Open CodeLens Workspace</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
      
      <div className="codelens-credit">
        Developed with love by Khushi Pardhi
      </div>
    </div>
  );
}
