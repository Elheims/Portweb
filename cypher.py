# ============================================================
#  Tugas 1 - Keamanan Sistem TK-47-01
#  Kriptografi Dasar: One Time Pads & Cipher Transposisional
#  Prodi S1 Teknik Komputer - Universitas Telkom
# ============================================================

import random
import string
import math


# ─────────────────────────────────────────
#  ONE TIME PADS (OTP)
# ─────────────────────────────────────────

def otp_generate_key(length: int) -> str:
    """Generate a random OTP key of the same length as the message (letters only)."""
    return ''.join(random.choice(string.ascii_uppercase) for _ in range(length))


def otp_encrypt(plaintext: str, key: str) -> tuple[str, str]:
    """
    Encrypt plaintext using One Time Pads.
    Only alphabet characters are encrypted; others are kept as-is.
    Key must be at least as long as the number of alpha characters.
    Returns (ciphertext, key_used).
    """
    # Filter only alpha chars to count key length needed
    alpha_only = [c for c in plaintext.upper() if c.isalpha()]
    
    if len(key) < len(alpha_only):
        raise ValueError(f"Kunci terlalu pendek! Butuh minimal {len(alpha_only)} karakter.")

    result = []
    key_idx = 0
    for char in plaintext.upper():
        if char.isalpha():
            p = ord(char) - ord('A')
            k = ord(key[key_idx]) - ord('A')
            c = chr((p + k) % 26 + ord('A'))
            result.append(c)
            key_idx += 1
        else:
            result.append(char)

    return ''.join(result), key


def otp_decrypt(ciphertext: str, key: str) -> str:
    """Decrypt ciphertext using One Time Pads with the given key."""
    result = []
    key_idx = 0
    for char in ciphertext.upper():
        if char.isalpha():
            c = ord(char) - ord('A')
            k = ord(key[key_idx]) - ord('A')
            p = chr((c - k) % 26 + ord('A'))
            result.append(p)
            key_idx += 1
        else:
            result.append(char)

    return ''.join(result)


# ─────────────────────────────────────────
#  CIPHER TRANSPOSISIONAL (Columnar)
# ─────────────────────────────────────────

def transposition_encrypt(plaintext: str, key: str) -> str:
    """
    Encrypt using Columnar Transposition Cipher.
    Key is a word; columns are read in alphabetical order of key letters.
    """
    text = plaintext.replace(' ', '').upper()
    num_cols = len(key)
    num_rows = math.ceil(len(text) / num_cols)

    # Pad with 'X' if needed
    padded = text.ljust(num_rows * num_cols, 'X')

    # Build grid row by row
    grid = [list(padded[i * num_cols:(i + 1) * num_cols]) for i in range(num_rows)]

    # Determine column read order based on alphabetical order of key
    col_order = sorted(range(num_cols), key=lambda i: key[i])

    # Read columns in sorted order
    ciphertext = ''
    for col in col_order:
        for row in grid:
            ciphertext += row[col]

    return ciphertext


def transposition_decrypt(ciphertext: str, key: str) -> str:
    """
    Decrypt using Columnar Transposition Cipher.
    """
    num_cols = len(key)
    num_rows = math.ceil(len(ciphertext) / num_cols)
    total_cells = num_rows * num_cols
    extra_cells = total_cells - len(ciphertext)

    # Determine column read order
    col_order = sorted(range(num_cols), key=lambda i: key[i])

    # Calculate how many chars each column has
    col_lengths = []
    for i, col in enumerate(col_order):
        # Last few columns in sorted order might be shorter if padding exists
        position_in_sorted = i
        if position_in_sorted >= (num_cols - extra_cells):
            col_lengths.append((col, num_rows - 1))
        else:
            col_lengths.append((col, num_rows))

    # Fill each column with the right slice of ciphertext
    columns = {}
    idx = 0
    for col, length in col_lengths:
        columns[col] = list(ciphertext[idx:idx + length])
        idx += length

    # Read off row by row
    plaintext = ''
    row_indices = [0] * num_cols
    for row in range(num_rows):
        for col in range(num_cols):
            if row < len(columns[col]):
                plaintext += columns[col][row]

    return plaintext


# ─────────────────────────────────────────
#  DISPLAY HELPERS
# ─────────────────────────────────────────

def print_separator():
    print("=" * 60)

def print_header(title: str):
    print_separator()
    print(f"  {title}")
    print_separator()

def show_grid(text: str, key: str):
    """Visualize the transposition grid for better understanding."""
    text_clean = text.replace(' ', '').upper()
    num_cols = len(key)
    num_rows = math.ceil(len(text_clean) / num_cols)
    padded = text_clean.ljust(num_rows * num_cols, 'X')

    print("\n  Grid Transposisi:")
    print("  " + "  ".join(f"[{k}]" for k in key.upper()))
    print("  " + "  ".join(f" {str(i+1)} " for i in range(num_cols)))
    print("  " + "-" * (num_cols * 4))
    for i in range(num_rows):
        row = padded[i * num_cols:(i + 1) * num_cols]
        print("  " + "   ".join(row))

    col_order = sorted(range(num_cols), key=lambda i: key[i])
    print(f"\n  Urutan baca kolom: {[key[c].upper() for c in col_order]}")


