import os
import sys

try:
    DB_URI = os.environ["DB"]
except:
    sys.exit('Environment variable "DB" missing.')

WEIGHT_SYSTEM_DOWNLOAD_LIMIT = int(os.getenv("WS_LIMIT", "10000"))
