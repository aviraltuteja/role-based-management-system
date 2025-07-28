import os
import binascii
from dotenv import load_dotenv

load_dotenv()

raw_key = os.getenv("ENCRYPTION_KEY")
if not raw_key:
    raise ValueError("ENCRYPTION_KEY is missing in environment variables")

try:
    ENCRYPTION_KEY = binascii.unhexlify(raw_key)
except binascii.Error:
    raise ValueError("ENCRYPTION_KEY must be a valid hex string")

if len(ENCRYPTION_KEY) != 32:
    raise ValueError("ENCRYPTION_KEY must be exactly 32 bytes (AES-256 key)")
