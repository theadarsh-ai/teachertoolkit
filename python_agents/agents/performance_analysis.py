"""
Performance Analysis Agent
Provides personalized learning path recommendations and performance insights
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class PerformanceAnalysisAgent(BaseEducationalAgent):
    """Agent for comprehensive student performance analysis and recommendations"""
    
    def __init__(self):
        super().__init__("Performance Analysis & Recommendations")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Analyze student performance and provide personalized recommendations",
            "features": [
                "Comprehensive performance analysis",
                "Learning style identification",
                "Personalized learning path creation",
                "Strength and weakness assessment",
                "Intervention recommendations",
                "Progress prediction modeling",
                "Parent communication summaries"
            ],
            "output_formats": ["performance_report", "learning_path", "intervention_plan", "progress_forecast"],
            "specializations": ["data_analysis", "learning_personalization", "educational_psychology"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the performance analysis workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("process_performance_data", self._process_performance_data)
        workflow.add_node("identify_learning_patterns", self._identify_learning_patterns)
        workflow.add_node("analyze_strengths_weaknesses", self._analyze_strengths_weaknesses)
        workflow.add_node("create_personalized_recommendations", self._create_personalized_recommendations)
        workflow.add_node("design_learning_path", self._design_learning_path)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "process_performance_data")
        workflow.add_edge("process_performance_data", "identify_learning_patterns")
        workflow.add_edge("identify_learning_patterns", "analyze_strengths_weaknesses")
        workflow.add_edge("analyze_strengths_weaknesses", "create_personalized_recommendations")
        workflow.add_edge("create_personalized_recommendations", "design_learning_path")
        workflow.add_edge("design_learning_path", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _process_performance_data(self, state: AgentState) -> AgentState:
        """Process student performance data comprehensively"""
        data_processing_prompt = f"""
        Process comprehensive performance data:
        Student Data: {state.prompt}
        Grade Levels: {state.grades}
        Analysis Context: {state.metadata}
        
        Data Processing Tasks:
        1. Analyze academic achievement patterns
        2. Evaluate learning progression over time
        3. Identify engagement and participation trends
        4. Assess skill development across subjects
        5. Compare performance to grade-level expectations
        6. Identify critical learning gaps
        
        Provide comprehensive performance analysis.
        """
        
        messages = [
            SystemMessage(content="You are an expert educational psychologist specializing in student performance analysis."),
            HumanMessage(content=data_processing_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["performance_data_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "performance_data_processing",
            "status": "completed",
            "message": "Comprehensive performance data processed"
        })
        
        return state

    def _identify_learning_patterns(self, state: AgentState) -> AgentState:
        """Identify individual learning patterns and preferences"""
        pattern_identification_prompt = f"""
        Identify learning patterns and preferences:
        Performance Analysis: {state.metadata.get('performance_data_analysis', '')}
        Student Context: {state.prompt}
        Grade Levels: {state.grades}
        
        Learning Pattern Analysis:
        1. Identify preferred learning modalities
        2. Recognize optimal learning conditions
        3. Determine effective teaching strategies
        4. Identify motivation triggers
        5. Assess cognitive processing preferences
        6. Recognize social learning preferences
        
        Provide detailed learning pattern analysis.
        """
        
        messages = [
            SystemMessage(content="You are an expert in learning styles and educational psychology."),
            HumanMessage(content=pattern_identification_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["learning_patterns"] = response.content
        
        state.workflow_steps.append({
            "step": "learning_pattern_identification",
            "status": "completed",
            "message": "Individual learning patterns identified"
        })
        
        return state

    def _analyze_strengths_weaknesses(self, state: AgentState) -> AgentState:
        """Analyze student strengths and areas for improvement"""
        strength_analysis_prompt = f"""
        Analyze strengths and areas for improvement:
        Performance Data: {state.metadata.get('performance_data_analysis', '')}
        Learning Patterns: {state.metadata.get('learning_patterns', '')}
        
        Strengths and Weaknesses Analysis:
        1. Identify academic strengths and talents
        2. Recognize areas needing improvement
        3. Assess transferable skills and abilities
        4. Identify hidden potential areas
        5. Recognize emotional and social strengths
        6. Prioritize intervention areas
        
        Provide comprehensive strengths and improvement areas analysis.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational assessment and student development."),
            HumanMessage(content=strength_analysis_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["strengths_weaknesses"] = response.content
        
        state.workflow_steps.append({
            "step": "strengths_weaknesses_analysis",
            "status": "completed",
            "message": "Student strengths and improvement areas analyzed"
        })
        
        return state

    def _create_personalized_recommendations(self, state: AgentState) -> AgentState:
        """Create personalized intervention and support recommendations"""
        recommendations_prompt = f"""
        Create personalized recommendations:
        Strengths/Weaknesses: {state.metadata.get('strengths_weaknesses', '')}
        Learning Patterns: {state.metadata.get('learning_patterns', '')}
        Grade Levels: {state.grades}
        
        Personalized Recommendations:
        1. Specific intervention strategies
        2. Learning support accommodations
        3. Enrichment and extension opportunities
        4. Teaching strategy adjustments
        5. Assessment modification suggestions
        6. Home support recommendations
        
        Create comprehensive, actionable recommendations.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=recommendations_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["personalized_recommendations"] = response.content
        
        state.workflow_steps.append({
            "step": "personalized_recommendations_creation",
            "status": "completed",
            "message": "Personalized recommendations created"
        })
        
        return state

    def _design_learning_path(self, state: AgentState) -> AgentState:
        """Design comprehensive personalized learning path"""
        learning_path_prompt = f"""
        Design personalized learning path:
        Recommendations: {state.metadata.get('personalized_recommendations', '')}
        Student Context: {state.prompt}
        Grade Levels: {state.grades}
        Languages: {state.languages}
        
        Learning Path Design:
        1. Short-term learning goals (1-3 months)
        2. Medium-term objectives (3-6 months)
        3. Long-term aspirations (6-12 months)
        4. Specific skill development sequence
        5. Milestone checkpoints and assessments
        6. Adaptive path modifications based on progress
        
        Compile complete performance analysis report.
        """
        
        messages = [
            SystemMessage(content="You are an expert in personalized learning design and educational planning."),
            HumanMessage(content=learning_path_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Compile comprehensive performance analysis report
        final_analysis_report = f"""
        COMPREHENSIVE PERFORMANCE ANALYSIS & LEARNING PATH
        
        Student Analysis Focus: {state.prompt}
        Grade Levels: {', '.join(map(str, state.grades))}
        Analysis Date: Current Session
        
        PERFORMANCE DATA ANALYSIS:
        {state.metadata.get('performance_data_analysis', '')}
        
        LEARNING PATTERNS AND PREFERENCES:
        {state.metadata.get('learning_patterns', '')}
        
        STRENGTHS AND IMPROVEMENT AREAS:
        {state.metadata.get('strengths_weaknesses', '')}
        
        PERSONALIZED RECOMMENDATIONS:
        {state.metadata.get('personalized_recommendations', '')}
        
        CUSTOMIZED LEARNING PATH:
        {response.content}
        
        MONITORING AND EVALUATION PLAN:
        1. Weekly progress check-ins with specific focus areas
        2. Bi-weekly assessment of strategy effectiveness
        3. Monthly comprehensive review and path adjustments
        4. Quarterly parent-teacher-student conferences
        5. Continuous engagement and motivation monitoring
        6. Regular celebration of achievements and milestones
        
        COMMUNICATION GUIDELINES:
        - Use positive, strength-based language
        - Focus on growth and improvement potential
        - Provide specific, actionable feedback
        - Encourage self-reflection and goal setting
        - Maintain regular communication with all stakeholders
        - Celebrate progress and achievements regularly
        """
        
        state.result = {
            "content": final_analysis_report,
            "metadata": {
                "analysis_type": "comprehensive_performance_analysis_with_learning_path",
                "grades_covered": state.grades,
                "includes_recommendations": True,
                "includes_learning_path": True,
                "personalized": True,
                "culturally_appropriate": True
            }
        }
        
        state.workflow_steps.append({
            "step": "learning_path_design",
            "status": "completed",
            "message": "Comprehensive performance analysis and learning path completed"
        })
        
        return state

    async def analyze_performance(self, student_data: Dict[str, Any], grades: List[int], 
                                 subject: str) -> Dict[str, Any]:
        """Analyze student performance and create recommendations"""
        return await self.process(
            prompt=f"Analyze performance data for {subject}: {student_data}",
            grades=grades,
            languages=["English"],
            content_source="prebook",
            metadata={"subject": subject, "student_data": student_data}
        )