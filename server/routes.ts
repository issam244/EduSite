import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { mathSolver } from "./services/mathSolver";
import { insertUserSchema, insertConversationSchema, insertMessageSchema, insertMathSolutionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(userData.firebaseUid);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, firebaseUid: undefined } }); // Don't send firebaseUid back
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { firebaseUid } = req.body;
      
      if (!firebaseUid) {
        return res.status(400).json({ message: "Firebase UID required" });
      }
      
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ user: { ...user, firebaseUid: undefined } });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, firebaseUid: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { ...user, firebaseUid: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  // Conversation routes
  app.get("/api/conversations/user/:userId", async (req, res) => {
    try {
      const conversations = await storage.getUserConversations(req.params.userId);
      res.json({ conversations });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json({ conversation });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.id);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Message and math solving routes
  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Create user message
      const userMessage = await storage.createMessage(messageData);
      
      // If it's a user message, generate AI response
      if (messageData.type === 'user') {
        try {
          // Check if user has remaining free questions (if not logged in)
          if (messageData.conversationId) {
            const conversation = await storage.getConversation(messageData.conversationId);
            if (conversation?.userId) {
              const user = await storage.getUser(conversation.userId);
              if (user && (user.freeQuestionsUsed || 0) >= 2) {
                return res.status(403).json({ 
                  message: "Free question limit reached. Please register or login for unlimited questions.",
                  requiresAuth: true 
                });
              }
              
              // Increment free questions used
              if (user) {
                await storage.updateUser(user.id, { 
                  freeQuestionsUsed: (user.freeQuestionsUsed || 0) + 1 
                });
              }
            }
          }
          
          // Solve the math problem
          const solution = await mathSolver.solveMathProblem(
            messageData.content, 
            messageData.language || 'fr'
          );
          
          // Create AI response message
          const aiMessage = await storage.createMessage({
            conversationId: messageData.conversationId,
            content: solution.finalAnswer,
            type: 'assistant',
            language: messageData.language,
            metadata: { source: solution.source, confidence: solution.confidence }
          });
          
          // Store the detailed solution
          await storage.createMathSolution({
            messageId: aiMessage.id,
            steps: solution.steps,
            confidence: solution.confidence,
            source: solution.source
          });
          
          res.json({ 
            userMessage, 
            aiMessage,
            solution: {
              steps: solution.steps,
              confidence: solution.confidence,
              source: solution.source
            }
          });
        } catch (solvingError) {
          console.error('Math solving error:', solvingError);
          
          // Create error response
          const errorMessage = await storage.createMessage({
            conversationId: messageData.conversationId,
            content: "Désolé, je n'ai pas pu résoudre ce problème. Veuillez réessayer ou reformuler votre question.",
            type: 'assistant',
            language: messageData.language,
            metadata: { error: true }
          });
          
          res.json({ userMessage, aiMessage: errorMessage });
        }
      } else {
        res.json({ message: userMessage });
      }
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create message" });
    }
  });

  app.get("/api/messages/:id/solution", async (req, res) => {
    try {
      const solution = await storage.getMathSolution(req.params.id);
      if (!solution) {
        return res.status(404).json({ message: "Solution not found" });
      }
      res.json({ solution });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch solution" });
    }
  });

  // Admin routes
  app.get("/api/admin/content", async (req, res) => {
    try {
      const { type } = req.query;
      const content = await storage.getAllAdminContent(type as string);
      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin content" });
    }
  });

  app.post("/api/admin/content", async (req, res) => {
    try {
      const contentData = req.body;
      const content = await storage.createAdminContent(contentData);
      res.json({ content });
    } catch (error) {
      res.status(400).json({ message: "Failed to create admin content" });
    }
  });

  app.patch("/api/admin/content/:id", async (req, res) => {
    try {
      const updates = req.body;
      const content = await storage.updateAdminContent(req.params.id, updates);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json({ content });
    } catch (error) {
      res.status(400).json({ message: "Failed to update admin content" });
    }
  });

  app.delete("/api/admin/content/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAdminContent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // OCR and file processing routes
  app.post("/api/process/image", async (req, res) => {
    try {
      const { imageData, language } = req.body;
      
      // In a real implementation, this would use Tesseract.js
      // For now, return a simulated response
      res.json({ 
        extractedText: "Équation extraite de l'image: x² + 2x - 8 = 0",
        confidence: 85
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to process image" });
    }
  });

  app.post("/api/process/pdf", async (req, res) => {
    try {
      const { pdfData, language } = req.body;
      
      // In a real implementation, this would use PDF.js
      // For now, return a simulated response
      res.json({ 
        extractedText: "Contenu PDF extrait: Calculer la dérivée de f(x) = x³ + 2x² - 5x + 1",
        confidence: 90
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to process PDF" });
    }
  });

  app.post("/api/process/audio", async (req, res) => {
    try {
      const { audioData, language } = req.body;
      
      // In a real implementation, this would use Web Speech API or similar
      // For now, return a simulated response
      res.json({ 
        extractedText: "Transcription audio: Comment résoudre une équation du second degré?",
        confidence: 80
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to process audio" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
