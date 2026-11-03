"""Utility functions for Krishi AI backend."""
import logging
import sys
from loguru import logger

def setup_logging():
    """Configure structured logging using loguru."""
    logger.remove()
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    logger.add(
        "logs/krishi_backend.log",
        rotation="10 MB",
        retention="7 days",
        level="DEBUG",
        compression="zip"
    )
