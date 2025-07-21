"""
Audio Reading Assessment Agent
Evaluates reading and speaking skills through voice analysis
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class AudioAssessmentAgent(BaseEducationalAgent):
    """Agent for audio-based reading and speaking assessment"""
    
    def __init__(self):
        super().__init__("Audio Reading Assessment")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Evaluate reading and speaking skills through audio analysis",
            "features": [
                "Reading fluency assessment",
                "Pronunciation evaluation",
                "Speaking clarity analysis",
                "Pace and rhythm assessment",
                "Multilingual audio evaluation",
                "Progress tracking over time",
                "Personalized feedback generation"
            ],
            "output_formats": ["assessment_report", "feedback_summary", "improvement_plan", "progress_chart"],
            "specializations": ["audio_analysis", "reading_assessment", "speaking_evaluation"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the audio assessment workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("setup_assessment_criteria", self._setup_assessment_criteria)
        workflow.add_node("analyze_audio_requirements", self._analyze_audio_requirements)
        workflow.add_node("create_assessment_rubric", self._create_assessment_rubric)
        workflow.add_node("generate_feedback_framework", self._generate_feedback_framework)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "setup_assessment_criteria")
        workflow.add_edge("setup_assessment_criteria", "analyze_audio_requirements")
        workflow.add_edge("analyze_audio_requirements", "create_assessment_rubric")
        workflow.add_edge("create_assessment_rubric", "generate_feedback_framework")
        workflow.add_edge("generate_feedback_framework", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _setup_assessment_criteria(self, state: AgentState) -> AgentState:
        """Setup assessment criteria for audio evaluation"""
        criteria_prompt = f"""
        Setup audio assessment criteria:
        Assessment Focus: {state.prompt}
        Grade Levels: {state.grades}
        Languages: {state.languages}
        
        Assessment Criteria Setup:
        1. Reading fluency benchmarks for each grade
        2. Pronunciation accuracy standards
        3. Speaking clarity expectations
        4. Pace and rhythm guidelines
        5. Language-specific assessment criteria
        6. Cultural sensitivity considerations
        
        Create comprehensive assessment criteria.
        """
        
        messages = [
            SystemMessage(content="You are an expert in reading and speaking assessment, specializing in multilingual evaluation."),
            HumanMessage(content=criteria_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["assessment_criteria"] = response.content
        
        state.workflow_steps.append({
            "step": "assessment_criteria_setup",
            "status": "completed",
            "message": "Audio assessment criteria established"
        })
        
        return state

    def _analyze_audio_requirements(self, state: AgentState) -> AgentState:
        """Analyze technical and pedagogical audio requirements"""
        audio_analysis_prompt = f"""
        Analyze audio assessment requirements:
        Assessment Criteria: {state.metadata.get('assessment_criteria', '')}
        Grades: {state.grades}
        Languages: {state.languages}
        
        Audio Analysis Requirements:
        1. Technical specifications for audio recording
        2. Minimum quality standards for assessment
        3. Duration requirements for different grade levels
        4. Content types suitable for audio assessment
        5. Environmental considerations for recording
        6. Accessibility accommodations needed
        
        Provide comprehensive audio requirements analysis.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational audio technology and assessment methodology."),
            HumanMessage(content=audio_analysis_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["audio_requirements"] = response.content
        
        state.workflow_steps.append({
            "step": "audio_requirements_analysis",
            "status": "completed",
            "message": "Audio technical and pedagogical requirements analyzed"
        })
        
        return state

    def _create_assessment_rubric(self, state: AgentState) -> AgentState:
        """Create detailed assessment rubric"""
        rubric_prompt = f"""
        Create comprehensive assessment rubric:
        Assessment Criteria: {state.metadata.get('assessment_criteria', '')}
        Audio Requirements: {state.metadata.get('audio_requirements', '')}
        Target Grades: {state.grades}
        
        Rubric Creation:
        1. Detailed scoring criteria for each assessment dimension
        2. Grade-specific performance expectations
        3. Language-specific evaluation standards
        4. Holistic and analytical scoring options
        5. Progress tracking indicators
        6. Intervention trigger points
        
        Create detailed, actionable assessment rubric.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=rubric_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["assessment_rubric"] = response.content
        
        state.workflow_steps.append({
            "step": "assessment_rubric_creation",
            "status": "completed",
            "message": "Comprehensive assessment rubric created"
        })
        
        return state

    def _generate_feedback_framework(self, state: AgentState) -> AgentState:
        """Generate personalized feedback framework"""
        feedback_prompt = f"""
        Generate personalized feedback framework:
        Assessment Rubric: {state.metadata.get('assessment_rubric', '')}
        Target Grades: {state.grades}
        Languages: {state.languages}
        
        Feedback Framework:
        1. Constructive feedback templates
        2. Strength recognition strategies
        3. Improvement area identification
        4. Actionable next steps guidance
        5. Parent communication templates
        6. Self-assessment tools for students
        
        Compile complete audio assessment system.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational feedback and student communication."),
            HumanMessage(content=feedback_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Compile comprehensive audio assessment system
        final_assessment_system = f"""
        AUDIO READING ASSESSMENT SYSTEM
        
        Assessment Focus: {state.prompt}
        Grade Levels: {', '.join(map(str, state.grades))}
        Languages Supported: {', '.join(state.languages)}
        
        ASSESSMENT CRITERIA AND STANDARDS:
        {state.metadata.get('assessment_criteria', '')}
        
        TECHNICAL AND PEDAGOGICAL REQUIREMENTS:
        {state.metadata.get('audio_requirements', '')}
        
        COMPREHENSIVE ASSESSMENT RUBRIC:
        {state.metadata.get('assessment_rubric', '')}
        
        PERSONALIZED FEEDBACK FRAMEWORK:
        {response.content}
        
        IMPLEMENTATION GUIDELINES:
        1. Ensure quiet recording environment
        2. Use consistent recording equipment
        3. Provide clear instructions to students
        4. Allow practice sessions before assessment
        5. Consider cultural and linguistic backgrounds
        6. Maintain supportive, encouraging atmosphere
        
        PROGRESS TRACKING:
        - Baseline assessment establishment
        - Regular progress monitoring
        - Goal setting and achievement tracking
        - Parent and teacher communication protocols
        - Student self-reflection integration
        """
        
        state.result = {
            "content": final_assessment_system,
            "metadata": {
                "assessment_type": "comprehensive_audio_reading_assessment",
                "grades_supported": state.grades,
                "languages_supported": state.languages,
                "includes_rubric": True,
                "includes_feedback": True,
                "multilingual_capable": True
            }
        }
        
        state.workflow_steps.append({
            "step": "feedback_framework_generation",
            "status": "completed",
            "message": "Complete audio assessment system with feedback framework created"
        })
        
        return state