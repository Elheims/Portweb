BLOCK_SIZE = 16


# ─────────────────────────────────────────────
#  Utility Helpers
# ─────────────────────────────────────────────

def pad_key(key_str: str) -> bytes:
    """
    pad_key fungsi untuk memastikan bahwa kunci yang digunakan
    memiliki panjang 16 byte, menambah kekurangan byte
    dengan mengulang karakter sevara cycle.
    """
    raw = key_str.encode("utf-8")
    if len(raw) == 0:
        return bytes([0xAA] * BLOCK_SIZE)
    return bytes(raw[i % len(raw)] for i in range(BLOCK_SIZE))


def block_pad(data: bytes) -> bytes:
    """
    block padding:
    Menambahkan padding blok: tambahkan N byte dengan nilai N,
    selalu menambahkan walau udah pas
    """
    pad_len = BLOCK_SIZE - (len(data) % BLOCK_SIZE)
    return data + bytes([pad_len] * pad_len)


def block_unpad(data: bytes) -> bytes:
    """
    Menghapus padding: baca byte terakhir untuk mendapatkan panjang padding,
    validasi bahwa panjangnya 1-16, lalu hapus padding.
    """
    if not data:
        return data
    pad_len = data[-1]
    if 0 < pad_len <= BLOCK_SIZE:
        return data[:-pad_len]
    return data


def bytes_to_hex(data: bytes) -> str:
    return data.hex().upper()


def hex_to_bytes(hex_str: str) -> bytes:
    #Membersihkan dan mengubah hex menjadi byte
    clean = "".join(c for c in hex_str if c in "0123456789abcdefABCDEF")
    return bytes.fromhex(clean)


def xor_blocks(a: bytes, b: bytes) -> bytes:
    """Operasi XOR antara dua blok byte, menghasilkan blok baru dengan XOR byte-per-byte."""
    return bytes(x ^ y for x, y in zip(a, b))


# ─────────────────────────────────────────────
#  ECB - Electronic Codebook
#  Substitution -> Rotation -> Transposition
# ─────────────────────────────────────────────

TRANSPOSE_PATTERN = [0, 4, 8, 12, 
                     1, 5, 9, 13, 
                     2, 6, 10, 14, 
                     3, 7, 11, 15] # matriks 4x4 sebelumnya [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

def _encrypt_block_ecb(block: bytes, key: bytes) -> bytes:
    block = bytearray(block)
    key   = bytearray(key)

    # Step 1 - Substitution: byte + key_byte (mod 256)
    sub = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        sub[i] = (block[i] + key[i]) % 256

    # Step 2 - Rotasi: Geser ke kiri secara sirkular sebanyak 3 posisi
    shift = 3
    rot = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        rot[i] = sub[(i + shift) % BLOCK_SIZE]

    # Step 3 - Transposition: memmetakan byte ke posisi baru berdasarkan transpose pattern (matrix 4x4)
    out = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        out[i] = rot[TRANSPOSE_PATTERN[i]]

    return bytes(out)


def _decrypt_block_ecb(block: bytes, key: bytes) -> bytes:
    block = bytearray(block)
    key   = bytearray(key)

    # Undo Step 3 - Membalikkan transposisi: tempatkan byte kembali ke posisi aslinya berdasarkan pola matrix transpose
    rot = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        rot[TRANSPOSE_PATTERN[i]] = block[i]

    # Undo Step 2 - Geser ke kanan secara sirkular sebanyak 3 posisi
    shift = 3
    sub = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        sub[(i + shift) % BLOCK_SIZE] = rot[i]

    # Undo Step 1 - Membalikkan substitusi: byte - key_byte (mod 256)
    out = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        out[i] = (sub[i] - key[i] + 256) % 256

    return bytes(out)


def encrypt_ecb(data: bytes, key_str: str, use_padding: bool) -> bytes:
    key = pad_key(key_str)
    process_data = block_pad(data) if use_padding else data
    num_blocks = len(process_data) // BLOCK_SIZE

    out = bytearray(process_data)
    for i in range(num_blocks):
        offset = i * BLOCK_SIZE
        block       = process_data[offset : offset + BLOCK_SIZE]
        cipher_block = _encrypt_block_ecb(block, key)
        out[offset : offset + BLOCK_SIZE] = cipher_block

    return bytes(out)


def decrypt_ecb(data: bytes, key_str: str, use_padding: bool) -> bytes:
    key = pad_key(key_str)
    num_blocks = len(data) // BLOCK_SIZE

    out = bytearray(data)
    for i in range(num_blocks):
        offset = i * BLOCK_SIZE
        block       = data[offset : offset + BLOCK_SIZE]
        plain_block = _decrypt_block_ecb(block, key)
        out[offset : offset + BLOCK_SIZE] = plain_block

    result = bytes(out)
    return block_unpad(result) if use_padding else result


# ─────────────────────────────────────────────
#  CBC - Cipher Block Chaining Mode
#  XOR-sub -> Rotate-Left-5 -> Pairwise-swap+NOT
# ─────────────────────────────────────────────

