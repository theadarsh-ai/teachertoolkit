"""
Visual Aids Designer Agent
Creates diagrams, flowcharts, and visual learning materials
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class VisualAidsAgent(BaseEducationalAgent):
    """Agent for creating visual learning aids and diagrams"""
    
    def __init__(self):
        super().__init__("Visual Aids Designer")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Create visual learning aids and diagrams",
            "features": [
                "Conceptual diagram design",
                "Flowchart creation",
                "Mind map generation",
                "Infographic layouts",
                "Visual organizer templates",
                "Chart and graph designs",
                "Interactive visual elements"
            ],
            "output_formats": ["diagram_descriptions", "visual_templates", "svg_code", "layout_guides"],
            "specializations": ["concept_mapping", "visual_learning", "diagram_design"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the visual aids workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("analyze_visual_needs", self._analyze_visual_needs)
        workflow.add_node("design_visual_structure", self._design_visual_structure)
        workflow.add_node("create_visual_content", self._create_visual_content)
        workflow.add_node("optimize_for_grades", self._optimize_for_grades)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "analyze_visual_needs")
        workflow.add_edge("analyze_visual_needs", "design_visual_structure")
        workflow.add_edge("design_visual_structure", "create_visual_content")
        workflow.add_edge("create_visual_content", "optimize_for_grades")
        workflow.add_edge("optimize_for_grades", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _analyze_visual_needs(self, state: AgentState) -> AgentState:
        """Analyze visual learning needs"""
        visual_analysis_prompt = f"""
        Analyze visual learning needs:
        Content: {state.prompt}
        Grades: {state.grades}
        
        Visual Analysis:
        1. Identify concepts that benefit from visualization
        2. Determine appropriate visual representation types
        3. Consider age-appropriate visual complexity
        4. Assess cognitive load of visual elements
        5. Plan visual hierarchy and organization
        6. Consider accessibility and inclusivity
        
        Provide visual design recommendations.
        """
        
        messages = [
            SystemMessage(content="You are an expert in visual learning design and educational graphics."),
            HumanMessage(content=visual_analysis_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["visual_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "visual_needs_analysis",
            "status": "completed",
            "message": "Visual learning needs analyzed"
        })
        
        return state

    def _design_visual_structure(self, state: AgentState) -> AgentState:
        """Design the visual structure and layout"""
        structure_prompt = f"""
        Design visual structure and layout:
        Visual Analysis: {state.metadata.get('visual_analysis', '')}
        Content: {state.prompt}
        
        Structure Design:
        1. Create overall visual organization
        2. Design information hierarchy
        3. Plan visual flow and relationships
        4. Determine color coding and visual cues
        5. Design layout for different screen sizes
        6. Plan interactive elements
        
        Create detailed visual structure plan.
        """
        
        messages = [
            SystemMessage(content="You are an expert visual designer specializing in educational materials layout and structure."),
            HumanMessage(content=structure_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["visual_structure"] = response.content
        
        state.workflow_steps.append({
            "step": "visual_structure_design",
            "status": "completed",
            "message": "Visual structure and layout designed"
        })
        
        return state

    def _create_visual_content(self, state: AgentState) -> AgentState:
        """Create detailed visual content specifications"""
        content_creation_prompt = f"""
        Create detailed visual content specifications:
        Visual Structure: {state.metadata.get('visual_structure', '')}
        Topic: {state.prompt}
        Grades: {state.grades}
        
        Visual Content Creation:
        1. Detailed diagram specifications
        2. SVG code for simple graphics
        3. Color schemes and styling
        4. Typography and text placement
        5. Icon and symbol recommendations
        6. Animation and interaction suggestions
        
        Create comprehensive visual content specifications.
        """
        
        messages = [
            SystemMessage(content="You are an expert in creating educational visual content and diagram specifications."),
            HumanMessage(content=content_creation_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["visual_content"] = response.content
        
        state.workflow_steps.append({
            "step": "visual_content_creation",
            "status": "completed",
            "message": "Visual content specifications created"
        })
        
        return state

    def _optimize_for_grades(self, state: AgentState) -> AgentState:
        """Optimize visuals for different grade levels"""
        optimization_prompt = f"""
        Optimize visuals for grade levels:
        Visual Content: {state.metadata.get('visual_content', '')}
        Target Grades: {state.grades}
        
        Grade Optimization:
        1. Adjust visual complexity for each grade
        2. Modify color schemes for age appropriateness
        3. Adapt text size and readability
        4. Simplify or elaborate based on grade level
        5. Include grade-specific examples in visuals
        6. Create implementation guidelines for teachers
        
        Compile final visual aids package.
        """
        
        messages = [
            SystemMessage(content="You are an expert in age-appropriate visual design for educational materials."),
            HumanMessage(content=optimization_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Compile comprehensive visual aids package
        final_visuals = f"""
        VISUAL AIDS DESIGN PACKAGE
        
        Topic: {state.prompt}
        Target Grades: {', '.join(map(str, state.grades))}
        
        VISUAL ANALYSIS AND RECOMMENDATIONS:
        {state.metadata.get('visual_analysis', '')}
        
        VISUAL STRUCTURE AND LAYOUT:
        {state.metadata.get('visual_structure', '')}
        
        DETAILED VISUAL SPECIFICATIONS:
        {state.metadata.get('visual_content', '')}
        
        GRADE-LEVEL OPTIMIZATIONS:
        {response.content}
        
        IMPLEMENTATION GUIDE:
        - Use high contrast colors for better visibility
        - Ensure text is readable at various sizes
        - Consider cultural sensitivity in image choices
        - Provide alternative text for accessibility
        - Test with target age groups for effectiveness
        """
        
        state.result = {
            "content": final_visuals,
            "metadata": {
                "visual_type": "comprehensive_educational_visual_aids",
                "grades_optimized": state.grades,
                "includes_svg": True,
                "accessibility_considered": True,
                "implementation_ready": True
            }
        }
        
        state.workflow_steps.append({
            "step": "grade_optimization",
            "status": "completed",
            "message": "Visual aids optimized for all grade levels"
        })
        
        return state