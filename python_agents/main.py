"""
EduAI Platform - LangGraph Agent Server
Multi-Grade Teaching Assistant with 11 Specialized AI Agents
"""
import os
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agents.content_generator import ContentGeneratorAgent
from agents.differentiated_materials import DifferentiatedMaterialsAgent
from agents.lesson_planner import LessonPlannerAgent
from agents.knowledge_base import KnowledgeBaseAgent
from agents.visual_aids import VisualAidsAgent
from agents.gamified_teaching import GamifiedTeachingAgent
from agents.classroom_analytics import ClassroomAnalyticsAgent
from agents.audio_assessment import AudioAssessmentAgent
from agents.master_chatbot import MasterChatbotAgent
from agents.performance_analysis import PerformanceAnalysisAgent
from agents.ar_integration import ARIntegrationAgent

# Load environment variables
load_dotenv()

app = FastAPI(
    title="EduAI Platform API",
    description="LangGraph-powered AI agents for multi-grade Indian education",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class AgentRequest(BaseModel):
    prompt: str
    grades: List[int]
    languages: Optional[List[str]] = ["English"]
    content_source: str = "prebook"  # "prebook" or "external"
    metadata: Optional[Dict[str, Any]] = {}

class AgentResponse(BaseModel):
    agent_type: str
    content: str
    metadata: Dict[str, Any]
    workflow_steps: List[Dict[str, str]]

class LessonPlanRequest(BaseModel):
    topic: str
    grades: List[int]
    duration: str
    languages: Optional[List[str]] = ["English"]
    content_source: str = "prebook"

class PerformanceAnalysisRequest(BaseModel):
    student_data: Dict[str, Any]
    grades: List[int]
    subject: str

# Initialize all agents
agents = {
    "content-generation": ContentGeneratorAgent(),
    "differentiated-materials": DifferentiatedMaterialsAgent(),
    "lesson-planner": LessonPlannerAgent(),
    "knowledge-base": KnowledgeBaseAgent(),
    "visual-aids": VisualAidsAgent(),
    "gamified-teaching": GamifiedTeachingAgent(),
    "classroom-analytics": ClassroomAnalyticsAgent(),
    "audio-assessment": AudioAssessmentAgent(),
    "master-chatbot": MasterChatbotAgent(),
    "performance-analysis": PerformanceAnalysisAgent(),
    "ar-integration": ARIntegrationAgent(),
}

@app.get("/")
async def root():
    return {
        "message": "EduAI Platform - LangGraph Agent Server",
        "available_agents": list(agents.keys()),
        "version": "1.0.0"
    }

@app.post("/agents/{agent_type}/generate", response_model=AgentResponse)
async def generate_content(agent_type: str, request: AgentRequest):
    """Generate content using specified agent"""
    if agent_type not in agents:
        raise HTTPException(status_code=404, detail=f"Agent {agent_type} not found")
    
    try:
        agent = agents[agent_type]
        result = await agent.process(
            prompt=request.prompt,
            grades=request.grades,
            languages=request.languages,
            content_source=request.content_source,
            metadata=request.metadata
        )
        
        return AgentResponse(
            agent_type=agent_type,
            content=result["content"],
            metadata=result["metadata"],
            workflow_steps=result["workflow_steps"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent processing failed: {str(e)}")

@app.post("/agents/lesson-planner/create-plan")
async def create_lesson_plan(request: LessonPlanRequest):
    """Create a comprehensive lesson plan"""
    try:
        agent = agents["lesson-planner"]
        result = await agent.create_lesson_plan(
            topic=request.topic,
            grades=request.grades,
            duration=request.duration,
            languages=request.languages,
            content_source=request.content_source
        )
        
        return AgentResponse(
            agent_type="lesson-planner",
            content=result["content"],
            metadata=result["metadata"],
            workflow_steps=result["workflow_steps"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lesson planning failed: {str(e)}")

@app.post("/agents/performance-analysis/analyze")
async def analyze_performance(request: PerformanceAnalysisRequest):
    """Analyze student performance and provide recommendations"""
    try:
        agent = agents["performance-analysis"]
        result = await agent.analyze_performance(
            student_data=request.student_data,
            grades=request.grades,
            subject=request.subject
        )
        
        return AgentResponse(
            agent_type="performance-analysis",
            content=result["content"],
            metadata=result["metadata"],
            workflow_steps=result["workflow_steps"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Performance analysis failed: {str(e)}")

@app.post("/agents/master-chatbot/chat")
async def chat_with_master(request: AgentRequest):
    """Chat with the master agent for routing and context management"""
    try:
        agent = agents["master-chatbot"]
        result = await agent.route_and_process(
            message=request.prompt,
            grades=request.grades,
            languages=request.languages,
            context=request.metadata
        )
        
        return AgentResponse(
            agent_type="master-chatbot",
            content=result["content"],
            metadata=result["metadata"],
            workflow_steps=result["workflow_steps"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Master chatbot failed: {str(e)}")

@app.get("/agents/{agent_type}/status")
async def get_agent_status(agent_type: str):
    """Get agent status and capabilities"""
    if agent_type not in agents:
        raise HTTPException(status_code=404, detail=f"Agent {agent_type} not found")
    
    agent = agents[agent_type]
    return {
        "agent_type": agent_type,
        "status": "active",
        "capabilities": agent.get_capabilities(),
        "supported_languages": agent.supported_languages,
        "supported_grades": agent.supported_grades
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)