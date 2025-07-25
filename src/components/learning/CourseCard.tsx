import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  Bookmark,
  Award,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
    rating: number;
  };
  thumbnail: string;
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  price: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  progress?: number;
  isEnrolled?: boolean;
  isFavorite?: boolean;
  completedLessons?: number;
}

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  onEnroll?: (courseId: string) => void;
  onToggleFavorite?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
}

export default function CourseCard({
  course,
  variant = 'default',
  className,
  onEnroll,
  onToggleFavorite,
  onContinue,
}: CourseCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(course.isFavorite || false);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onToggleFavorite?.(course.id);
  };

  const levelColors = {
    Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    Intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={cn("w-full", className)}
      >
        <Card className="course-card h-full">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {course.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={handleBookmark}
                  >
                    <Bookmark
                      className={cn(
                        "h-4 w-4",
                        isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"
                      )}
                    />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {course.instructor.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Clock className="h-3 w-3" />
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.lessons} lessons</span>
                </div>
                {course.isEnrolled && course.progress !== undefined && (
                  <div className="space-y-1">
                    <Progress value={course.progress} className="h-1" />
                    <p className="text-xs text-muted-foreground">
                      {course.progress}% complete
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn("w-full", className)}
    >
      <Card className="course-card h-full overflow-hidden">
        <div className="relative">
          {/* Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-purple-600/20 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/80" />
            </div>
            
            {/* Overlay Content */}
            <div className="absolute top-2 left-2">
              <Badge className={cn("text-xs border", levelColors[course.level])}>
                {course.level}
              </Badge>
            </div>
            
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 backdrop-blur-sm"
                onClick={handleBookmark}
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4",
                    isBookmarked ? "fill-white text-white" : "text-white/80"
                  )}
                />
              </Button>
            </div>

            {course.isEnrolled && (
              <div className="absolute bottom-2 right-2">
                <Button
                  size="sm"
                  className="h-8 bg-primary hover:bg-primary-hover"
                  onClick={() => onContinue?.(course.id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Continue
                </Button>
              </div>
            )}
          </div>
        </div>

        <CardHeader className="pb-2">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-heading font-semibold text-lg line-clamp-2 leading-tight">
                {course.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>

            {/* Instructor */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={course.instructor.avatar} />
                <AvatarFallback className="text-xs">
                  {course.instructor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {course.instructor.name}
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {course.instructor.rating}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{course.lessons} lessons</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{course.enrolled.toLocaleString()}</span>
              </div>
            </div>

            {/* Progress Bar for Enrolled Courses */}
            {course.isEnrolled && course.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {course.completedLessons || 0} of {course.lessons} lessons completed
                </p>
              </div>
            )}

            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {course.skills.slice(0, 3).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {skill}
                </Badge>
              ))}
              {course.skills.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{course.skills.length - 3} more
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
                {course.price === 0 ? (
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    Free
                  </Badge>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    ${course.price}
                  </span>
                )}
              </div>

              {course.isEnrolled ? (
                <Button
                  onClick={() => onContinue?.(course.id)}
                  className="bg-accent hover:bg-accent-hover"
                >
                  Continue Learning
                </Button>
              ) : (
                <Button
                  onClick={() => onEnroll?.(course.id)}
                  className="bg-primary hover:bg-primary-hover"
                >
                  Enroll Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}