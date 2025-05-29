import bcrypt from "bcrypt";

const saltRounds = 10;

export async function encrypt(text) {
  const hash = await bcrypt.hash(text, saltRounds);
  return hash;
}

export async function compare(text, hash) {
  return await bcrypt.compare(text, hash);
}
