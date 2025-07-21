"""
AI Lesson Planner Agent
Creates comprehensive, adaptive lesson plans for multi-grade classrooms
"""
from typing import Dict, List, Any, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class LessonPlannerAgent(BaseEducationalAgent):
    """Agent for creating comprehensive lesson plans with multi-grade support"""
    
    def __init__(self):
        super().__init__("AI Lesson Planner")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Create comprehensive, adaptive lesson plans",
            "features": [
                "Multi-grade lesson planning",
                "Curriculum alignment (NCERT/External)",
                "Differentiated instruction strategies",
                "Assessment integration",
                "Resource planning",
                "Timeline and pacing guides",
                "Activity sequencing",
                "Learning objective mapping"
            ],
            "output_formats": ["detailed_plan", "timeline", "activity_guide", "assessment_rubric"],
            "specializations": ["multi_grade_adaptation", "curriculum_alignment", "differentiated_learning"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the lesson planning workflow"""
        workflow = StateGraph(AgentState)
        
        # Define workflow nodes
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("curriculum_analysis", self._analyze_curriculum_alignment)
        workflow.add_node("learning_objectives", self._define_learning_objectives)
        workflow.add_node("differentiation_strategy", self._plan_differentiation_strategy)
        workflow.add_node("activity_sequencing", self._sequence_activities)
        workflow.add_node("assessment_planning", self._plan_assessments)
        workflow.add_node("resource_planning", self._plan_resources)
        workflow.add_node("timeline_creation", self._create_timeline)
        workflow.add_node("finalize", self._finalize_result)
        
        # Define workflow edges
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "curriculum_analysis")
        workflow.add_edge("curriculum_analysis", "learning_objectives")
        workflow.add_edge("learning_objectives", "differentiation_strategy")
        workflow.add_edge("differentiation_strategy", "activity_sequencing")
        workflow.add_edge("activity_sequencing", "assessment_planning")
        workflow.add_edge("assessment_planning", "resource_planning")
        workflow.add_edge("resource_planning", "timeline_creation")
        workflow.add_edge("timeline_creation", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _analyze_curriculum_alignment(self, state: AgentState) -> AgentState:
        """Analyze curriculum alignment and standards"""
        curriculum_prompt = f"""
        Analyze curriculum alignment for lesson planning:
        Topic: {state.prompt}
        Grades: {state.grades}
        Content Source: {state.content_source}
        Languages: {state.languages}
        
        Analysis requirements:
        1. Identify relevant curriculum standards for each grade
        2. Map learning objectives to curriculum requirements
        3. Determine prerequisite knowledge and skills
        4. Identify cross-curricular connections
        5. Note assessment expectations
        6. Consider scope and sequence alignment
        
        Provide detailed curriculum analysis for lesson planning.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=curriculum_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["curriculum_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "curriculum_analysis",
            "status": "completed",
            "message": "Curriculum alignment analyzed"
        })
        
        return state

    def _define_learning_objectives(self, state: AgentState) -> AgentState:
        """Define clear learning objectives for all grade levels"""
        objectives_prompt = f"""
        Define comprehensive learning objectives:
        Topic: {state.prompt}
        Grades: {state.grades}
        Curriculum Analysis: {state.metadata.get('curriculum_analysis', '')}
        
        Create learning objectives that are:
        1. Specific and measurable
        2. Grade-appropriate and differentiated
        3. Aligned with curriculum standards
        4. Bloom's taxonomy compliant
        5. Observable and assessable
        6. Culturally relevant
        
        Format objectives by grade level and cognitive domain.
        """
        
        messages = [
            SystemMessage(content="You are an expert instructional designer specializing in learning objective development."),
            HumanMessage(content=objectives_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["learning_objectives"] = response.content
        
        state.workflow_steps.append({
            "step": "learning_objectives",
            "status": "completed",
            "message": "Learning objectives defined"
        })
        
        return state

    def _plan_differentiation_strategy(self, state: AgentState) -> AgentState:
        """Plan differentiated instruction strategies"""
        differentiation_prompt = f"""
        Plan differentiation strategies for multi-grade classroom:
        Grades: {state.grades}
        Learning Objectives: {state.metadata.get('learning_objectives', '')}
        
        Differentiation planning:
        1. Content differentiation by grade level
        2. Process variations for different learning styles
        3. Product options for diverse abilities
        4. Learning environment adaptations
        5. Grouping strategies for multi-grade classes
        6. Individual accommodation strategies
        
        Create comprehensive differentiation plan.
        """
        
        messages = [
            SystemMessage(content="You are an expert in differentiated instruction and multi-grade teaching strategies."),
            HumanMessage(content=differentiation_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["differentiation_strategy"] = response.content
        
        state.workflow_steps.append({
            "step": "differentiation_planning",
            "status": "completed",
            "message": "Differentiation strategies planned"
        })
        
        return state

    def _sequence_activities(self, state: AgentState) -> AgentState:
        """Sequence learning activities optimally"""
        sequencing_prompt = f"""
        Sequence learning activities for the lesson:
        Topic: {state.prompt}
        Learning Objectives: {state.metadata.get('learning_objectives', '')}
        Differentiation Strategy: {state.metadata.get('differentiation_strategy', '')}
        
        Activity sequencing:
        1. Opening/engagement activities
        2. Direct instruction segments
        3. Guided practice activities
        4. Independent work opportunities
        5. Collaborative learning experiences
        6. Closure and reflection activities
        
        Sequence activities with timing and transitions.
        """
        
        messages = [
            SystemMessage(content="You are an expert in pedagogical sequencing and activity design."),
            HumanMessage(content=sequencing_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["activity_sequence"] = response.content
        
        state.workflow_steps.append({
            "step": "activity_sequencing",
            "status": "completed",
            "message": "Learning activities sequenced"
        })
        
        return state

    def _plan_assessments(self, state: AgentState) -> AgentState:
        """Plan formative and summative assessments"""
        assessment_prompt = f"""
        Plan comprehensive assessments:
        Learning Objectives: {state.metadata.get('learning_objectives', '')}
        Activity Sequence: {state.metadata.get('activity_sequence', '')}
        Grades: {state.grades}
        
        Assessment planning:
        1. Formative assessment strategies
        2. Summative assessment design
        3. Grade-specific assessment criteria
        4. Rubrics and scoring guides
        5. Alternative assessment options
        6. Self and peer assessment opportunities
        
        Create detailed assessment plan.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational assessment and evaluation."),
            HumanMessage(content=assessment_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["assessment_plan"] = response.content
        
        state.workflow_steps.append({
            "step": "assessment_planning",
            "status": "completed",
            "message": "Assessment strategies planned"
        })
        
        return state

    def _plan_resources(self, state: AgentState) -> AgentState:
        """Plan required resources and materials"""
        resource_prompt = f"""
        Plan resources and materials needed:
        Activity Sequence: {state.metadata.get('activity_sequence', '')}
        Assessment Plan: {state.metadata.get('assessment_plan', '')}
        Grades: {state.grades}
        Languages: {state.languages}
        
        Resource planning:
        1. Teaching materials and supplies
        2. Technology requirements
        3. Reference materials and books
        4. Visual aids and manipulatives
        5. Preparation time and setup needs
        6. Alternative resources for limited settings
        
        Create comprehensive resource list.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational resource planning and classroom management."),
            HumanMessage(content=resource_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["resource_plan"] = response.content
        
        state.workflow_steps.append({
            "step": "resource_planning",
            "status": "completed",
            "message": "Resources and materials planned"
        })
        
        return state

    def _create_timeline(self, state: AgentState) -> AgentState:
        """Create detailed lesson timeline and pacing guide"""
        timeline_prompt = f"""
        Create detailed lesson timeline:
        Activity Sequence: {state.metadata.get('activity_sequence', '')}
        Resource Plan: {state.metadata.get('resource_plan', '')}
        
        Timeline creation:
        1. Detailed minute-by-minute schedule
        2. Transition time allocations
        3. Differentiation time blocks
        4. Assessment checkpoints
        5. Flexibility and adjustment points
        6. Extension and enrichment timing
        
        Compile comprehensive lesson plan with all components.
        """
        
        messages = [
            SystemMessage(content="You are an expert lesson planner specializing in time management and pacing."),
            HumanMessage(content=timeline_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Compile final lesson plan
        final_plan = f"""
        COMPREHENSIVE LESSON PLAN
        
        Topic: {state.prompt}
        Grades: {', '.join(map(str, state.grades))}
        Languages: {', '.join(state.languages)}
        Content Source: {state.content_source.upper()}
        
        {response.content}
        
        SUPPORTING COMPONENTS:
        
        Learning Objectives:
        {state.metadata.get('learning_objectives', '')}
        
        Differentiation Strategies:
        {state.metadata.get('differentiation_strategy', '')}
        
        Assessment Plan:
        {state.metadata.get('assessment_plan', '')}
        
        Resource Requirements:
        {state.metadata.get('resource_plan', '')}
        """
        
        state.result = {
            "content": final_plan,
            "metadata": {
                "lesson_type": "comprehensive_multi_grade_plan",
                "grades_covered": state.grades,
                "duration_estimated": "45-60 minutes",
                "includes_differentiation": True,
                "includes_assessment": True,
                "resource_requirements": "detailed"
            }
        }
        
        state.workflow_steps.append({
            "step": "timeline_creation",
            "status": "completed",
            "message": "Lesson timeline and final plan created"
        })
        
        return state

    async def create_lesson_plan(self, topic: str, grades: List[int], duration: str, 
                               languages: List[str] = ["English"], 
                               content_source: str = "prebook") -> Dict[str, Any]:
        """Create a comprehensive lesson plan"""
        return await self.process(
            prompt=f"Create a comprehensive lesson plan for: {topic} (Duration: {duration})",
            grades=grades,
            languages=languages,
            content_source=content_source,
            metadata={"duration": duration}
        )