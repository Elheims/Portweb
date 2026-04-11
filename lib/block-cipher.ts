export const BLOCK_SIZE = 16;

/**
 * Konversi string Teks ke Uint8Array menggunakan UTF-8 encoding
 */
export function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Konversi Uint8Array kembali ke string Teks
 */
export function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Padding sebuah Key string menjadi tepat 16 byte.
 * Jika kurang, diulang. Jika lebih dipotong.
 */
export function padKey(keyStr: string): Uint8Array {
  const bytes = stringToBytes(keyStr);
  const key = new Uint8Array(BLOCK_SIZE);
  if (bytes.length === 0) {
    // default key if empty
    key.fill(0xAA);
    return key;
  }
  for (let i = 0; i < BLOCK_SIZE; i++) {
    key[i] = bytes[i % bytes.length];
  }
  return key;
}

/**
 * PKCS#7 Padding
 */
export function pkcs7Pad(data: Uint8Array): Uint8Array {
  const padLen = BLOCK_SIZE - (data.length % BLOCK_SIZE);
  const padded = new Uint8Array(data.length + padLen);
  padded.set(data);
  for (let i = data.length; i < padded.length; i++) {
    padded[i] = padLen;
  }
  return padded;
}

export function pkcs7Unpad(data: Uint8Array): Uint8Array {
  if (data.length === 0) return data;
  const padLen = data[data.length - 1];
  if (padLen > 0 && padLen <= BLOCK_SIZE) {
    return data.slice(0, data.length - padLen);
  }
  return data; // If invalid padding, return as is safely
}

// ==========================================
//   Electronic Codebook (ECB) Mode
// ==========================================

function encryptBlockECB(block: Uint8Array, key: Uint8Array): Uint8Array {
  // 1. Substitusi (Add & Modulo)
  const subOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    subOut[i] = (block[i] + key[i]) % 256;
  }
  
  // 2. Rotasi (Circular Shift Left array elements by 3)
  const rotOut = new Uint8Array(BLOCK_SIZE);
  const shift = 3;
  for (let i = 0; i < BLOCK_SIZE; i++) {
    rotOut[i] = subOut[(i + shift) % BLOCK_SIZE];
  }
  
  // 3. Transposisi (Swap pattern)
  // Membaca seperti kolom per kolom matriks 4x4
  const transposePattern = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
  const finalOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    finalOut[i] = rotOut[transposePattern[i]];
  }
  
  return finalOut;
}

function decryptBlockECB(block: Uint8Array, key: Uint8Array): Uint8Array {
  // 3. Undo Transposisi
  const transposePattern = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
  const rotOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    rotOut[transposePattern[i]] = block[i];
  }
  
  // 2. Undo Rotasi (Circular Shift Right by 3)
  const shift = 3;
  const subOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    // if subOut is rotated left to rotOut, then reading subOut:
    subOut[(i + shift) % BLOCK_SIZE] = rotOut[i];
  }
  
  // 1. Undo Substitusi
  const finalOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    finalOut[i] = (subOut[i] - key[i] + 256) % 256;
  }
  
  return finalOut;
}

export function encryptECB(data: Uint8Array, keyStr: string, usePadding: boolean): Uint8Array {
  const key = padKey(keyStr);
  const processData = usePadding ? pkcs7Pad(data) : data;
  const numBlocks = Math.floor(processData.length / BLOCK_SIZE);
  const finalSize = usePadding ? processData.length : processData.length;
  const out = new Uint8Array(finalSize);
  out.set(processData); // Copy initial state (useful for tailing bytes without padding)

  for (let i = 0; i < numBlocks; i++) {
    const offset = i * BLOCK_SIZE;
    const block = processData.slice(offset, offset + BLOCK_SIZE);
    const cipherBlock = encryptBlockECB(block, key);
    out.set(cipherBlock, offset);
  }
  return out;
}

export function decryptECB(data: Uint8Array, keyStr: string, usePadding: boolean): Uint8Array {
  const key = padKey(keyStr);
  const numBlocks = Math.floor(data.length / BLOCK_SIZE);
  const out = new Uint8Array(data.length);
  out.set(data); // preserve tails

  for (let i = 0; i < numBlocks; i++) {
    const offset = i * BLOCK_SIZE;
    const block = data.slice(offset, offset + BLOCK_SIZE);
    const plainBlock = decryptBlockECB(block, key);
    out.set(plainBlock, offset);
  }
  return usePadding ? pkcs7Unpad(out) : out;
}