def _encrypt_block_cbc(block: bytes, key: bytes) -> bytes:
    block = bytearray(block)
    key   = bytearray(key)

    # Step 1 - Substitution: XOR dengan key
    sub = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        sub[i] = block[i] ^ key[i]

    # Step 2 - Rotasi: geser ke kiri secara sirkular sebanyak 5 posisi
    shift = 5
    rot = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        rot[i] = sub[(i + shift) % BLOCK_SIZE]

    # Step 3 - Permutation: pairwise swap + bitwise NOT
    out = bytearray(BLOCK_SIZE)
    for i in range(0, BLOCK_SIZE, 2):
        out[i]     = (~rot[i + 1]) & 0xFF
        out[i + 1] = (~rot[i])     & 0xFF

    return bytes(out)


def _decrypt_block_cbc(block: bytes, key: bytes) -> bytes:
    block = bytearray(block)
    key   = bytearray(key)

    # Undo Step 3 - Membalikkan Permutation (swap+NOT is self-inverse, jadi kode sama)
    rot = bytearray(BLOCK_SIZE)
    for i in range(0, BLOCK_SIZE, 2):
        rot[i]     = (~block[i + 1]) & 0xFF
        rot[i + 1] = (~block[i])     & 0xFF

    # Undo Step 2 - Geser ke kanan secara sirkular sebanyak 5 posisi
    shift = 5
    sub = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        sub[(i + shift) % BLOCK_SIZE] = rot[i]

    # Undo Step 1 - XOR dengan key
    out = bytearray(BLOCK_SIZE)
    for i in range(BLOCK_SIZE):
        out[i] = sub[i] ^ key[i]

    return bytes(out)


def encrypt_cbc(data: bytes, key_str: str, iv_str: str, use_padding: bool) -> bytes:
    key = pad_key(key_str)
    iv  = pad_key(iv_str)

    process_data = block_pad(data) if use_padding else data
    num_blocks = len(process_data) // BLOCK_SIZE

    out = bytearray(process_data)
    prev_cipher_block = iv

    for i in range(num_blocks):
        offset = i * BLOCK_SIZE
        block  = process_data[offset : offset + BLOCK_SIZE]

        # CBC chain: XOR plaintext dengan block sebelumnya atau IV
        chained_block = xor_blocks(block, prev_cipher_block)
        cipher_block  = _encrypt_block_cbc(chained_block, key)
        out[offset : offset + BLOCK_SIZE] = cipher_block

        prev_cipher_block = cipher_block  # block selanjutnya didasari oleh blok sebelumnya

    return bytes(out)


def decrypt_cbc(data: bytes, key_str: str, iv_str: str, use_padding: bool) -> bytes:
    key = pad_key(key_str)
    iv  = pad_key(iv_str)

    num_blocks = len(data) // BLOCK_SIZE
    out = bytearray(data)
    prev_cipher_block = iv

    for i in range(num_blocks):
        offset       = i * BLOCK_SIZE
        cipher_block = data[offset : offset + BLOCK_SIZE]

        # Decrypt dulu, XOR kemudian
        decrypted_block = _decrypt_block_cbc(cipher_block, key)
        plain_block     = xor_blocks(decrypted_block, prev_cipher_block)
        out[offset : offset + BLOCK_SIZE] = plain_block

        #gunakan blok cipher asli untuk chaining (bukan yang sudah didecrypt)
        prev_cipher_block = cipher_block

    result = bytes(out)
    return block_unpad(result) if use_padding else result


# ─────────────────────────────────────────────
#  Quick Demo / Self-Test
# ─────────────────────────────────────────────

if __name__ == "__main__":
    key = "secret"
    iv  = "initialverctor"
    plaintext = "101032300039 - Abdu Fattah"

    print("=" * 60)
    print("  BLOCK CIPHER - Python Demo")
    print("=" * 60)
    print(f"  Plaintext : {plaintext!r}")
    print(f"  Key       : {key!r}")

    # ── ECB ──────────────────────────────────
    print("\n[ ECB MODE ]")
    ecb_cipher = encrypt_ecb(plaintext.encode("utf-8"), key, use_padding=True)
    ecb_hex    = bytes_to_hex(ecb_cipher)
    print(f"  Encrypted (hex) : {ecb_hex}")

    ecb_plain  = decrypt_ecb(ecb_cipher, key, use_padding=True)
    print(f"  Decrypted       : {ecb_plain.decode('utf-8')!r}")
    assert ecb_plain.decode("utf-8") == plaintext, "ECB round-trip FAILED!"
    print("  [OK] ECB round-trip passed")

    # ── CBC ──────────────────────────────────
    print("\n[ CBC MODE ]")
    cbc_cipher = encrypt_cbc(plaintext.encode("utf-8"), key, iv, use_padding=True)
    cbc_hex    = bytes_to_hex(cbc_cipher)
    print(f"  Encrypted (hex) : {cbc_hex}")

    cbc_plain  = decrypt_cbc(cbc_cipher, key, iv, use_padding=True)
    print(f"  Decrypted       : {cbc_plain.decode('utf-8')!r}")
    assert cbc_plain.decode("utf-8") == plaintext, "CBC round-trip FAILED!"
    print("  [OK] CBC round-trip passed")

    # ── Hex round-trip ──────────────────────
    print("\n[ HEX HELPERS ]")
    recovered = hex_to_bytes(ecb_hex)
    assert recovered == ecb_cipher
    print("  [OK] bytes_to_hex / hex_to_bytes passed")

    print("\n  All tests passed!")
