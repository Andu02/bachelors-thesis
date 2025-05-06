export function validateUsername(username) {
  return (
    typeof username === "string" &&
    username.length >= 3 &&
    username.length <= 20
  );
}

export function validatePassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 30
  );
}