// ==========================================
//   Cipher Block Chaining (CBC) Mode
//   XOR-sub -> Rotate-Left-5 -> Pairwise-swap+NOT
// ==========================================

function encryptBlockCBC(block: Uint8Array, key: Uint8Array): Uint8Array {
  // 1. Substitusi (XOR dengan Key)
  const subOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    subOut[i] = block[i] ^ key[i];
  }

  // 2. Rotasi (Circular Shift Left array elements by 5)
  const rotOut = new Uint8Array(BLOCK_SIZE);
  const shift = 5;
  for (let i = 0; i < BLOCK_SIZE; i++) {
    rotOut[i] = subOut[(i + shift) % BLOCK_SIZE];
  }

  // 3. Permutasi (Pairwise Swap + Bitwise NOT)
  // [0] ditukar [1] dan di Invert, [2] ditukar [3] dan Invert, dst.
  const finalOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i += 2) {
    finalOut[i]     = (~rotOut[i+1]) & 0xFF;
    finalOut[i+1]   = (~rotOut[i])   & 0xFF;
  }

  return finalOut;
}

function decryptBlockCBC(block: Uint8Array, key: Uint8Array): Uint8Array {
  // 3. Undo Permutasi (Pairwise Swap + Bitwise NOT bersifat simetris jika dipanggil kembali)
  const rotOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i += 2) {
    rotOut[i]     = (~block[i+1]) & 0xFF;
    rotOut[i+1]   = (~block[i])   & 0xFF;
  }

  // 2. Undo Rotasi (Circular Shift Right by 5)
  const shift = 5;
  const subOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    subOut[(i + shift) % BLOCK_SIZE] = rotOut[i];
  }

  // 1. Undo Substitusi (XOR juga simetris)
  const finalOut = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    finalOut[i] = subOut[i] ^ key[i];
  }
  return finalOut;
}

function xorBlocks(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    out[i] = a[i] ^ b[i];
  }
  return out;
}

export function encryptCBC(data: Uint8Array, keyStr: string, ivStr: string, usePadding: boolean): Uint8Array {
  const key = padKey(keyStr);
  const iv = padKey(ivStr); // IV uses same derivation technique as Key
  
  const processData = usePadding ? pkcs7Pad(data) : data;
  const numBlocks = Math.floor(processData.length / BLOCK_SIZE);
  const finalSize = usePadding ? processData.length : processData.length;
  const out = new Uint8Array(finalSize);
  out.set(processData);

  let prevCipherBlock = iv;

  for (let i = 0; i < numBlocks; i++) {
    const offset = i * BLOCK_SIZE;
    const block = processData.slice(offset, offset + BLOCK_SIZE);
    
    // CBC Step 1: XOR plaintext block with previous ciphertext block (or IV)
    const chainedBlock = xorBlocks(block, prevCipherBlock);
    
    // CBC Step 2: Encrypt
    const cipherBlock = encryptBlockCBC(chainedBlock, key);
    out.set(cipherBlock, offset);
    
    // Update vector for next chain
    prevCipherBlock = cipherBlock;
  }
  return out;
}

export function decryptCBC(data: Uint8Array, keyStr: string, ivStr: string, usePadding: boolean): Uint8Array {
  const key = padKey(keyStr);
  const iv = padKey(ivStr);
  
  const numBlocks = Math.floor(data.length / BLOCK_SIZE);
  const out = new Uint8Array(data.length);
  out.set(data);

  let prevCipherBlock = iv;

  for (let i = 0; i < numBlocks; i++) {
    const offset = i * BLOCK_SIZE;
    const cipherBlock = data.slice(offset, offset + BLOCK_SIZE);
    
    // CBC Step 1: Decrypt
    const decryptedBlock = decryptBlockCBC(cipherBlock, key);
    
    // CBC Step 2: XOR with previous ciphertext block (or IV)
    const plainBlock = xorBlocks(decryptedBlock, prevCipherBlock);
    out.set(plainBlock, offset);
    
    // Update vector for next chain using ORIGINAL ciphertext block before decryption
    prevCipherBlock = cipherBlock;
  }
  return usePadding ? pkcs7Unpad(out) : out;
}

// Helpers for Hex viewing
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
