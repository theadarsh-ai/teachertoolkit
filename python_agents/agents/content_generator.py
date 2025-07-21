"""
Hyper-Local Content Generation Agent
Creates culturally relevant educational materials in multiple Indian languages
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class ContentGeneratorAgent(BaseEducationalAgent):
    """Agent for generating hyper-local, culturally relevant educational content"""
    
    def __init__(self):
        super().__init__("Hyper-Local Content Generator")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Generate culturally relevant educational content",
            "features": [
                "Multi-language content generation (8+ Indian languages)",
                "NCERT curriculum alignment",
                "Cultural context integration",
                "Grade-appropriate language and complexity",
                "Regional example integration",
                "Festival and tradition incorporation"
            ],
            "output_formats": ["text", "structured_lessons", "activities", "assessments"],
            "specializations": ["cultural_adaptation", "multilingual_content", "local_examples"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the content generation workflow"""
        workflow = StateGraph(AgentState)
        
        # Define workflow nodes
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("analyze_cultural_context", self._analyze_cultural_context)
        workflow.add_node("generate_content_outline", self._generate_content_outline)
        workflow.add_node("create_multilingual_content", self._create_multilingual_content)
        workflow.add_node("adapt_grade_levels", self._adapt_grade_levels)
        workflow.add_node("integrate_cultural_elements", self._integrate_cultural_elements)
        workflow.add_node("finalize", self._finalize_result)
        
        # Define workflow edges
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "analyze_cultural_context")
        workflow.add_edge("analyze_cultural_context", "generate_content_outline")
        workflow.add_edge("generate_content_outline", "create_multilingual_content")
        workflow.add_edge("create_multilingual_content", "adapt_grade_levels")
        workflow.add_edge("adapt_grade_levels", "integrate_cultural_elements")
        workflow.add_edge("integrate_cultural_elements", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _analyze_cultural_context(self, state: AgentState) -> AgentState:
        """Analyze cultural and regional context for content generation"""
        cultural_prompt = f"""
        Analyze the cultural context for educational content generation:
        Topic: {state.prompt}
        Target Grades: {state.grades}
        Languages: {state.languages}
        
        Consider:
        1. Regional cultural relevance
        2. Festival and tradition connections
        3. Local community examples
        4. Historical and geographical context
        5. Social and economic relevance
        
        Provide cultural adaptation recommendations.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=cultural_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["cultural_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "cultural_analysis",
            "status": "completed",
            "message": "Cultural context analyzed"
        })
        
        return state

    def _generate_content_outline(self, state: AgentState) -> AgentState:
        """Generate structured content outline"""
        outline_prompt = f"""
        Create a comprehensive content outline for:
        Topic: {state.prompt}
        Grades: {state.grades}
        Languages: {state.languages}
        Content Source: {state.content_source}
        
        Cultural Context: {state.metadata.get('cultural_analysis', '')}
        
        Generate a structured outline including:
        1. Learning objectives
        2. Key concepts and subtopics
        3. Cultural connections and examples
        4. Activity suggestions
        5. Assessment methods
        6. Resource requirements
        
        Format as a detailed educational outline.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=outline_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["content_outline"] = response.content
        
        state.workflow_steps.append({
            "step": "outline_generation",
            "status": "completed", 
            "message": "Content outline generated"
        })
        
        return state

    def _create_multilingual_content(self, state: AgentState) -> AgentState:
        """Create content in specified languages"""
        multilingual_content = {}
        
        for language in state.languages:
            language_prompt = f"""
            Based on the content outline, create detailed educational content in {language}:
            
            Outline: {state.metadata.get('content_outline', '')}
            
            Requirements:
            - Use appropriate {language} vocabulary for grades {state.grades}
            - Include cultural examples relevant to {language}-speaking regions
            - Maintain educational rigor while being culturally sensitive
            - Use simple, clear language suitable for the target grades
            - Include interactive elements and questions
            
            Create comprehensive educational content in {language}.
            """
            
            messages = [
                SystemMessage(content=f"You are an expert {language} educator specializing in creating culturally relevant content for Indian students."),
                HumanMessage(content=language_prompt)
            ]
            
            response = self.llm.invoke(messages)
            multilingual_content[language] = response.content
        
        state.metadata["multilingual_content"] = multilingual_content
        
        state.workflow_steps.append({
            "step": "multilingual_generation",
            "status": "completed",
            "message": f"Content created in {len(state.languages)} languages"
        })
        
        return state

    def _adapt_grade_levels(self, state: AgentState) -> AgentState:
        """Adapt content for different grade levels"""
        grade_adapted_content = {}
        
        for grade in state.grades:
            adaptation_prompt = f"""
            Adapt the following content for Grade {grade} students:
            
            Original Content: {state.metadata.get('multilingual_content', {})}
            
            Adaptation requirements for Grade {grade}:
            - Adjust vocabulary and complexity level
            - Modify examples to be age-appropriate
            - Ensure cognitive load is suitable
            - Include grade-specific activities
            - Align with Grade {grade} curriculum standards
            
            Create grade-appropriate version.
            """
            
            messages = [
                SystemMessage(content=f"You are an expert in Grade {grade} pedagogy and curriculum design."),
                HumanMessage(content=adaptation_prompt)
            ]
            
            response = self.llm.invoke(messages)
            grade_adapted_content[f"grade_{grade}"] = response.content
        
        state.metadata["grade_adapted_content"] = grade_adapted_content
        
        state.workflow_steps.append({
            "step": "grade_adaptation",
            "status": "completed",
            "message": f"Content adapted for {len(state.grades)} grade levels"
        })
        
        return state

    def _integrate_cultural_elements(self, state: AgentState) -> AgentState:
        """Integrate cultural elements and finalize content"""
        integration_prompt = f"""
        Finalize the educational content by integrating cultural elements:
        
        Grade-Adapted Content: {state.metadata.get('grade_adapted_content', {})}
        Cultural Analysis: {state.metadata.get('cultural_analysis', '')}
        
        Integration tasks:
        1. Add relevant cultural stories and examples
        2. Include festival and tradition connections
        3. Incorporate local geographical and historical references
        4. Add community relevance and practical applications
        5. Ensure sensitivity to diverse cultural backgrounds
        6. Create engaging, culturally rich learning experiences
        
        Produce final, culturally integrated educational content.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=integration_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        state.result = {
            "content": response.content,
            "metadata": {
                "content_type": "culturally_integrated_educational_content",
                "grades_covered": state.grades,
                "languages_included": state.languages,
                "cultural_elements": True,
                "curriculum_alignment": state.content_source
            }
        }
        
        state.workflow_steps.append({
            "step": "cultural_integration",
            "status": "completed",
            "message": "Cultural elements integrated and content finalized"
        })
        
        return state