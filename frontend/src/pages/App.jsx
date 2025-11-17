import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Nav from '../components/Nav';
import Scores from '../components/Scores';

// -------- Shuffle Helper --------
function shuffle(arr) {
  return arr
    .map(v => ({ v, s: Math.random() }))
    .sort((a, b) => a.s - b.s)
    .map(o => o.v);
}

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

  // NEW: Page navigation (home = quiz selection, scores = score history)
  const [page, setPage] = useState("home");

  // ------------------- LOGIN -------------------
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
      setPage("home");
      loadCats(access_token);
    } catch (err) {
      setLoginError('Incorrect email or password.');
    }
  }

  // ------------------- SIGN UP -------------------
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
      setPage("home");
      loadCats(access_token);
    } catch (err) {
      setSignupError('Email is already in use.');
    }
  }

  // ------------------- CATEGORY LOADING -------------------
  async function loadCats(tok) {
    const c = await api('/quiz/categories', {
      headers: { Authorization: 'Bearer ' + tok },
    });
    setCats(c);
  }

  // ------------------- LOGOUT -------------------
  function logout() {
    localStorage.removeItem('token');
    setToken('');
    setStage('login');
    setShowSignup(false);
    setPage("home");
  }

  // ------------------- QUIZ START -------------------
  async function start() {
    const data = await api(
      `/quiz/start?category=${category}&difficulty=${difficulty}&amount=10`,
      { headers: { Authorization: 'Bearer ' + token } }
    );

    const enriched = data.items.map(q => ({
      ...q,
      options: shuffle([q.correct_answer, ...q.incorrect_answers]),
    }));

    setItems(enriched);
    setAnswers({});
    setStage('play');
  }

  function pick(i, opt) {
    setAnswers({ ...answers, [i]: opt });
  }

  // ------------------- SUBMIT QUIZ -------------------
  async function submit() {
    const correct = items.reduce(
      (acc, q, i) => acc + (answers[i] === q.correct_answer ? 1 : 0),
      0
    );

    setScore(correct);

    await api('/scores', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: JSON.stringify({
        total: items.length,
        correct,
        category: String(category),
        difficulty,
      }),
    });

    setStage('result');
  }

  // ============================================================
  // LOGIN / SIGNUP
  // ============================================================
  if (!token || stage === 'login') {
    return (
      <div style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
        <Nav showLogout={false} onNavigate={setPage} />

        <div style={{ maxWidth: 400, margin: '40px auto' }}>
          {!showSignup ? (
            <>
              <h2>Login</h2>

              <form onSubmit={login} style={{ display: 'grid', gap: 8 }}>
                <input
                  placeholder="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setLoginError('');
                  }}
                  style={{ padding: '8px', borderRadius: '4px' }}
                />

                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  style={{ padding: '8px', borderRadius: '4px' }}
                />

                {loginError && (
                  <div style={{ color: 'red', fontSize: 14 }}>{loginError}</div>
                )}

                <button
                  style={{
                    padding: '8px',
                    background: '#4A6CF7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Sign in
                </button>
              </form>

              <p style={{ marginTop: 12 }}>
                Don’t have an account?{' '}
                <span
                  style={{ color: '#4A6CF7', cursor: 'pointer' }}
                  onClick={() => {
                    setShowSignup(true);
                    setLoginError('');
                  }}
                >
                  Create one
                </span>
              </p>
            </>
          ) : (
            <>
              <h2>Create Account</h2>

              <form onSubmit={registerUser} style={{ display: 'grid', gap: 8 }}>
                <input
                  placeholder="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setSignupError('');
                  }}
                  style={{ padding: '8px', borderRadius: '4px' }}
                />

                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setSignupError('');
                  }}
                  style={{ padding: '8px', borderRadius: '4px' }}
                />

                {signupError && (
                  <div style={{ color: 'red', fontSize: 14 }}>{signupError}</div>
                )}

                <button
                  style={{
                    padding: '8px',
                    background: '#4A6CF7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Create Account
                </button>
              </form>

              <p style={{ marginTop: 12 }}>
                Already have an account?{' '}
                <span
                  style={{ color: '#4A6CF7', cursor: 'pointer' }}
                  onClick={() => {
                    setShowSignup(false);
                    setSignupError('');
                  }}
                >
                  Sign in
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // SCORES PAGE
  // ============================================================
  if (page === "scores") {
    return (
      <div style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
        <Nav
          onLogout={logout}
          showLogout={true}
          onNavigate={setPage}
        />

        <Scores token={token} />
      </div>
    );
  }

  // ============================================================
  // PICK PAGE
  // ============================================================
  if (stage === 'pick') {
    if (cats.length === 0) loadCats(token);

    return (
      <div style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
        <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />

        <div style={{ maxWidth: 700, margin: '20px auto', display: 'grid', gap: 12 }}>
          <div>
            <label>Category:&nbsp;</label>
            <select value={category} onChange={e => setCategory(Number(e.target.value))}>
              {cats.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Difficulty:&nbsp;</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button onClick={start}>Start Quiz</button>
        </div>
      </div>
    );
  }

  // ============================================================
  // PLAY PAGE
  // ============================================================
  if (stage === 'play') {
    return (
      <div style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
        <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />

        <div style={{ maxWidth: 800, margin: '20px auto', display: 'grid', gap: 16 }}>
          {items.map((q, i) => (
            <div
              key={i}
              style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}
            >
              <div style={{ fontWeight: 600 }}>
                {i + 1}. {q.question}
              </div>

              <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                {q.options.map(opt => (
                  <label
                    key={opt}
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
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

          <button onClick={submit} disabled={items.length === 0}>
            Submit
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RESULT PAGE
  // ============================================================
  return (
    <div style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
      <Nav onLogout={logout} showLogout={true} onNavigate={setPage} />

      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <h2>Result</h2>
        <p>
          You scored <strong>{score}</strong> / {items.length}
        </p>

        <button onClick={() => setStage('pick')}>Play again</button>
      </div>
    </div>
  );
}
