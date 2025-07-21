"""
Instant Knowledge Base Agent
Provides bilingual Q&A with analogy-rich explanations
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class KnowledgeBaseAgent(BaseEducationalAgent):
    """Agent for providing instant knowledge base responses with analogies"""
    
    def __init__(self):
        super().__init__("Instant Knowledge Base")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Provide instant educational Q&A with analogies",
            "features": [
                "Bilingual question answering",
                "Analogy-rich explanations",
                "Grade-appropriate responses",
                "Cultural context integration",
                "Interactive Q&A sessions",
                "Follow-up question suggestions",
                "Concept clarification"
            ],
            "output_formats": ["explanatory_response", "analogy_based_teaching", "interactive_qa"],
            "specializations": ["analogy_creation", "concept_explanation", "interactive_learning"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the knowledge base workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("analyze_question", self._analyze_question)
        workflow.add_node("research_answer", self._research_answer)
        workflow.add_node("create_analogies", self._create_analogies)
        workflow.add_node("format_response", self._format_response)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "analyze_question")
        workflow.add_edge("analyze_question", "research_answer")
        workflow.add_edge("research_answer", "create_analogies")
        workflow.add_edge("create_analogies", "format_response")
        workflow.add_edge("format_response", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _analyze_question(self, state: AgentState) -> AgentState:
        """Analyze the question to understand learning needs"""
        question_prompt = f"""
        Analyze the educational question:
        Question: {state.prompt}
        Grade Levels: {state.grades}
        Languages: {state.languages}
        
        Question Analysis:
        1. Identify the core concept being asked about
        2. Determine the complexity level needed
        3. Assess prior knowledge assumptions
        4. Identify potential misconceptions
        5. Note cultural context considerations
        6. Suggest analogy opportunities
        
        Provide comprehensive question analysis.
        """
        
        messages = [
            SystemMessage(content="You are an expert educational analyst specializing in question comprehension and learning needs assessment."),
            HumanMessage(content=question_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["question_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "question_analysis",
            "status": "completed",
            "message": "Question analyzed for learning needs"
        })
        
        return state

    def _research_answer(self, state: AgentState) -> AgentState:
        """Research comprehensive answer to the question"""
        research_prompt = f"""
        Research comprehensive answer:
        Question: {state.prompt}
        Question Analysis: {state.metadata.get('question_analysis', '')}
        Grade Levels: {state.grades}
        
        Research Requirements:
        1. Provide accurate, factual information
        2. Include grade-appropriate depth
        3. Cover key concepts thoroughly
        4. Address common misconceptions
        5. Include relevant examples
        6. Consider multiple perspectives
        
        Provide comprehensive, accurate answer.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=research_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["researched_answer"] = response.content
        
        state.workflow_steps.append({
            "step": "answer_research",
            "status": "completed",
            "message": "Comprehensive answer researched"
        })
        
        return state

    def _create_analogies(self, state: AgentState) -> AgentState:
        """Create culturally relevant analogies for explanation"""
        analogy_prompt = f"""
        Create powerful analogies for explanation:
        Question: {state.prompt}
        Answer Content: {state.metadata.get('researched_answer', '')}
        Grade Levels: {state.grades}
        Languages: {state.languages}
        
        Analogy Creation:
        1. Identify complex concepts needing analogies
        2. Create culturally relevant comparisons
        3. Use familiar Indian contexts and experiences
        4. Ensure age-appropriate analogies
        5. Make abstract concepts concrete
        6. Include multiple analogies for different learning styles
        
        Create engaging, culturally relevant analogies.
        """
        
        messages = [
            SystemMessage(content="You are an expert in creating educational analogies and metaphors, specializing in Indian cultural contexts."),
            HumanMessage(content=analogy_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["analogies"] = response.content
        
        state.workflow_steps.append({
            "step": "analogy_creation",
            "status": "completed",
            "message": "Cultural analogies created for explanation"
        })
        
        return state

    def _format_response(self, state: AgentState) -> AgentState:
        """Format comprehensive response with analogies"""
        formatting_prompt = f"""
        Format comprehensive educational response:
        Original Question: {state.prompt}
        Researched Answer: {state.metadata.get('researched_answer', '')}
        Analogies: {state.metadata.get('analogies', '')}
        Target Grades: {state.grades}
        Languages: {state.languages}
        
        Response Formatting:
        1. Clear, direct answer to the question
        2. Integration of relevant analogies
        3. Grade-appropriate language and examples
        4. Multilingual elements if requested
        5. Interactive elements and follow-up questions
        6. Additional resources and exploration suggestions
        
        Create engaging, comprehensive educational response.
        """
        
        messages = [
            SystemMessage(content="You are an expert educational communicator specializing in clear, engaging explanations with analogies."),
            HumanMessage(content=formatting_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        state.result = {
            "content": response.content,
            "metadata": {
                "response_type": "knowledge_base_answer_with_analogies",
                "includes_analogies": True,
                "cultural_context": "indian_educational_context",
                "grade_appropriate": True,
                "multilingual_support": len(state.languages) > 1
            }
        }
        
        state.workflow_steps.append({
            "step": "response_formatting",
            "status": "completed",
            "message": "Comprehensive response formatted with analogies"
        })
        
        return state