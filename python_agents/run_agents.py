#!/usr/bin/env python3
"""
Run script for EduAI Platform LangGraph Agent Server
"""
import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting EduAI Platform - LangGraph Agent Server")
    print("📚 11 Specialized Educational Agents Ready")
    print("🌍 Multi-language support: Hindi, English, Tamil, Telugu, and more")
    print("🎯 Grade levels: 1st-12th standard")
    print("📖 Content sources: NCERT and External materials")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )