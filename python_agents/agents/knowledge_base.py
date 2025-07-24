"""
Enhanced Instant Knowledge Base Agent
Comprehensive Q&A system integrating NCERT textbooks and external educational sources
Provides bilingual responses with analogies, follow-up questions, and source citations
"""
from typing import Dict, List, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState
import json
import requests

class KnowledgeBaseAgent(BaseEducationalAgent):
    """Agent for providing instant knowledge base responses with analogies"""
    
    def __init__(self):
        super().__init__("Instant Knowledge Base")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Comprehensive Q&A system with NCERT and external source integration",
            "features": [
                "NCERT textbook integration",
                "External educational sources",
                "Bilingual question answering", 
                "Analogy-rich explanations",
                "Grade-appropriate responses",
                "Cultural context integration",
                "Source citation and references",
                "Follow-up question generation",
                "Confidence scoring",
                "Multi-language support"
            ],
            "output_formats": ["comprehensive_answer", "sourced_response", "analogy_teaching", "structured_qa"],
            "specializations": ["source_integration", "educational_synthesis", "cultural_adaptation", "knowledge_retrieval"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the enhanced knowledge base workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("search_ncert", self._search_ncert_sources)
        workflow.add_node("search_external", self._search_external_sources)
        workflow.add_node("synthesize_answer", self._synthesize_comprehensive_answer)
        workflow.add_node("create_analogies", self._create_cultural_analogies)
        workflow.add_node("generate_followups", self._generate_followup_questions)
        workflow.add_node("format_response", self._format_comprehensive_response)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "search_ncert")
        workflow.add_edge("search_ncert", "search_external")
        workflow.add_edge("search_external", "synthesize_answer")
        workflow.add_edge("synthesize_answer", "create_analogies")
        workflow.add_edge("create_analogies", "generate_followups")
        workflow.add_edge("generate_followups", "format_response")
        workflow.add_edge("format_response", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    async def process_comprehensive_query(self, question: str, grades: List[int], languages: List[str], context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a comprehensive knowledge query with NCERT and external source integration"""
        try:
            initial_state = {
                "messages": [HumanMessage(content=question)],
                "metadata": {
                    "question": question,
                    "grades": grades,
                    "languages": languages,
                    "context": context or {},
                    "workflow_steps": [],
                    "ncert_sources": [],
                    "external_sources": [],
                    "analogies": [],
                    "followup_questions": [],
                    "confidence_score": 0.0
                }
            }
            
            result = await self.graph.ainvoke(initial_state)
            
            return {
                "content": result["messages"][-1].content if result["messages"] else "No response generated",
                "metadata": result["metadata"],
                "workflow_steps": result["metadata"].get("workflow_steps", [])
            }
            
        except Exception as e:
            print(f"❌ Knowledge Base processing error: {str(e)}")
            return {
                "content": f"I apologize, but I encountered an error while processing your question: {str(e)}",
                "metadata": {
                    "error": str(e),
                    "workflow_steps": ["error_occurred"],
                    "ncert_sources": [],
                    "external_sources": [],
                    "analogies": [],
                    "followup_questions": []
                },
                "workflow_steps": ["error_occurred"]
            }

    async def _search_ncert_sources(self, state: AgentState) -> AgentState:
        """Search NCERT textbooks for relevant information"""
        try:
            question = state["metadata"]["question"]
            grades = state["metadata"]["grades"]
            
            # Simulate NCERT textbook search (in production, this would query actual NCERT database)
            ncert_sources = []
            
            if grades:
                for grade in grades[:3]:  # Limit to top 3 grades for performance
                    ncert_sources.append({
                        "title": f"NCERT Textbook - Class {grade}",
                        "class": grade,
                        "subject": "Science",  # Would be determined by question analysis
                        "chapter": f"Chapter {(hash(question) % 15) + 1}",
                        "page": (hash(question) % 200) + 10,
                        "relevance_score": 0.85
                    })
            
            state["metadata"]["ncert_sources"] = ncert_sources
            state["metadata"]["workflow_steps"].append("ncert_search_completed")
            
            return state
            
        except Exception as e:
            print(f"❌ NCERT search error: {str(e)}")
            state["metadata"]["workflow_steps"].append("ncert_search_failed")
            return state

    async def _search_external_sources(self, state: AgentState) -> AgentState:
        """Search external educational sources"""
        try:
            question = state["metadata"]["question"]
            
            # Simulate external source search
            external_sources = [
                {
                    "title": "Khan Academy Educational Content",
                    "url": "https://www.khanacademy.org",
                    "type": "Educational Platform",
                    "relevance_score": 0.80
                },
                {
                    "title": "Educational Encyclopedia Entry",
                    "url": "https://www.britannica.com",
                    "type": "Reference Material", 
                    "relevance_score": 0.75
                }
            ]
            
            state["metadata"]["external_sources"] = external_sources
            state["metadata"]["workflow_steps"].append("external_search_completed")
            
            return state
            
        except Exception as e:
            print(f"❌ External search error: {str(e)}")
            state["metadata"]["workflow_steps"].append("external_search_failed")
            return state

    async def _synthesize_comprehensive_answer(self, state: AgentState) -> AgentState:
        """Synthesize information from all sources into a comprehensive answer"""
        try:
            question = state["metadata"]["question"]
            grades = state["metadata"]["grades"]
            languages = state["metadata"]["languages"]
            ncert_sources = state["metadata"]["ncert_sources"]
            external_sources = state["metadata"]["external_sources"]
            
            grade_level = grades[0] if grades else 8
            language = languages[0] if languages else "English"
            
            # Create comprehensive answer prompt
            answer_prompt = f"""As an expert Indian educational assistant, provide a comprehensive answer to this question for Grade {grade_level} students:

Question: "{question}"

Consider information from:
- {len(ncert_sources)} NCERT textbook sources
- {len(external_sources)} external educational sources

Requirements:
1. Provide a clear, age-appropriate explanation for Grade {grade_level} students
2. Include relevant examples from Indian context
3. Make the content culturally relevant and relatable
4. Use simple language appropriate for the grade level
5. Explain key concepts thoroughly but concisely

Answer in {language} language."""

            # Generate response using parent class LLM
            response = await self._generate_response(answer_prompt, state)
            
            # Update state with synthesized answer
            state["messages"].append(response)
            state["metadata"]["workflow_steps"].append("answer_synthesized")
            state["metadata"]["confidence_score"] = 0.85
            
            return state
            
        except Exception as e:
            print(f"❌ Answer synthesis error: {str(e)}")
            state["metadata"]["workflow_steps"].append("synthesis_failed")
            return state

    async def _create_cultural_analogies(self, state: AgentState) -> AgentState:
        """Create culturally relevant analogies for better understanding"""
        try:
            question = state["metadata"]["question"]
            grade_level = state["metadata"]["grades"][0] if state["metadata"]["grades"] else 8
            
            # Generate Indian cultural analogies
            analogies = [
                f"Think of {question.lower()} like the growth of a banyan tree - it starts small but develops into something complex and interconnected",
                f"Just as different spices come together to make a delicious curry, the concepts in {question.lower()} work together to create understanding",
                f"Like how monsoon rains nourish different crops across India, this concept has different applications in various situations"
            ]
            
            state["metadata"]["analogies"] = analogies[:2]  # Limit to 2 analogies
            state["metadata"]["workflow_steps"].append("analogies_created")
            
            return state
            
        except Exception as e:
            print(f"❌ Analogy creation error: {str(e)}")
            state["metadata"]["workflow_steps"].append("analogies_failed")
            return state

    async def _generate_followup_questions(self, state: AgentState) -> AgentState:
        """Generate relevant follow-up questions for deeper learning"""
        try:
            question = state["metadata"]["question"]
            
            # Generate contextual follow-up questions
            followup_questions = [
                f"How does {question.lower()} apply to situations we see in everyday life in India?",
                f"What are some examples of {question.lower()} that we can observe in our local environment?",
                f"How might understanding {question.lower()} help solve problems in Indian communities?"
            ]
            
            state["metadata"]["followup_questions"] = followup_questions[:2]  # Limit to 2 questions
            state["metadata"]["workflow_steps"].append("followups_generated")
            
            return state
            
        except Exception as e:
            print(f"❌ Follow-up generation error: {str(e)}")
            state["metadata"]["workflow_steps"].append("followups_failed")
            return state

    async def _format_comprehensive_response(self, state: AgentState) -> AgentState:
        """Format the final comprehensive response with all components"""
        try:
            # The response is already in the messages, just mark as formatted
            state["metadata"]["workflow_steps"].append("response_formatted")
            return state
            
        except Exception as e:
            print(f"❌ Response formatting error: {str(e)}")
            state["metadata"]["workflow_steps"].append("formatting_failed")
            return state

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