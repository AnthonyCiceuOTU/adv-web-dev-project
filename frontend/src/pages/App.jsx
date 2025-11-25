import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import Nav from '../components/Nav';
import Scores from '../components/Scores';

// -------- Shuffle Helper --------
function shuffle(arr) {
  return arr
    .map((v) => ({ v, s: Math.random() }))
    .sort((a, b) => a.s - b.s)
    .map((o) => o.v);
}

// -------- Shared Styles --------
const appShellStyle = {
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, #e0f2fe 0, #eef2ff 40%, #f9fafb 100%)',
  padding: '18px 12px 32px',
};
const pageWrapperStyle = { maxWidth: 960, margin: '0 auto' };
const authCardWrapperStyle = { maxWidth: 420, margin: '40px auto' };
const cardStyle = {
  background: 'white',
  borderRadius: 18,
  padding: '22px 22px 24px',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
  border: '1px solid rgba(148, 163, 184, 0.22)',
};
const headingStyle = { margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a' };
const subheadingStyle = { margin: '4px 0 16px', fontSize: 13, color: '#6b7280' };
const fieldLabelStyle = { fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 4 };
const inputStyle = { padding: '9px 11px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, outline: 'none' };
const primaryButtonStyle = {
  marginTop: 8,
  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
  color: '#ffffff',
  border: 'none',
  padding: '9px 16px',
  borderRadius: 999,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  boxShadow: '0 10px 24px rgba(79, 70, 229, 0.4)',
};
const secondaryButtonStyle = { background: 'transparent', border: 'none', padding: 0, margin: 0, color: '#4f46e5', fontWeight: 600, cursor: 'pointer' };
const errorStyle = { marginTop: 8, marginBottom: 4, fontSize: 13, color: '#b91c1c' };
const successStyle = { marginTop: 8, marginBottom: 4, fontSize: 13, color: '#15803d' };
const sectionTitleStyle = { margin: '0 0 12px', fontSize: 20, fontWeight: 700, color: '#111827' };

// -------- Google Login Component --------
function GoogleLogin({ onLogin, token }) {
  const divRef = useRef(null);

  useEffect(() => {
    if (!window.google || token) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: (res) => {
        onLogin(res.credential);
      },
    });

    window.google.accounts.id.renderButton(divRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
    });
  }, [token, onLogin]);

  return <div ref={divRef}></div>;
}

