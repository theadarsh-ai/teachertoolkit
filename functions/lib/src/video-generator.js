import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);
export class VideoGeneratorService {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const credentialsPath = path.join(__dirname, 'credentials', 'genzion-ai-9d0b2290221b.json');
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
        this.project = process.env.GOOGLE_CLOUD_PROJECT_ID || 'genzion-ai';
        this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
        console.log(`🔧 Video Generator Service initialized for REAL video generation`);
        console.log(`📍 Project: ${this.project}, Location: ${this.location}`);
    }
    async generateVideo(request) {
        try {
            console.log(`📹 Generating REAL video for Grade ${request.grade} ${request.subject}: "${request.prompt}"`);
            // Enhanced prompt using Gemini
            const enhancedPrompt = await this.enhancePrompt(request);
            console.log(`📝 Enhanced prompt ready`);
            const videoId = `veo_${Date.now()}`;
            // Call your working Python code directly
            const pythonResult = await this.callPythonVideoGeneration(request.prompt);
            console.log(`🔍 Debug - Python result structure:`, {
                success: pythonResult.success,
                has_video_url: !!pythonResult.video_url,
                video_url: pythonResult.video_url,
                message: pythonResult.message
            });
            if (pythonResult.success && pythonResult.video_url) {
                // Convert GCS URL to public HTTPS URL using your HTML logic
                const gcsUrl = pythonResult.video_url;
                const publicUrl = "https://storage.googleapis.com" + gcsUrl.slice(gcsUrl.search('//') + 1);
                console.log(`🔄 Converting GCS URL: ${gcsUrl} -> ${publicUrl}`);
                const video = {
                    id: videoId,
                    title: `${request.subject} Educational Video - Grade ${request.grade}`,
                    description: `${enhancedPrompt}\n\n🎬 Generated using Google Veo 3.0 (Real Video)\n📹 Public URL: ${publicUrl}`,
                    videoUrl: publicUrl, // Use public HTTPS URL instead of GCS URL
                    thumbnailUrl: publicUrl.replace('.mp4', '_thumb.jpg'),
                    duration: request.duration,
                    subject: request.subject,
                    grade: request.grade,
                    generatedAt: new Date(),
                    status: 'completed'
                };
                console.log(`✅ REAL video generated: ${video.videoUrl}`);
                return video;
            }
            else {
                console.log(`❌ Python generation failed:`, pythonResult);
                throw new Error(`Python generation failed: ${pythonResult.message}`);
            }
        }
        catch (error) {
            console.error(`❌ Video generation error:`, error);
            // Return error information instead of concept
            const videoId = `error_${Date.now()}`;
            return {
                id: videoId,
                title: `Video Generation Error - Grade ${request.grade}`,
                description: `Failed to generate real video: ${error instanceof Error ? error.message : 'Unknown error'}`,
                videoUrl: '',
                thumbnailUrl: '',
                duration: request.duration,
                subject: request.subject,
                grade: request.grade,
                generatedAt: new Date(),
                status: 'failed'
            };
        }
    }
    async enhancePrompt(request) {
        try {
            const prompt = `Create an educational video concept for "${request.prompt}" suitable for Grade ${request.grade} students studying ${request.subject}. Duration: ${request.duration}. Focus on clear, engaging content with visual learning elements.`;
            const result = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            });
            return result.response.text() || request.prompt;
        }
        catch (error) {
            console.log(`⚠️ Prompt enhancement failed, using original`);
            return request.prompt;
        }
    }
    async callPythonVideoGeneration(prompt) {
        try {
            console.log(`🐍 Calling your working Python code for real video generation...`);
            const pythonScript = path.join(__dirname, 'python-video-bridge.py');
            const command = `python3 "${pythonScript}" "${prompt}"`;
            console.log(`🔄 Executing Python bridge...`);
            const { stdout, stderr } = await execAsync(command, { timeout: 300000 }); // 5 minute timeout
            if (stderr) {
                console.log(`🔄 Python logs: ${stderr}`);
            }
            const result = JSON.parse(stdout);
            console.log(`🐍 Python result:`, result);
            return result;
        }
        catch (error) {
            console.log(`❌ Python bridge failed:`, error);
            return {
                success: false,
                video_url: '',
                message: `Python bridge error: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getVideoStatus(videoId) {
        return null;
    }
    async listUserVideos(userId) {
        return [];
    }
}
export const videoGeneratorService = new VideoGeneratorService();
//# sourceMappingURL=video-generator.js.map