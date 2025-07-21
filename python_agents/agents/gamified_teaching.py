"""
Gamified Teaching Agent
Creates educational games, badges, and interactive learning experiences
"""
from typing import Dict, List, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from .base_agent import BaseEducationalAgent, AgentState

class GamifiedTeachingAgent(BaseEducationalAgent):
    """Agent for creating gamified educational experiences"""
    
    def __init__(self):
        super().__init__("Gamified Teaching Designer")

    def get_capabilities(self) -> Dict[str, Any]:
        return {
            "primary_function": "Create gamified educational experiences",
            "features": [
                "Educational game design",
                "Badge and achievement systems",
                "Interactive challenges",
                "Progress tracking mechanics",
                "Leaderboard systems",
                "Quest-based learning",
                "Reward mechanisms"
            ],
            "output_formats": ["game_specifications", "challenge_designs", "reward_systems", "engagement_mechanics"],
            "specializations": ["game_mechanics", "motivation_systems", "interactive_learning"]
        }

    def _build_graph(self) -> StateGraph:
        """Build the gamified teaching workflow"""
        workflow = StateGraph(AgentState)
        
        workflow.add_node("initialize", self._initialize_state)
        workflow.add_node("validate", self._validate_input)
        workflow.add_node("analyze_context", self._analyze_context)
        workflow.add_node("analyze_gamification_needs", self._analyze_gamification_needs)
        workflow.add_node("design_game_mechanics", self._design_game_mechanics)
        workflow.add_node("create_challenges", self._create_challenges)
        workflow.add_node("design_reward_system", self._design_reward_system)
        workflow.add_node("finalize", self._finalize_result)
        
        workflow.set_entry_point("initialize")
        workflow.add_edge("initialize", "validate")
        workflow.add_edge("validate", "analyze_context")
        workflow.add_edge("analyze_context", "analyze_gamification_needs")
        workflow.add_edge("analyze_gamification_needs", "design_game_mechanics")
        workflow.add_edge("design_game_mechanics", "create_challenges")
        workflow.add_edge("create_challenges", "design_reward_system")
        workflow.add_edge("design_reward_system", "finalize")
        workflow.add_edge("finalize", END)
        
        return workflow.compile()

    def _analyze_gamification_needs(self, state: AgentState) -> AgentState:
        """Analyze gamification needs and opportunities"""
        gamification_prompt = f"""
        Analyze gamification needs:
        Educational Content: {state.prompt}
        Target Grades: {state.grades}
        
        Gamification Analysis:
        1. Identify learning objectives suitable for gamification
        2. Assess student motivation factors for these grades
        3. Determine appropriate game mechanics
        4. Consider cultural preferences and sensitivities
        5. Evaluate technology requirements
        6. Plan engagement sustainability strategies
        
        Provide gamification strategy recommendations.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational gamification and student engagement strategies."),
            HumanMessage(content=gamification_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["gamification_analysis"] = response.content
        
        state.workflow_steps.append({
            "step": "gamification_analysis",
            "status": "completed",
            "message": "Gamification needs and opportunities analyzed"
        })
        
        return state

    def _design_game_mechanics(self, state: AgentState) -> AgentState:
        """Design core game mechanics"""
        mechanics_prompt = f"""
        Design game mechanics:
        Gamification Analysis: {state.metadata.get('gamification_analysis', '')}
        Educational Content: {state.prompt}
        Target Grades: {state.grades}
        
        Game Mechanics Design:
        1. Core gameplay loop
        2. Progress tracking systems
        3. Point and scoring mechanisms
        4. Level progression structures
        5. Collaboration vs competition balance
        6. Feedback and recognition systems
        
        Create detailed game mechanics specifications.
        """
        
        messages = [
            SystemMessage(content="You are an expert game designer specializing in educational game mechanics."),
            HumanMessage(content=mechanics_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["game_mechanics"] = response.content
        
        state.workflow_steps.append({
            "step": "game_mechanics_design",
            "status": "completed",
            "message": "Core game mechanics designed"
        })
        
        return state

    def _create_challenges(self, state: AgentState) -> AgentState:
        """Create specific educational challenges and activities"""
        challenges_prompt = f"""
        Create educational challenges:
        Game Mechanics: {state.metadata.get('game_mechanics', '')}
        Educational Content: {state.prompt}
        Grades: {state.grades}
        
        Challenge Creation:
        1. Design specific learning challenges
        2. Create progressive difficulty levels
        3. Include collaborative challenges
        4. Design individual skill challenges
        5. Create creative expression challenges
        6. Include real-world application challenges
        
        Create comprehensive challenge system.
        """
        
        messages = [
            SystemMessage(content=self.get_indian_context_prompt(state.content_source)),
            HumanMessage(content=challenges_prompt)
        ]
        
        response = self.llm.invoke(messages)
        state.metadata["challenges"] = response.content
        
        state.workflow_steps.append({
            "step": "challenge_creation",
            "status": "completed",
            "message": "Educational challenges and activities created"
        })
        
        return state

    def _design_reward_system(self, state: AgentState) -> AgentState:
        """Design comprehensive reward and recognition system"""
        rewards_prompt = f"""
        Design reward and recognition system:
        Game Mechanics: {state.metadata.get('game_mechanics', '')}
        Challenges: {state.metadata.get('challenges', '')}
        Target Grades: {state.grades}
        
        Reward System Design:
        1. Badge and achievement system
        2. Progress visualization methods
        3. Leaderboard and ranking systems
        4. Virtual currency or tokens
        5. Unlockable content and features
        6. Recognition ceremonies and celebrations
        
        Compile complete gamified learning system.
        """
        
        messages = [
            SystemMessage(content="You are an expert in educational reward systems and student motivation."),
            HumanMessage(content=rewards_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Compile comprehensive gamified teaching system
        final_game_system = f"""
        GAMIFIED TEACHING SYSTEM
        
        Educational Topic: {state.prompt}
        Target Grades: {', '.join(map(str, state.grades))}
        Languages: {', '.join(state.languages)}
        
        GAMIFICATION STRATEGY:
        {state.metadata.get('gamification_analysis', '')}
        
        CORE GAME MECHANICS:
        {state.metadata.get('game_mechanics', '')}
        
        EDUCATIONAL CHALLENGES:
        {state.metadata.get('challenges', '')}
        
        REWARD AND RECOGNITION SYSTEM:
        {response.content}
        
        IMPLEMENTATION GUIDELINES:
        1. Start with simple mechanics and gradually add complexity
        2. Ensure educational objectives remain primary focus
        3. Monitor engagement levels and adjust accordingly
        4. Provide both individual and collaborative opportunities
        5. Celebrate diverse types of achievements
        6. Maintain cultural sensitivity in all game elements
        
        ASSESSMENT INTEGRATION:
        - Use game performance as formative assessment
        - Track learning progress through game analytics
        - Provide detailed feedback through game interactions
        - Create portfolios of game-based achievements
        """
        
        state.result = {
            "content": final_game_system,
            "metadata": {
                "system_type": "comprehensive_gamified_learning_system",
                "grades_covered": state.grades,
                "includes_badges": True,
                "includes_challenges": True,
                "includes_rewards": True,
                "culturally_appropriate": True
            }
        }
        
        state.workflow_steps.append({
            "step": "reward_system_design",
            "status": "completed",
            "message": "Complete gamified teaching system created"
        })
        
        return state