// -------- Main App --------
export default function App() {
  // ------------------- STATE -------------------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [showSignup, setShowSignup] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [cats, setCats] = useState([]);
  const [category, setCategory] = useState(9);
  const [difficulty, setDifficulty] = useState('easy');
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [stage, setStage] = useState(token ? 'pick' : 'login');
  const [score, setScore] = useState(0);
  const [page, setPage] = useState('home');
  const [questionCount, setQuestionCount] = useState(10);

  // Profile / settings state
  const [profile, setProfile] = useState(null);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileEmailInput, setProfileEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [emailError, setEmailError] = useState('');

  // ------------------- EFFECTS -------------------
  useEffect(() => {
    if (!token) {
      setProfile(null);
      return;
    }
    loadCats(token);
    loadProfile(token);
  }, [token]);

  // ------------------- API CALLS -------------------
  async function login(e) {
    e.preventDefault();
    setLoginError('');
    if (!email.trim() || !password.trim()) {
      setLoginError('Email and password cannot be empty.');
      return;
    }
    try {
      const { access_token } = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setStage('pick');
      setPage('home');
      setPassword('');
    } catch {
      setLoginError('Incorrect email or password.');
    }
  }

  async function registerUser(e) {
    e.preventDefault();
    setSignupError('');
    if (!email.trim() || !password.trim()) {
      setSignupError('Email and password cannot be empty.');
      return;
    }
    try {
      const { access_token } = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setStage('pick');
      setPage('home');
      setPassword('');
    } catch {
      setSignupError('Email is already in use.');
    }
  }

  async function handleGoogleLogin(credential) {
  try {
    const { access_token } = await api('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: credential }),
    });
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setStage('pick');
    setPage('home');
  } catch (err) {
    console.error('Google login failed', err);
    setLoginError('Google login failed.');
  }
}

  async function loadCats(tok) {
    try {
      const c = await api('/quiz/categories', { headers: { Authorization: 'Bearer ' + tok } });
      setCats(c);
    } catch {
      setCats([]);
    }
  }

  async function loadProfile(tok) {
    try {
      const me = await api('/auth/me', { headers: { Authorization: 'Bearer ' + tok } });
      setProfile(me);
      setProfileNameInput(me.name || '');
      setProfileEmailInput(me.email || '');
    } catch {
      setProfile(null);
      setProfileNameInput('');
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken('');
    setStage('login');
    setShowSignup(false);
    setPage('home');
    setProfile(null);
    setProfileNameInput('');
  }

  // Quiz actions
  async function start() {
    const data = await api(
      `/quiz/start?category=${category}&difficulty=${difficulty}&amount=${questionCount}`,
      { headers: { Authorization: 'Bearer ' + token } },
    );

    const enriched = data.items.map((q) => ({
      ...q,
      options: shuffle([q.correct_answer, ...q.incorrect_answers]),
    }));
    setItems(enriched);
    setAnswers({});
    setStage('play');
  }

  function pick(idx, opt) {
    setAnswers((prev) => ({ ...prev, [idx]: opt }));
  }

  async function submit() {
    const correct = items.reduce((acc, q, i) => acc + (answers[i] === q.correct_answer ? 1 : 0), 0);
    setScore(correct);
    await api('/scores', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({ total: items.length, correct, category: String(category), difficulty }),
    });
    setStage('result');
  }

  // Settings actions
  async function handleSaveName(e) {
    e.preventDefault();
    setProfileStatus('');
    setProfileError('');
    try {
      const updated = await api('/auth/me', {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({ name: profileNameInput }),
      });
      setProfile(updated);
      setProfileStatus('Display name updated.');
    } catch {
      setProfileError('Could not update name.');
    }
  }

  async function handleSaveEmail(e) {
    e.preventDefault();
    setEmailStatus('');
    setEmailError('');
    try {
      const updated = await api('/auth/me', {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token },
        body: JSON.stringify({ email: profileEmailInput }),
      });
      setProfile(updated);
      setEmailStatus('Email updated.');
    } catch {
      setEmailError('Could not update email.');
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Delete your account and all scores? This cannot be undone.')) return;
    try {
      await api('/auth/me', { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      logout();
    } catch {
      setProfileError('Could not delete account.');
    }
  }

  // ------------------- RENDER -------------------

  // LOGIN / SIGNUP
  if (!token || stage === 'login') {
    return (
      <div style={appShellStyle}>
        <Nav showLogout={false} onNavigate={setPage} />
        <div style={authCardWrapperStyle}>
          <div style={cardStyle}>
            <h1 style={headingStyle}>QuizMaster</h1>
            <p style={subheadingStyle}>Log in or create an account to save your trivia scores.</p>

            {!showSignup ? (
              <>
                <h2 style={sectionTitleStyle}>Sign in</h2>
                {loginError && <div style={errorStyle}>{loginError}</div>}

                <form onSubmit={login} style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label style={fieldLabelStyle}>Email</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setLoginError(''); }} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label style={fieldLabelStyle}>Password</label>
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(''); }} style={inputStyle} />
                  </div>
                  <button type="submit" style={primaryButtonStyle}>Sign in</button>
                </form>

                <div style={{ marginTop: 12 }}>
                  <GoogleLogin onLogin={handleGoogleLogin} token={token} />
                </div>

                <p style={{ marginTop: 16, fontSize: 13 }}>
                  Need an account?{' '}
                  <button type="button" style={secondaryButtonStyle} onClick={() => { setShowSignup(true); setSignupError(''); }}>
                    Create one
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 style={sectionTitleStyle}>Create account</h2>
                {signupError && <div style={errorStyle}>{signupError}</div>}
                <form onSubmit={registerUser} style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label style={fieldLabelStyle}>Email</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setSignupError(''); }} style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <label style={fieldLabelStyle}>Password</label>
                    <input type="password" placeholder="Choose a password" value={password} onChange={(e) => { setPassword(e.target.value); setSignupError(''); }} style={inputStyle} />
                  </div>
                  <button type="submit" style={primaryButtonStyle}>Create account</button>
                </form>

                <p style={{ marginTop: 16, fontSize: 13 }}>
                  Already have an account?{' '}
                  <button type="button" style={secondaryButtonStyle} onClick={() => { setShowSignup(false); setSignupError(''); }}>
                    Sign in
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }


  // ============================================================
  // SCORES PAGE
  // ============================================================
  if (page === 'scores') {
    return (
      <div style={appShellStyle}>
        <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />
        <div style={pageWrapperStyle}>
          <Scores token={token} />
        </div>
      </div>
    );
  }

