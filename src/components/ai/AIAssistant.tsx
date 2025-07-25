import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Sparkles,
  BookOpen,
  TrendingUp,
  Users,
  MessageSquare,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  className?: string;
  isMinimized?: boolean;
  onToggleSize?: () => void;
}

export default function AIAssistant({ className, isMinimized = false, onToggleSize }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI learning assistant. I can help you with course recommendations, study plans, answer questions, and track your progress. How can I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Recommend courses for me",
        "Create a study plan",
        "Explain machine learning",
        "Track my progress"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        suggestions: getAISuggestions(inputValue)
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (input: string): string => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('course') || lowercaseInput.includes('recommend')) {
      return "Based on your learning history and goals, I recommend these courses: 1) Advanced React Development 2) Machine Learning Fundamentals 3) Data Science with Python. Would you like detailed information about any of these?";
    }
    
    if (lowercaseInput.includes('study plan') || lowercaseInput.includes('plan')) {
      return "I'll create a personalized study plan for you! Based on your current level and available time, here's a 4-week plan: Week 1-2: Fundamentals, Week 3: Hands-on projects, Week 4: Advanced concepts. Should I break this down further?";
    }
    
    if (lowercaseInput.includes('progress') || lowercaseInput.includes('track')) {
      return "Your learning progress looks great! You've completed 3 courses this month (85% average), spent 24 hours learning, and earned 2 certificates. Your strongest areas are React and JavaScript. Keep up the excellent work!";
    }
    
    if (lowercaseInput.includes('machine learning') || lowercaseInput.includes('ml')) {
      return "Machine Learning is a subset of AI that enables computers to learn and make decisions from data without explicit programming. Key concepts include supervised learning, unsupervised learning, and neural networks. Would you like me to recommend a beginner-friendly ML course?";
    }
    
    return "I understand you're asking about that topic. Let me help you learn more effectively. Based on our conversation, I can suggest relevant courses, create study materials, or connect you with study groups. What specific aspect would you like to explore?";
  };

  const getAISuggestions = (input: string): string[] => {
    const suggestions = [
      "Tell me more about this topic",
      "Show related courses",
      "Create a quiz for me",
      "Find study materials",
      "Connect with study groups"
    ];
    return suggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn("fixed bottom-6 right-6 z-50", className)}
      >
        <Button
          onClick={onToggleSize}
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary-hover shadow-lg ai-glow"
        >
          <Brain className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("fixed bottom-6 right-6 z-50", className)}
    >
      <Card className="w-96 h-[500px] learning-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-ai-background/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Learning Assistant</h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart
            </Badge>
            <Button variant="ghost" size="sm" onClick={onToggleSize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {message.content}
                    
                    {/* AI Suggestions */}
                    {message.type === 'ai' && message.suggestions && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-1 text-muted-foreground hover:text-foreground"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        {/* Input */}
        <div className="p-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about learning..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="h-9 w-9 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}