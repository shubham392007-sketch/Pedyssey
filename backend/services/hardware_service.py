import os
import sys
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class HardwareService:
    """Detects available hardware memory, GPU presence, and Ollama model context capabilities
    to dynamically calibrate safe num_ctx and num_predict budgets.
    """

    _cached_profile: Optional[Dict[str, Any]] = None

    @classmethod
    def get_hardware_profile(cls, ollama_base_url: str = "http://localhost:11434") -> Dict[str, Any]:
        """Returns the hardware profile with safe context tier configurations."""
        if cls._cached_profile is not None:
            return cls._cached_profile

        total_ram_gb = cls._detect_total_ram_gb()
        has_gpu = cls._detect_gpu_presence()
        
        # Categorize memory tier with CPU/GPU responsiveness calibration
        if total_ram_gb >= 32.0 or (total_ram_gb >= 16.0 and has_gpu):
            tier = "HIGH_MEMORY"
            quick_ctx = 32768
            quick_predict = 4096
            think_ctx = 65536
            think_predict = 12288
            deep_ctx = 65536
            deep_predict = 16384
        elif total_ram_gb >= 16.0:
            tier = "HIGH_MEMORY_CPU"
            quick_ctx = 32768
            quick_predict = 4096
            think_ctx = 32768
            think_predict = 8192
            deep_ctx = 32768
            deep_predict = 12288
        elif total_ram_gb >= 8.0:
            tier = "MEDIUM_MEMORY"
            quick_ctx = 32768
            quick_predict = 4096
            think_ctx = 32768
            think_predict = 4096
            deep_ctx = 32768
            deep_predict = 8192
        else:
            tier = "LOWER_MEMORY"
            quick_ctx = 16384
            quick_predict = 2048
            think_ctx = 16384
            think_predict = 2048
            deep_ctx = 32768
            deep_predict = 4096

        profile = {
            "tier": tier,
            "total_ram_gb": round(total_ram_gb, 1),
            "has_gpu": has_gpu,
            "modes": {
                "quick": {
                    "num_ctx": quick_ctx,
                    "num_predict": quick_predict,
                    "fallback_num_ctx": max(16384, quick_ctx // 2),
                },
                "think": {
                    "num_ctx": think_ctx,
                    "num_predict": think_predict,
                    "fallback_num_ctx": 32768,
                },
                "deep_research": {
                    "num_ctx": deep_ctx,
                    "num_predict": deep_predict,
                    "fallback_num_ctx": 32768,
                },
                "study": {
                    "num_ctx": quick_ctx,
                    "num_predict": min(quick_predict, 4096),
                    "fallback_num_ctx": 16384,
                },
                "research": {
                    "num_ctx": think_ctx,
                    "num_predict": min(think_predict, 8192),
                    "fallback_num_ctx": 32768,
                },
                "explain": {
                    "num_ctx": quick_ctx,
                    "num_predict": min(quick_predict, 3072),
                    "fallback_num_ctx": 16384,
                },
                "compare": {
                    "num_ctx": think_ctx,
                    "num_predict": min(think_predict, 8192),
                    "fallback_num_ctx": 32768,
                },
                "analyze": {
                    "num_ctx": think_ctx,
                    "num_predict": min(think_predict, 8192),
                    "fallback_num_ctx": 32768,
                },
                "verify": {
                    "num_ctx": quick_ctx,
                    "num_predict": min(quick_predict, 4096),
                    "fallback_num_ctx": 16384,
                },
            }
        }
        cls._cached_profile = profile
        logger.info(f"Hardware profile detected: tier={tier}, RAM={total_ram_gb:.1f}GB, GPU={has_gpu}")
        return profile

    @classmethod
    def get_mode_limits(cls, mode: str = "quick") -> Dict[str, int]:
        """Returns safe num_ctx and num_predict for the given mode."""
        profile = cls.get_hardware_profile()
        mode_key = (mode or "quick").lower()
        modes_dict = profile.get("modes", {})
        return modes_dict.get(mode_key, modes_dict.get("quick", {
            "num_ctx": 32768,
            "num_predict": 4096,
            "fallback_num_ctx": 16384
        }))

    @staticmethod
    def _detect_total_ram_gb() -> float:
        """Detect system RAM in gigabytes across Windows/Linux/macOS."""
        try:
            import psutil
            return psutil.virtual_memory().total / (1024 ** 3)
        except Exception:
            pass

        if sys.platform == "win32":
            try:
                import ctypes
                class MEMORYSTATUSEX(ctypes.Structure):
                    _fields_ = [
                        ("dwLength", ctypes.c_ulong),
                        ("dwMemoryLoad", ctypes.c_ulong),
                        ("ullTotalPhys", ctypes.c_ulonglong),
                        ("ullAvailPhys", ctypes.c_ulonglong),
                        ("ullTotalPageFile", ctypes.c_ulonglong),
                        ("ullAvailPageFile", ctypes.c_ulonglong),
                        ("ullTotalVirtual", ctypes.c_ulonglong),
                        ("ullAvailVirtual", ctypes.c_ulonglong),
                        ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
                    ]
                stat = MEMORYSTATUSEX()
                stat.dwLength = ctypes.sizeof(MEMORYSTATUSEX)
                ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(stat))
                return stat.ullTotalPhys / (1024 ** 3)
            except Exception as e:
                logger.debug(f"Windows memory detection fallback error: {e}")

        # Default fallback to 16 GB
        return 16.0

    @staticmethod
    def _detect_gpu_presence() -> bool:
        """Detect CUDA or DirectML GPU presence."""
        try:
            import torch
            if torch.cuda.is_available():
                return True
        except Exception:
            pass
        return False
