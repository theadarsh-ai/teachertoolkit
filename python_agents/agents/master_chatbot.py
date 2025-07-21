"""
Master Agent Chatbot
Central routing and context management for all educational agents
"""
from typing import Dict, List, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class MasterChatbotAgent(BaseEducationalAgent):
    """Master agent for routing requests and managing context across all educational agents"""
    
    def __init__(self):
        super().__init__("Master Educational Chatbot")
        self.agent_capabilities = {
            "content-generation": "Generate culturally relevant educational materials",
            "differentiated-materials": "Create grade-level differentiated content",
            "lesson-planner": "Develop comprehensive lesson plans",
            "knowledge-base": "Answer educational questions with analogies",
            "visual-aids": "Create visual learning materials and diagrams",
            "gamified-teaching": "Design educational games and activities",
            "classroom-analytics": "Analyze classroom performance and engagement",
            "audio-assessment": "Evaluate reading and speaking skills",
            "performance-analysis": "Provide personalized learning recommendations",
            "ar-integration": "Create augmented reality learning experiences"
        }

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Route requests and manage educational context",
            "features": [
                "Intelligent agent routing",
                "Context management and memory",
                "Multi-agent coordination",
                "Educational conversation management",
                "Task decomposition and delegation",
                "Progress tracking across agents",
                "Unified response compilation"
            ],
            "output_formats": ["conversational", "structured_guidance", "agent_recommendations"],
            "specializations": ["agent_routing", "context_management", "educational_guidance"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the master chatbot workflow"""
        workflow = StateGraph(AgentState)
        
        # Define workflow nodes
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("classify_intent", self._classify_intent)
        workflow.add_node("route_to_agent", self._route_to_agent)
        workflow.add_node("generate_response", self._generate_response)
        workflow.add_node("finalize", self._finalize_result)
        
        # Define workflow edges
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "classify_intent")
        workflow.add_edge("classify_intent", "route_to_agent")
        workflow.add_edge("route_to_agent", "generate_response")
        workflow.add_edge("generate_response", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _classify_intent(self, state: AgentState) -> AgentState:
        """Classify user intent and determine appropriate agent routing"""
        classification_prompt = f"""
        Classify the educational intent and recommend appropriate agent(s):
        User Message: {state.prompt}
        Context: Grades {state.grades}, Languages: {state.languages}
        
        Available Agents and Capabilities:
        {chr(10).join([f"- {agent}: {capability}" for agent, capability in self.agent_capabilities.items()])}
        
        Analysis Requirements:
        1. Identify the primary educational intent
        2. Determine task complexity (single vs multi-agent)
        3. Recommend the most appropriate agent(s)
        4. Suggest task decomposition if needed
        5. Consider grade-level appropriateness
        6. Note any special requirements
        
        Provide intent classification and routing recommendations.
        """
        
        messages = [
            SystemMessage(content="You are an expert educational AI coordinator specializing in task analysis and agent routing."),
            HumanMessage(content=classification_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["intent_classification"] = response.content
        
        state.workflow_steps.append({
            "step": "intent_classification",
            "status": "completed",
            "message": "User intent classified and routing determined"
        })
        
        return state

    def _route_to_agent(self, state: AgentState) -> AgentState:
        """Route to appropriate agent(s) based on classification"""
        routing_prompt = f"""
        Based on the intent classification, provide specific routing guidance:
        Intent Analysis: {state.metadata.get('intent_classification', '')}
        User Request: {state.prompt}
        
        Routing Decision:
        1. Identify the primary agent to handle this request
        2. Determine if multiple agents are needed
        3. Specify the sequence of agent interactions
        4. Define handoff criteria between agents
        5. Set success criteria for the routing
        
        Provide clear routing instructions.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational workflow orchestration and agent coordination."),
            HumanMessage(content=routing_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["routing_decision"] = response.content
        
        state.workflow_steps.append({
            "step": "agent_routing",
            "status": "completed",
            "message": "Agent routing decisions made"
        })
        
        return state

    def _generate_response(self, state: AgentState) -> AgentState:
        """Generate comprehensive response with guidance"""
        response_prompt = f"""
        Generate a comprehensive educational response:
        User Request: {state.prompt}
        Intent Classification: {state.metadata.get('intent_classification', '')}
        Routing Decision: {state.metadata.get('routing_decision', '')}
        
        Response should include:
        1. Direct answer to the user's question
        2. Educational context and background
        3. Grade-level appropriate explanations
        4. Practical implementation guidance
        5. Additional resources and suggestions
        6. Next steps or follow-up recommendations
        
        Provide a helpful, comprehensive educational response.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=response_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        state.result = {
            "content": response.content,
            "metadata": {
                "response_type": "master_chatbot_guidance",
                "intent_classification": state.metadata.get("intent_classification", ""),
                "routing_recommendations": state.metadata.get("routing_decision", ""),
                "grades_addressed": state.grades,
                "languages_supported": state.languages
            }
        }
        
        state.workflow_steps.append({
            "step": "response_generation",
            "status": "completed",
            "message": "Comprehensive educational response generated"
        })
        
        return state

    async def route_and_process(self, message: str, grades: List[int], 
                              languages: List[str] = ["English"], 
                              context: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Route message and provide educational guidance"""
        return await self.process(
            prompt=message,
            grades=grades,
            languages=languages,
            content_source=context.get("content_source", "prebook"),
            metadata=context
        )