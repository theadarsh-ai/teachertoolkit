"""
Base Agent Class for EduAI Platform
Common functionality and interfaces for all educational agents
"""
import os
from typing import Dict, List, Any, Optional
from .ncert_integration import get_ncert_context, validate_content_alignment
from abc import ABC, abstractmethod
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import MessagesState
from pydantic import BaseModel

class AgentState(MessagesState):
    """State model for all agents"""
    prompt: str
    grades: List[int]
    languages: List[str]
    content_source: str
    metadata: Dict[str, Any]
    result: Optional[Dict[str, Any]] = None
    workflow_steps: List[Dict[str, str]] = []
    current_step: int = 0

class BaseEducationalAgent(ABC):
    """Base class for all educational agents in the EduAI platform"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.supported_languages = [
            "English", "Hindi", "Tamil", "Telugu", "Marathi", 
            "Bengali", "Gujarati", "Kannada", "Odia", "Punjabi"
        ]
        self.supported_grades = list(range(1, 13))  # Grades 1-12
        
        # Initialize Gemini model
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.7,
            max_tokens=4000
        )
        
        # Build the graph
        self.graph = self._build_graph()

    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """Return agent capabilities and features"""
        pass

    @abstractmethod
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow for this agent"""
        pass

    def _initialize_state(self, state: AgentState) -> AgentState:
        """Initialize the agent state with common setup"""
        state.workflow_steps.append({
            "step": "initialize",
            "status": "completed",
            "message": f"Initialized {self.agent_name} agent"
        })
        state.current_step = 0
        return state

    def _validate_input(self, state: AgentState) -> AgentState:
        """Validate input parameters"""
        # Validate grades
        invalid_grades = [g for g in state.grades if g not in self.supported_grades]
        if invalid_grades:
            raise ValueError(f"Unsupported grades: {invalid_grades}")
        
        # Validate languages
        invalid_languages = [l for l in state.languages if l not in self.supported_languages]
        if invalid_languages:
            raise ValueError(f"Unsupported languages: {invalid_languages}")
        
        state.workflow_steps.append({
            "step": "validation",
            "status": "completed",
            "message": "Input validation successful"
        })
        
        return state

    def _analyze_context(self, state: AgentState) -> AgentState:
        """Analyze educational context and requirements"""
        context_analysis = f"""
        Educational Context Analysis for {self.agent_name}:
        - Target Grades: {', '.join(map(str, state.grades))}
        - Languages: {', '.join(state.languages)}
        - Content Source: {state.content_source.upper()}
        - Multi-grade classroom: {'Yes' if len(state.grades) > 1 else 'No'}
        """
        
        state.metadata["context_analysis"] = context_analysis
        state.workflow_steps.append({
            "step": "context_analysis", 
            "status": "completed",
            "message": "Educational context analyzed"
        })
        
        return state

    def _finalize_result(self, state: AgentState) -> AgentState:
        """Finalize and format the result"""
        if not state.result:
            state.result = {"content": "No content generated", "metadata": {}}
        
        state.workflow_steps.append({
            "step": "finalize",
            "status": "completed", 
            "message": "Result finalized"
        })
        
        return state

    async def process(self, prompt: str, grades: List[int], languages: List[str] = ["English"], 
                     content_source: str = "prebook", metadata: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Process the request through the agent's workflow"""
        
        initial_state = AgentState(
            messages=[],
            prompt=prompt,
            grades=grades,
            languages=languages,
            content_source=content_source,
            metadata=metadata,
            workflow_steps=[],
            current_step=0
        )
        
        # Execute the graph
        final_state = await self.graph.ainvoke(initial_state)
        
        return {
            "content": final_state.result["content"] if final_state.result else "",
            "metadata": {
                **final_state.metadata,
                "agent_name": self.agent_name,
                "grades": grades,
                "languages": languages,
                "content_source": content_source
            },
            "workflow_steps": final_state.workflow_steps
        }

    def get_indian_context_prompt(self, content_source: str) -> str:
        """Generate context-appropriate prompt for Indian education"""
        if content_source == "prebook":
            return """
            You are an expert Indian educator specializing in NCERT curriculum and Indian educational context.
            Consider:
            - NCERT textbook alignment and pedagogical approaches
            - Indian cultural contexts, festivals, and traditions
            - Regional diversity and multilingual classroom needs
            - Government education policies and NEP 2020 guidelines
            - Indian historical examples and case studies
            - Local community relevance and practical applications
            """
        else:
            return """
            You are an expert Indian educator with deep knowledge of international best practices
            adapted for Indian contexts. Consider:
            - Global educational methodologies suitable for Indian classrooms
            - Cross-cultural learning approaches
            - International examples adapted to Indian scenarios
            - Modern educational technology integration
            - Contemporary research in education
            - Progressive teaching methodologies aligned with Indian values
            """