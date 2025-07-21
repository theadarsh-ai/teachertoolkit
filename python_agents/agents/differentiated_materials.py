"""
Differentiated Materials Agent
Creates materials adapted for multiple grade levels simultaneously
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class DifferentiatedMaterialsAgent(BaseEducationalAgent):
    """Agent for creating differentiated educational materials across grade levels"""
    
    def __init__(self):
        super().__init__("Differentiated Materials Creator")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Create differentiated materials for multiple grade levels",
            "features": [
                "Multi-grade content adaptation",
                "Cognitive load adjustment",
                "Vocabulary level modification",
                "Concept complexity scaling",
                "Activity differentiation",
                "Assessment level variation",
                "Visual support adaptation"
            ],
            "output_formats": ["layered_materials", "grade_specific_versions", "scaffolded_content"],
            "specializations": ["grade_level_adaptation", "cognitive_scaffolding", "complexity_management"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the differentiated materials workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("analyze_content_complexity", self._analyze_content_complexity)
        workflow.add_node("create_base_content", self._create_base_content)
        workflow.add_node("differentiate_by_grade", self._differentiate_by_grade)
        workflow.add_node("create_scaffolding", self._create_scaffolding)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "analyze_content_complexity")
        workflow.add_edge("analyze_content_complexity", "create_base_content")
        workflow.add_edge("create_base_content", "differentiate_by_grade")
        workflow.add_edge("differentiate_by_grade", "create_scaffolding")
        workflow.add_edge("create_scaffolding", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _analyze_content_complexity(self, state: AgentState) -> AgentState:
        """Analyze content complexity for differentiation"""
        complexity_prompt = f"""
        Analyze content complexity for differentiation:
        Content: {state.prompt}
        Target Grades: {state.grades}
        
        Complexity Analysis:
        1. Identify key concepts and their difficulty levels
        2. Determine prerequisite knowledge for each grade
        3. Assess vocabulary complexity requirements
        4. Evaluate cognitive load for different ages
        5. Note abstract vs concrete thinking needs
        6. Identify scaffolding opportunities
        
        Provide detailed complexity analysis for differentiation planning.
        """
        
        messages = [
            SystemMessage(content="You are an expert in cognitive development and educational complexity analysis."),
            HumanMessage(content=complexity_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["complexity_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "complexity_analysis",
            "status": "completed",
            "message": "Content complexity analyzed for differentiation"
        })
        
        return state

    def _create_base_content(self, state: AgentState) -> AgentState:
        """Create foundational content structure"""
        base_content_prompt = f"""
        Create foundational content structure:
        Topic: {state.prompt}
        Complexity Analysis: {state.metadata.get('complexity_analysis', '')}
        
        Base Content Creation:
        1. Core concepts that remain consistent across grades
        2. Essential learning outcomes for all levels
        3. Fundamental vocabulary and terminology
        4. Universal examples and applications
        5. Common assessment criteria
        6. Shared resources and materials
        
        Create comprehensive base content structure.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=base_content_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["base_content"] = response.content
        
        state.workflow_steps.append({
            "step": "base_content_creation",
            "status": "completed",
            "message": "Foundational content structure created"
        })
        
        return state

    def _differentiate_by_grade(self, state: AgentState) -> AgentState:
        """Create grade-specific differentiated versions"""
        differentiated_content = {}
        
        for grade in state.grades:
            differentiation_prompt = f"""
            Create Grade {grade} differentiated version:
            Base Content: {state.metadata.get('base_content', '')}
            Complexity Analysis: {state.metadata.get('complexity_analysis', '')}
            
            Grade {grade} Differentiation:
            1. Adjust vocabulary to grade-appropriate level
            2. Modify concept complexity and depth
            3. Adapt examples to age-relevant contexts
            4. Create grade-specific activities
            5. Design appropriate assessments
            6. Include necessary scaffolding elements
            
            Create complete Grade {grade} version.
            """
            
            messages = [
                SystemMessage(content=f"You are an expert in Grade {grade} pedagogy and age-appropriate content design."),
                HumanMessage(content=differentiation_prompt)
            ]
            
            response = self.llm.invoke(messages)
            differentiated_content[f"grade_{grade}"] = response.content
        
        state.metadata["differentiated_content"] = differentiated_content
        
        state.workflow_steps.append({
            "step": "grade_differentiation",
            "status": "completed",
            "message": f"Created differentiated versions for {len(state.grades)} grade levels"
        })
        
        return state

    def _create_scaffolding(self, state: AgentState) -> AgentState:
        """Create scaffolding and support materials"""
        scaffolding_prompt = f"""
        Create scaffolding and support materials:
        Differentiated Content: {state.metadata.get('differentiated_content', {})}
        
        Scaffolding Creation:
        1. Bridge activities between grade levels
        2. Additional support for struggling learners
        3. Extension activities for advanced students
        4. Visual supports and graphic organizers
        5. Step-by-step guides and checklists
        6. Peer collaboration structures
        
        Compile final differentiated materials package.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational scaffolding and learning support design."),
            HumanMessage(content=scaffolding_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Compile comprehensive differentiated materials
        final_materials = f"""
        DIFFERENTIATED EDUCATIONAL MATERIALS
        
        Topic: {state.prompt}
        Grade Levels: {', '.join(map(str, state.grades))}
        Languages: {', '.join(state.languages)}
        
        GRADE-SPECIFIC VERSIONS:
        {chr(10).join([f"Grade {grade.split('_')[1]}: {content[:200]}..." 
                       for grade, content in state.metadata.get('differentiated_content', {}).items()])}
        
        SCAFFOLDING AND SUPPORT:
        {response.content}
        
        DIFFERENTIATION STRATEGY:
        {state.metadata.get('complexity_analysis', '')}
        """
        
        state.result = {
            "content": final_materials,
            "metadata": {
                "material_type": "differentiated_multi_grade_materials",
                "grades_covered": state.grades,
                "differentiation_levels": len(state.grades),
                "includes_scaffolding": True,
                "adaptation_focus": "cognitive_and_linguistic"
            }
        }
        
        state.workflow_steps.append({
            "step": "scaffolding_creation",
            "status": "completed",
            "message": "Scaffolding materials created and package compiled"
        })
        
        return state