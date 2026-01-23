// keys
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const SAVED_BOOKS_KEY = "savedBooksByUser";

// helpers
const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/* users
   stored as:
   {
     userId: {
       id,
       username,
       email,
       password,   // mock only
       createdAt
     }
   }
*/

export const getUsers = () => read(USERS_KEY, {});

export const saveUsers = (users) => write(USERS_KEY, users);

export const findUserByLogin = (login) => {
  const users = getUsers();
  return Object.values(users).find(
    (user) => user.username === login || user.email === login,
  );
};

export const createUser = ({ username, email, password }) => {
  const users = getUsers();

  const id = crypto.randomUUID();

  users[id] = {
    id,
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  saveUsers(users);
  return users[id];
};

// session

export const getCurrentUser = () => read(CURRENT_USER_KEY, null);

export const setCurrentUser = (user) => write(CURRENT_USER_KEY, user);

export const clearCurrentUser = () => localStorage.removeItem(CURRENT_USER_KEY);

/* books
   stored as:
   {
     userId: [ { book }, { book } ]
   }
*/

export const getSavedBooksByUser = () => read(SAVED_BOOKS_KEY, {});

export const getSavedBooksForUser = (userId) => {
  const all = getSavedBooksByUser();
  return all[userId] || [];
};

export const saveBooksForUser = (userId, books) => {
  const all = getSavedBooksByUser();
  all[userId] = books;
  write(SAVED_BOOKS_KEY, all);
};

export const clearBooksForUser = (userId) => {
  const all = getSavedBooksByUser();
  delete all[userId];
  write(SAVED_BOOKS_KEY, all);
};
