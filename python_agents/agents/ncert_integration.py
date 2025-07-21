"""
NCERT Textbook Integration for LangGraph AI Agents
Connects all educational agents with Firebase-stored NCERT textbook database
"""

import json
import requests
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

@dataclass
class NCERTTextbook:
    id: str
    class_num: int
    subject: str
    book_title: str
    language: str
    pdf_url: str
    content_extracted: bool
    metadata: Dict[str, Any]

@dataclass
class NCERTChapter:
    id: str
    textbook_id: str
    chapter_number: int
    chapter_title: str
    content: Optional[str]
    topics: List[str]
    keywords: List[str]
    learning_objectives: List[str]

class NCERTIntegration:
    """Integration service for connecting AI agents with NCERT textbook database"""
    
    def __init__(self, api_base_url: str = "http://localhost:5000"):
        self.api_base_url = api_base_url
    
    def get_textbooks_by_class(self, class_num: int) -> List[NCERTTextbook]:
        """Get all NCERT textbooks for a specific class"""
        try:
            response = requests.get(f"{self.api_base_url}/api/ncert/textbooks/class/{class_num}")
            if response.status_code == 200:
                data = response.json()
                return [
                    NCERTTextbook(
                        id=book['id'],
                        class_num=book['class'],
                        subject=book['subject'],
                        book_title=book['bookTitle'],
                        language=book['language'],
                        pdf_url=book['pdfUrl'],
                        content_extracted=book['contentExtracted'],
                        metadata=book.get('metadata', {})
                    )
                    for book in data.get('data', [])
                ]
            return []
        except Exception as e:
            print(f"Error fetching textbooks for class {class_num}: {e}")
            return []
    
    def get_textbooks_by_subject(self, subject: str) -> List[NCERTTextbook]:
        """Get all NCERT textbooks for a specific subject across all classes"""
        try:
            response = requests.get(f"{self.api_base_url}/api/ncert/textbooks/subject/{subject}")
            if response.status_code == 200:
                data = response.json()
                return [
                    NCERTTextbook(
                        id=book['id'],
                        class_num=book['class'],
                        subject=book['subject'],
                        book_title=book['bookTitle'],
                        language=book['language'],
                        pdf_url=book['pdfUrl'],
                        content_extracted=book['contentExtracted'],
                        metadata=book.get('metadata', {})
                    )
                    for book in data.get('data', [])
                ]
            return []
        except Exception as e:
            print(f"Error fetching textbooks for subject {subject}: {e}")
            return []
    
    def get_all_textbooks(self) -> List[NCERTTextbook]:
        """Get all stored NCERT textbooks"""
        try:
            response = requests.get(f"{self.api_base_url}/api/ncert/textbooks")
            if response.status_code == 200:
                data = response.json()
                return [
                    NCERTTextbook(
                        id=book['id'],
                        class_num=book['class'],
                        subject=book['subject'],
                        book_title=book['bookTitle'],
                        language=book['language'],
                        pdf_url=book['pdfUrl'],
                        content_extracted=book['contentExtracted'],
                        metadata=book.get('metadata', {})
                    )
                    for book in data.get('data', [])
                ]
            return []
        except Exception as e:
            print(f"Error fetching all textbooks: {e}")
            return []
    
    def get_relevant_content(self, grades: List[int], subjects: List[str] = None, language: str = "English") -> Dict[str, List[NCERTTextbook]]:
        """Get relevant NCERT content based on grade levels and subjects"""
        relevant_content = {}
        
        for grade in grades:
            textbooks = self.get_textbooks_by_class(grade)
            
            # Filter by subjects if specified
            if subjects:
                textbooks = [book for book in textbooks if book.subject in subjects]
            
            # Filter by language
            textbooks = [book for book in textbooks if book.language == language]
            
            relevant_content[f"Class {grade}"] = textbooks
        
        return relevant_content
    
    def get_content_context_for_agent(self, 
                                    agent_type: str,
                                    grades: List[int],
                                    language: str = "English",
                                    subject_filter: List[str] = None) -> str:
        """Generate context string with relevant NCERT content for AI agents"""
        
        relevant_textbooks = self.get_relevant_content(grades, subject_filter, language)
        
        context_parts = [
            f"NCERT TEXTBOOK DATABASE INTEGRATION",
            f"Agent Type: {agent_type}",
            f"Target Grades: {', '.join(map(str, grades))}",
            f"Language: {language}",
            "",
            "AVAILABLE NCERT TEXTBOOKS:"
        ]
        
        total_books = 0
        for grade_label, books in relevant_textbooks.items():
            if books:
                context_parts.append(f"\n{grade_label}:")
                for book in books:
                    context_parts.append(f"  • {book.subject}: {book.book_title}")
                    total_books += 1
        
        if total_books == 0:
            context_parts.append("  No NCERT textbooks found for the specified criteria.")
            context_parts.append("  Please ensure NCERT database has been populated.")
        else:
            context_parts.extend([
                "",
                f"Total Available Textbooks: {total_books}",
                "",
                "USAGE INSTRUCTIONS:",
                "• Use NCERT textbook content as primary reference for curriculum alignment",
                "• Ensure generated content follows NCERT learning objectives and progression",
                "• Adapt language complexity according to target grade levels",
                "• Reference specific chapters and topics when creating educational materials",
                "• Maintain consistency with official NCERT terminology and concepts"
            ])
        
        return "\n".join(context_parts)
    
    def validate_ncert_alignment(self, content: str, grade: int, subject: str) -> Dict[str, Any]:
        """Validate if generated content aligns with NCERT curriculum"""
        textbooks = self.get_textbooks_by_class(grade)
        subject_books = [book for book in textbooks if book.subject.lower() == subject.lower()]
        
        return {
            "has_ncert_books": len(subject_books) > 0,
            "available_books": [book.book_title for book in subject_books],
            "curriculum_aligned": len(subject_books) > 0,
            "recommendations": [
                f"Reference NCERT {subject} textbooks for Class {grade}",
                "Use age-appropriate language and examples",
                "Follow NCERT learning progression and chapter structure"
            ] if len(subject_books) > 0 else [
                "NCERT textbooks not available for this subject/grade",
                "Consider using external educational resources",
                "Ensure content follows Indian educational standards"
            ]
        }

# Global NCERT integration instance
ncert_db = NCERTIntegration()

def get_ncert_context(agent_type: str, grades: List[int], language: str = "English", subjects: List[str] = None) -> str:
    """Helper function to get NCERT context for any agent"""
    return ncert_db.get_content_context_for_agent(agent_type, grades, language, subjects)

def validate_content_alignment(content: str, grade: int, subject: str) -> Dict[str, Any]:
    """Helper function to validate NCERT curriculum alignment"""
    return ncert_db.validate_ncert_alignment(content, grade, subject)