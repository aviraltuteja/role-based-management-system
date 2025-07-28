from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
from config import ENCRYPTION_KEY
import base64
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Optional: Configure logging format and file handler
if not logger.handlers:
    handler = logging.FileHandler("encryption_audit.log")
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

BLOCK_SIZE = 16  # AES block size


def encrypt_field(plain_text: str) -> str:
    """Encrypt a single field using AES-256."""
    try:
        iv = get_random_bytes(BLOCK_SIZE)
        cipher = AES.new(ENCRYPTION_KEY, AES.MODE_CBC, iv)
        padded_data = pad(plain_text.encode("utf-8"), BLOCK_SIZE)
        encrypted_bytes = cipher.encrypt(padded_data)
        encrypted_blob = base64.b64encode(iv + encrypted_bytes).decode("utf-8")

        logger.info("Encrypted field")  # log without sensitive content
        return encrypted_blob
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        raise


def decrypt_field(encrypted_text: str) -> str:
    """Decrypt a single encrypted field."""
    try:
        raw_data = base64.b64decode(encrypted_text)
        iv = raw_data[:BLOCK_SIZE]
        encrypted_data = raw_data[BLOCK_SIZE:]
        cipher = AES.new(ENCRYPTION_KEY, AES.MODE_CBC, iv)
        decrypted_bytes = unpad(cipher.decrypt(encrypted_data), BLOCK_SIZE)
        plain_text = decrypted_bytes.decode("utf-8")

        logger.info("Decrypted field")  # log without sensitive content
        return plain_text
    except Exception as e:
        logger.error(f"Decryption failed: {e}")
        raise