// ============================================================
// SETTINGS PAGE
// ============================================================
if (page === 'settings') {
  return (
    <div style={appShellStyle}>
      <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />

      <div style={pageWrapperStyle}>
        <div style={{ ...cardStyle, marginTop: 32, maxWidth: 640 }}>
          <h2 style={sectionTitleStyle}>Account settings</h2>
          <p style={subheadingStyle}>
            Update your display name, email, or delete your account.
          </p>

          {!profile ? (
            <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>
              Loading your profile...
            </p>
          ) : (
            <>
              {/* Email Section */}
              <div style={{ marginTop: 16 }}>
                <form
                  onSubmit={handleSaveEmail}
                  style={{ display: "grid", gap: 8 }}
                >
                  <label style={fieldLabelStyle}>Email</label>
                  <input
                    type="email"
                    value={profileEmailInput}
                    onChange={(e) => {
                      setProfileEmailInput(e.target.value);
                      setEmailStatus("");
                      setEmailError("");
                    }}
                    style={inputStyle}
                  />

                  {emailError && <div style={errorStyle}>{emailError}</div>}
                  {emailStatus && <div style={successStyle}>{emailStatus}</div>}

                  <button type="submit" style={primaryButtonStyle}>
                    Save email
                  </button>
                </form>
              </div>

              <hr
                style={{
                  margin: "20px 0",
                  border: 0,
                  borderTop: "1px solid #e5e7eb",
                }}
              />

              {/* Display name section */}
              <div style={{ marginTop: 4 }}>
                <form
                  onSubmit={handleSaveName}
                  style={{ display: "grid", gap: 8 }}
                >
                  <label style={fieldLabelStyle}>Display name</label>
                  <input
                    type="text"
                    placeholder="How should we greet you?"
                    value={profileNameInput}
                    onChange={(e) => {
                      setProfileNameInput(e.target.value);
                      setProfileStatus("");
                      setProfileError("");
                    }}
                    style={inputStyle}
                  />

                  {profileError && (
                    <div style={errorStyle}>{profileError}</div>
                  )}
                  {profileStatus && (
                    <div style={successStyle}>{profileStatus}</div>
                  )}

                  <button type="submit" style={primaryButtonStyle}>
                    Save display name
                  </button>
                </form>
              </div>

              <hr
                style={{
                  margin: "20px 0",
                  border: 0,
                  borderTop: "1px solid #e5e7eb",
                }}
              />

              {/* Danger zone */}
              <div style={{ marginTop: 4 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#b91c1c",
                    marginBottom: 6,
                  }}
                >
                  Danger zone
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    margin: 0,
                    marginBottom: 10,
                  }}
                >
                  Deleting your account will remove your login and all stored
                  quiz scores. This cannot be undone.
                </p>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  style={{
                    ...primaryButtonStyle,
                    background:
                      "linear-gradient(135deg, #ef4444, #dc2626)",
                    boxShadow: "0 10px 24px rgba(239, 68, 68, 0.45)",
                  }}
                >
                  Delete account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

  // ============================================================
  // PICK PAGE
  // ============================================================
  if (stage === 'pick') {
    if (cats.length === 0 && token) {
      loadCats(token);
    }

    return (
      <div style={appShellStyle}>
        <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />

        <div style={pageWrapperStyle}>
          <div style={{ ...cardStyle, marginTop: 32, maxWidth: 640 }}>
            <h2 style={sectionTitleStyle}>Start a new quiz</h2>
            <p style={subheadingStyle}>
              Choose a category, difficulty and number of questions.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginTop: 12,
              }}
            >
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={fieldLabelStyle}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(Number(e.target.value))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                <label style={fieldLabelStyle}>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                <label style={fieldLabelStyle}>Number of questions</label>
                <input
                  type="range"
                  min={5}
                  max={20}
                  step={5}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {questionCount} questions
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={start}
              style={{ ...primaryButtonStyle, marginTop: 20 }}
            >
              Start quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PLAY PAGE
  // ============================================================
  if (stage === 'play') {
    return (
      <div style={appShellStyle}>
        <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />

        <div style={pageWrapperStyle}>
          <div style={{ ...cardStyle, marginTop: 32 }}>
            <h2 style={sectionTitleStyle}>Answer the questions</h2>
            <p style={subheadingStyle}>
              Tap an option for each question, then submit to see your score.
            </p>

            <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
              {items.map((q, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    padding: '12px 12px 10px',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 8,
                      color: '#111827',
                    }}
                  >
                    {i + 1}. {q.question}
                  </div>

                  <div style={{ display: 'grid', gap: 6 }}>
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 14,
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={'q' + i}
                          checked={answers[i] === opt}
                          onChange={() => pick(i, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={items.length === 0}
              style={{
                ...primaryButtonStyle,
                marginTop: 20,
                opacity: items.length === 0 ? 0.6 : 1,
                cursor: items.length === 0 ? 'default' : 'pointer',
              }}
            >
              Submit answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RESULT PAGE
  // ============================================================
  return (
    <div style={appShellStyle}>
      <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />

      <div style={pageWrapperStyle}>
        <div style={{ ...cardStyle, marginTop: 48, textAlign: 'center' }}>
          <h2 style={sectionTitleStyle}>Result</h2>
          <p style={{ fontSize: 16, marginBottom: 4 }}>
            You scored{' '}
            <span style={{ fontWeight: 800 }}>
              {score} / {items.length}
            </span>
          </p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            Category:{' '}
            <strong>
              {cats.find((c) => String(c.id) === String(category))?.name ||
                category}
            </strong>{' '}
            · Difficulty: <strong>{difficulty}</strong>
          </p>

          <button
            type="button"
            onClick={() => {
              setStage('pick');
            }}
            style={primaryButtonStyle}
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
