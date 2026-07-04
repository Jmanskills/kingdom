/* Kingdom — shared client-side friends system (prototype only)
   Works together with kingdom-auth.js. Stores friend requests and
   friendships in localStorage, keyed by username.
   NOTE: since there's no real server yet, "friends" only works between
   accounts created in the SAME browser (e.g. two test accounts you make
   yourself). Once there's a real backend, swap this file for API calls. */

const KingdomFriends = (() => {
  const REQUESTS_KEY = 'kingdom_friend_requests'; // [{ from, to }]
  const FRIENDSHIPS_KEY = 'kingdom_friendships';   // [[userA, userB]]

  function _getUsers() {
    try {
      return JSON.parse(localStorage.getItem('kingdom_users')) || {};
    } catch {
      return {};
    }
  }

  function _getRequests() {
    try {
      return JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [];
    } catch {
      return [];
    }
  }
  function _saveRequests(reqs) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
  }

  function _getFriendships() {
    try {
      return JSON.parse(localStorage.getItem(FRIENDSHIPS_KEY)) || [];
    } catch {
      return [];
    }
  }
  function _saveFriendships(list) {
    localStorage.setItem(FRIENDSHIPS_KEY, JSON.stringify(list));
  }

  function _pairKey(a, b) {
    return [a, b].sort();
  }

  function getDisplayName(username) {
    const users = _getUsers();
    return (users[username] && users[username].displayName) || username;
  }

  function areFriends(a, b) {
    const [x, y] = _pairKey(a, b);
    return _getFriendships().some(([u1, u2]) => u1 === x && u2 === y);
  }

  function hasPendingRequest(from, to) {
    return _getRequests().some(r => r.from === from && r.to === to);
  }

  // Search all registered users by username or display name, excluding
  // yourself, existing friends, and anyone with a pending request already.
  function searchUsers(query, currentUsername) {
    query = (query || '').trim().toLowerCase();
    if (!query) return [];
    const users = _getUsers();
    return Object.keys(users)
      .filter(username => username !== currentUsername)
      .filter(username => {
        const name = users[username].displayName || username;
        return username.includes(query) || name.toLowerCase().includes(query);
      })
      .filter(username => !areFriends(currentUsername, username))
      .filter(username => !hasPendingRequest(currentUsername, username))
      .map(username => ({ username, displayName: getDisplayName(username) }));
  }

  function sendRequest(from, to) {
    if (from === to) return { ok: false, error: "You can't friend yourself." };
    if (areFriends(from, to)) return { ok: false, error: 'Already friends.' };
    if (hasPendingRequest(from, to)) return { ok: false, error: 'Request already sent.' };
    const users = _getUsers();
    if (!users[to]) return { ok: false, error: "That user doesn't exist." };

    // If the other person already requested you, auto-accept instead of duplicating
    if (hasPendingRequest(to, from)) {
      return acceptRequest(from, to);
    }

    const reqs = _getRequests();
    reqs.push({ from, to });
    _saveRequests(reqs);
    return { ok: true };
  }

  function getIncomingRequests(username) {
    return _getRequests()
      .filter(r => r.to === username)
      .map(r => ({ from: r.from, displayName: getDisplayName(r.from) }));
  }

  function getOutgoingRequests(username) {
    return _getRequests()
      .filter(r => r.from === username)
      .map(r => ({ to: r.to, displayName: getDisplayName(r.to) }));
  }

  function acceptRequest(username, fromUsername) {
    const reqs = _getRequests().filter(
      r => !(r.from === fromUsername && r.to === username)
    );
    _saveRequests(reqs);

    const friendships = _getFriendships();
    const pair = _pairKey(username, fromUsername);
    const exists = friendships.some(([a, b]) => a === pair[0] && b === pair[1]);
    if (!exists) {
      friendships.push(pair);
      _saveFriendships(friendships);
    }
    return { ok: true };
  }

  function declineRequest(username, fromUsername) {
    const reqs = _getRequests().filter(
      r => !(r.from === fromUsername && r.to === username)
    );
    _saveRequests(reqs);
    return { ok: true };
  }

  function cancelRequest(fromUsername, toUsername) {
    const reqs = _getRequests().filter(
      r => !(r.from === fromUsername && r.to === toUsername)
    );
    _saveRequests(reqs);
    return { ok: true };
  }

  function getFriends(username) {
    return _getFriendships()
      .filter(([a, b]) => a === username || b === username)
      .map(([a, b]) => (a === username ? b : a))
      .map(friendUsername => ({
        username: friendUsername,
        displayName: getDisplayName(friendUsername)
      }));
  }

  function removeFriend(username, otherUsername) {
    const pair = _pairKey(username, otherUsername);
    const friendships = _getFriendships().filter(
      ([a, b]) => !(a === pair[0] && b === pair[1])
    );
    _saveFriendships(friendships);
    return { ok: true };
  }

  return {
    searchUsers,
    sendRequest,
    getIncomingRequests,
    getOutgoingRequests,
    acceptRequest,
    declineRequest,
    cancelRequest,
    getFriends,
    removeFriend,
    areFriends,
    getDisplayName
  };
})();