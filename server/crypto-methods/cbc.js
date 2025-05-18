// server/crypto-methods/cbc.js
import crypto from "crypto";
import { getKeyBuffer } from "../utils/utils.js";

export function encrypt(text, keyHex) {
  const key = getKeyBuffer(keyHex);
  const blockSize = 16;

  const buf = Buffer.from(text, "utf8");
  const padLen = blockSize - (buf.length % blockSize || blockSize);
  const padding = Buffer.alloc(padLen, padLen);
  const input = Buffer.concat([buf, padding]);

  let prev = key.slice(0, blockSize);
  const out = [];

  for (let off = 0; off < input.length; off += blockSize) {
    const block = input.slice(off, off + blockSize);

    const xored = Buffer.alloc(blockSize);
    for (let i = 0; i < blockSize; i++) {
      xored[i] = block[i] ^ prev[i];
    }

    const cipher = crypto.createCipheriv("aes-128-ecb", key, null);
    cipher.setAutoPadding(false);
    const enc = Buffer.concat([cipher.update(xored), cipher.final()]);

    out.push(enc);
    prev = enc;
  }

  return Buffer.concat(out).toString("hex");
}

export function decrypt(cipherHex, keyHex) {
  const key = getKeyBuffer(keyHex);
  const blockSize = 16;
  const data = Buffer.from(cipherHex, "hex");

  let prev = key.slice(0, blockSize);
  const blocks = [];

  for (let off = 0; off < data.length; off += blockSize) {
    const block = data.slice(off, off + blockSize);

    const decipher = crypto.createDecipheriv("aes-128-ecb", key, null);
    decipher.setAutoPadding(false);
    const xored = Buffer.concat([decipher.update(block), decipher.final()]);

    const plainBlock = Buffer.alloc(blockSize);
    for (let i = 0; i < blockSize; i++) {
      plainBlock[i] = xored[i] ^ prev[i];
    }

    blocks.push(plainBlock);
    prev = block;
  }

  const padded = Buffer.concat(blocks);
  const padLen = padded[padded.length - 1];
  const plain = padded.slice(0, padded.length - padLen);

  return plain.toString("utf8");
}