# ─────────────────────────────────────────
#  OTP FLOW
# ─────────────────────────────────────────

def run_otp():
    while True:
        print_header("ONE TIME PADS (OTP)")
        print("\n  1. Enkripsi (Encrypt) — generate kunci otomatis")
        print("  2. Enkripsi (Encrypt) — masukkan kunci manual")
        print("  3. Dekripsi (Decrypt)")
        print("  0. Kembali ke menu utama")
        choice = input("\n  Pilihan: ").strip()

        if choice == '1':
            plaintext = input("\n  Input Plaintext : ")
            alpha_len = sum(1 for c in plaintext if c.isalpha())
            key = otp_generate_key(alpha_len)
            ciphertext, key_used = otp_encrypt(plaintext, key)
            print("\n" + "-" * 60)
            print(f"  Plaintext   : {plaintext.upper()}")
            print(f"  Kunci (OTP) : {key_used}  <-- simpan kunci ini!")
            print(f"  Ciphertext  : {ciphertext}")
            print("-" * 60)

        elif choice == '2':
            plaintext = input("\n  Input Plaintext : ")
            alpha_len = sum(1 for c in plaintext if c.isalpha())
            print(f"  (Kunci harus minimal {alpha_len} huruf)")
            key = input("  Input Kunci     : ").upper().replace(' ', '')
            try:
                ciphertext, key_used = otp_encrypt(plaintext, key)
                print("\n" + "-" * 60)
                print(f"  Plaintext   : {plaintext.upper()}")
                print(f"  Kunci (OTP) : {key_used}")
                print(f"  Ciphertext  : {ciphertext}")
                print("-" * 60)
            except ValueError as e:
                print(f"\n  [!] Error: {e}")

        elif choice == '3':
            ciphertext = input("\n  Input Ciphertext : ")
            key = input("  Input Kunci      : ").upper().replace(' ', '')
            plaintext = otp_decrypt(ciphertext, key)
            print("\n" + "-" * 60)
            print(f"  Ciphertext  : {ciphertext.upper()}")
            print(f"  Kunci (OTP) : {key}")
            print(f"  Plaintext   : {plaintext}")
            print("-" * 60)

        elif choice == '0':
            break
        else:
            print("  [!] Pilihan tidak valid.")

        input("\n  Tekan Enter untuk melanjutkan...")


# ─────────────────────────────────────────
#  TRANSPOSITION CIPHER FLOW
# ─────────────────────────────────────────

def run_transposition():
    while True:
        print_header("CIPHER TRANSPOSISIONAL (Columnar)")
        print("\n  1. Enkripsi (Encrypt)")
        print("  2. Dekripsi (Decrypt)")
        print("  0. Kembali ke menu utama")
        choice = input("\n  Pilihan: ").strip()

        if choice == '1':
            plaintext = input("\n  Input Plaintext : ")
            key = input("  Input Kunci (kata kunci): ").strip()
            show_grid(plaintext, key)
            ciphertext = transposition_encrypt(plaintext, key)
            print("\n" + "-" * 60)
            print(f"  Plaintext   : {plaintext.replace(' ', '').upper()}")
            print(f"  Kunci       : {key.upper()}")
            print(f"  Ciphertext  : {ciphertext}")
            print("-" * 60)

        elif choice == '2':
            ciphertext = input("\n  Input Ciphertext : ").upper()
            key = input("  Input Kunci (kata kunci)  : ").strip()
            plaintext = transposition_decrypt(ciphertext, key)
            print("\n" + "-" * 60)
            print(f"  Ciphertext  : {ciphertext}")
            print(f"  Kunci       : {key.upper()}")
            print(f"  Plaintext   : {plaintext}")
            print("-" * 60)

        elif choice == '0':
            break
        else:
            print("  [!] Pilihan tidak valid.")

        input("\n  Tekan Enter untuk melanjutkan...")


# ─────────────────────────────────────────
#  MAIN MENU
# ─────────────────────────────────────────

def main():
    while True:
        print_header("KRIPTOGRAFI DASAR  |  Keamanan Sistem TK-47-01")
        print("  Pilih jenis kriptografi:")
        print("  1. One Time Pads (OTP)")
        print("  2. Cipher Transposisional (Columnar)")
        print("  0. Keluar")
        choice = input("\n  Pilihan: ").strip()

        if choice == '1':
            run_otp()
        elif choice == '2':
            run_transposition()
        elif choice == '0':
            print("\n  Program selesai. Sampai jumpa!\n")
            break
        else:
            print("  [!] Pilihan tidak valid.")
            input("\n  Tekan Enter untuk melanjutkan...")


if __name__ == "__main__":
    main()