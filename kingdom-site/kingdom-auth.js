/* Kingdom — shared client-side auth (prototype only, NOT secure)
   Stores accounts in localStorage on the visitor's own browser.
   Passwords are stored in plain text — fine for a demo, never for production.
   For a real launch, replace this whole file with calls to a real backend
   that hashes passwords and stores accounts in a real database. */

const KingdomAuth = (() => {
  const USERS_KEY = 'kingdom_users';
  const SESSION_KEY = 'kingdom_session';

  function _getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch {
      return {};
    }
  }

  function _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function signUp({ username, password, displayName, birthday }) {
    username = (username || '').trim().toLowerCase();
    if (!username || !password) {
      return { ok: false, error: 'Enter a username and password.' };
    }
    if (password.length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters.' };
    }
    const users = _getUsers();
    if (users[username]) {
      return { ok: false, error: 'That username is already taken.' };
    }
    users[username] = {
      password, // plain text — prototype only, see file header
      displayName: displayName || username,
      birthday: birthday || null,
      createdAt: new Date().toISOString()
    };
    _saveUsers(users);
    localStorage.setItem(SESSION_KEY, username);
    return { ok: true, username };
  }

  function logIn({ username, password }) {
    username = (username || '').trim().toLowerCase();
    const users = _getUsers();
    const user = users[username];
    if (!user || user.password !== password) {
      return { ok: false, error: 'Incorrect username or password.' };
    }
    localStorage.setItem(SESSION_KEY, username);
    return { ok: true, username };
  }

  function logOut() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getCurrentUser() {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return null;
    const users = _getUsers();
    const user = users[username];
    if (!user) return null;
    return { username, ...user };
  }

  // Redirects to the landing page if nobody is logged in.
  // Call this at the top of any page that should be "members only".
  function requireAuth(redirectTo) {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = redirectTo || 'kingdom-landing.html';
    }
    return user;
  }

  return { signUp, logIn, logOut, getCurrentUser, requireAuth };
})();