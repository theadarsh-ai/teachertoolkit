"""
Classroom Analytics Agent
Provides real-time performance monitoring and pacing recommendations
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class ClassroomAnalyticsAgent(BaseEducationalAgent):
    """Agent for classroom analytics and performance monitoring"""
    
    def __init__(self):
        super().__init__("Classroom Analytics")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Provide classroom analytics and performance insights",
            "features": [
                "Real-time performance monitoring",
                "Learning progress tracking",
                "Engagement analytics",
                "Pacing recommendations",
                "Intervention suggestions",
                "Class-wide pattern analysis",
                "Individual student insights"
            ],
            "output_formats": ["analytics_dashboard", "performance_reports", "recommendation_lists", "trend_analysis"],
            "specializations": ["data_analysis", "educational_metrics", "performance_tracking"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the classroom analytics workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("process_performance_data", self._process_performance_data)
        workflow.add_node("analyze_learning_patterns", self._analyze_learning_patterns)
        workflow.add_node("generate_insights", self._generate_insights)
        workflow.add_node("create_recommendations", self._create_recommendations)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "process_performance_data")
        workflow.add_edge("process_performance_data", "analyze_learning_patterns")
        workflow.add_edge("analyze_learning_patterns", "generate_insights")
        workflow.add_edge("generate_insights", "create_recommendations")
        workflow.add_edge("create_recommendations", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _process_performance_data(self, state: AgentState) -> AgentState:
        """Process and analyze performance data"""
        data_processing_prompt = f"""
        Process classroom performance data:
        Analysis Request: {state.prompt}
        Grade Levels: {state.grades}
        Context Data: {state.metadata}
        
        Data Processing Tasks:
        1. Identify key performance indicators
        2. Calculate class averages and distributions
        3. Detect learning pace variations
        4. Identify struggling and advanced students
        5. Analyze engagement patterns
        6. Process assessment data trends
        
        Provide comprehensive data analysis.
        """
        
        messages = [
            SystemMessage(content="You are an expert educational data analyst specializing in classroom performance metrics."),
            HumanMessage(content=data_processing_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["performance_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "performance_data_processing",
            "status": "completed",
            "message": "Performance data processed and analyzed"
        })
        
        return state

    def _analyze_learning_patterns(self, state: AgentState) -> AgentState:
        """Analyze learning patterns and trends"""
        pattern_analysis_prompt = f"""
        Analyze learning patterns:
        Performance Analysis: {state.metadata.get('performance_analysis', '')}
        Request: {state.prompt}
        Grades: {state.grades}
        
        Pattern Analysis:
        1. Identify learning progression patterns
        2. Detect common misconceptions or difficulties
        3. Analyze participation and engagement trends
        4. Identify successful teaching strategies
        5. Recognize at-risk students early
        6. Track skill development across time
        
        Provide detailed pattern analysis.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational pattern recognition and learning analytics."),
            HumanMessage(content=pattern_analysis_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["learning_patterns"] = response.content
        
        state.workflow_steps.append({
            "step": "learning_pattern_analysis",
            "status": "completed",
            "message": "Learning patterns and trends analyzed"
        })
        
        return state

    def _generate_insights(self, state: AgentState) -> AgentState:
        """Generate actionable insights from analysis"""
        insights_prompt = f"""
        Generate actionable insights:
        Performance Analysis: {state.metadata.get('performance_analysis', '')}
        Learning Patterns: {state.metadata.get('learning_patterns', '')}
        
        Insight Generation:
        1. Key findings about class performance
        2. Critical success factors identified
        3. Areas needing immediate attention
        4. Positive trends to reinforce
        5. Predictive indicators for future performance
        6. Comparative analysis with grade-level expectations
        
        Generate comprehensive insights.
        """
        
        messages = [
            SystemMessage(content="You are an expert educational consultant specializing in actionable classroom insights."),
            HumanMessage(content=insights_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["insights"] = response.content
        
        state.workflow_steps.append({
            "step": "insight_generation",
            "status": "completed",
            "message": "Actionable insights generated from analysis"
        })
        
        return state

    def _create_recommendations(self, state: AgentState) -> AgentState:
        """Create specific recommendations for improvement"""
        recommendations_prompt = f"""
        Create specific recommendations:
        Insights: {state.metadata.get('insights', '')}
        Context: Multi-grade classroom, Grades {state.grades}
        
        Recommendation Categories:
        1. Immediate interventions needed
        2. Pacing adjustments for different groups
        3. Differentiation strategies
        4. Student support interventions
        5. Curriculum emphasis adjustments
        6. Assessment and feedback improvements
        
        Compile comprehensive analytics report.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=recommendations_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Compile comprehensive analytics report
        final_analytics_report = f"""
        CLASSROOM ANALYTICS REPORT
        
        Analysis Subject: {state.prompt}
        Grade Levels: {', '.join(map(str, state.grades))}
        Analysis Date: Current Session
        
        PERFORMANCE DATA ANALYSIS:
        {state.metadata.get('performance_analysis', '')}
        
        LEARNING PATTERNS IDENTIFIED:
        {state.metadata.get('learning_patterns', '')}
        
        KEY INSIGHTS:
        {state.metadata.get('insights', '')}
        
        RECOMMENDATIONS AND ACTION ITEMS:
        {response.content}
        
        MONITORING PLAN:
        1. Weekly progress check-ins with identified students
        2. Bi-weekly assessment of implemented strategies
        3. Monthly review of class-wide trends
        4. Quarterly comprehensive performance evaluation
        5. Continuous engagement monitoring
        6. Regular parent communication for at-risk students
        
        SUCCESS METRICS:
        - Improved assessment scores by target percentage
        - Increased class participation rates
        - Reduced learning gaps between grade levels
        - Enhanced student engagement indicators
        - Positive feedback from student self-assessments
        """
        
        state.result = {
            "content": final_analytics_report,
            "metadata": {
                "report_type": "comprehensive_classroom_analytics",
                "grades_analyzed": state.grades,
                "includes_recommendations": True,
                "includes_monitoring_plan": True,
                "actionable_insights": True
            }
        }
        
        state.workflow_steps.append({
            "step": "recommendation_creation",
            "status": "completed",
            "message": "Comprehensive analytics report with recommendations created"
        })
        
        return state