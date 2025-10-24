import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Target,
  Brain,
  Users,
  Calendar,
  PlayCircle,
  Star,
  Flame,
  Trophy,
  Zap,
} from "lucide-react";
import CourseCard from "./CourseCard";
import { cn } from "@/lib/utils";

interface LearningStats {
  coursesCompleted: number;
  hoursLearned: number;
  certificatesEarned: number;
  currentStreak: number;
  skillsAcquired: number;
  rank: number;
  xp: number;
  nextLevelXp: number;
}

interface RecentActivity {
  id: string;
  type: 'course_completed' | 'lesson_completed' | 'achievement_earned' | 'quiz_passed';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
}

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: Date;
  category: string;
}

export default function LearningDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");

  // Mock data
  const learningStats: LearningStats = {
    coursesCompleted: 12,
    hoursLearned: 156,
    certificatesEarned: 8,
    currentStreak: 7,
    skillsAcquired: 24,
    rank: 342,
    xp: 2340,
    nextLevelXp: 3000,
  };

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'course_completed',
      title: 'React Advanced Patterns',
      description: 'Completed with 95% score',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: <Award className="h-4 w-4 text-yellow-400" />
    },
    {
      id: '2',
      type: 'achievement_earned',
      title: 'Speed Learner',
      description: 'Completed 5 lessons in one day',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      icon: <Zap className="h-4 w-4 text-white-400" />
    },
    {
      id: '3',
      type: 'lesson_completed',
      title: 'Machine Learning Basics',
      description: 'Lesson 3: Neural Networks',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: <BookOpen className="h-4 w-4 text-primary" />
    },
  ];

  const learningGoals: LearningGoal[] = [
    {
      id: '1',
      title: 'Complete React Certification',
      description: 'Finish all React courses and pass the final exam',
      progress: 8,
      target: 10,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      category: 'Certification'
    },
    {
      id: '2',
      title: 'Learn 30 Hours This Month',
      description: 'Maintain consistent learning schedule',
      progress: 22,
      target: 30,
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      category: 'Time Goal'
    },
    {
      id: '3',
      title: 'Master Machine Learning',
      description: 'Complete ML specialization track',
      progress: 3,
      target: 8,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      category: 'Skill Track'
    },
  ];

  const continueLearning = [
    {
      id: '1',
      title: 'Advanced React Patterns',
      description: 'Learn advanced React patterns and best practices',
      instructor: {
        name: 'Sarah Johnson',
        avatar: '/placeholder.svg',
        rating: 4.9
      },
      thumbnail: '/placeholder.svg',
      duration: '8 weeks',
      lessons: 24,
      enrolled: 1240,
      rating: 4.8,
      price: 0,
      category: 'Frontend',
      level: 'Advanced' as const,
      skills: ['React', 'JavaScript', 'Design Patterns'],
      progress: 65,
      isEnrolled: true,
      completedLessons: 16
    },
    {
      id: '2',
      title: 'Machine Learning Fundamentals',
      description: 'Introduction to machine learning concepts and algorithms',
      instructor: {
        name: 'Dr. Michael Chen',
        avatar: '/placeholder.svg',
        rating: 4.9
      },
      thumbnail: '/placeholder.svg',
      duration: '12 weeks',
      lessons: 36,
      enrolled: 2340,
      rating: 4.9,
      price: 49,
      category: 'AI/ML',
      level: 'Beginner' as const,
      skills: ['Python', 'Machine Learning', 'Data Science'],
      progress: 30,
      isEnrolled: true,
      completedLessons: 11
    },
  ];

  const StatCard = ({ icon, title, value, change, description }: any) => (
    <Card className="learning-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
          {change && (
            <div className="text-right">
              <Badge variant={change > 0 ? "default" : "secondary"} className="mb-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{change}%
              </Badge>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-red-600/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">
              Welcome back, Alex! 🎓
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to continue your learning journey? You're doing amazing!
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="font-semibold">{learningStats.currentStreak} day streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="font-semibold">Rank #{learningStats.rank}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-sm text-muted-foreground">Level Progress</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-lg font-bold">{learningStats.xp} XP</p>
                <p className="text-xs text-muted-foreground">
                  {learningStats.nextLevelXp - learningStats.xp} to next level
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray={`${(learningStats.xp / learningStats.nextLevelXp) * 100}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {Math.round((learningStats.xp / learningStats.nextLevelXp) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          title="Courses Completed"
          value={learningStats.coursesCompleted}
          change={15}
          description="this month"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-accent" />}
          title="Hours Learned"
          value={learningStats.hoursLearned}
          change={8}
          description="this week"
        />
        <StatCard
          icon={<Award className="h-5 w-5 text-yellow-400" />}
          title="Certificates"
          value={learningStats.certificatesEarned}
          change={25}
          description="this year"
        />
        <StatCard
          icon={<Brain className="h-5 w-5 text-red-400" />}
          title="Skills Acquired"
          value={learningStats.skillsAcquired}
          change={12}
          description="this quarter"
        />
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Continue Learning */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-heading font-semibold">Continue Learning</h2>
              <div className="grid gap-4">
                {continueLearning.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="compact"
                    onContinue={(id) => console.log('Continue course:', id)}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-semibold">Recent Activity</h2>
              <Card className="learning-card">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                          {activity.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-semibold">My Courses</h2>
            <Button>Browse All Courses</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueLearning.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onContinue={(id) => console.log('Continue course:', id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-semibold">Learning Goals</h2>
            <Button>Set New Goal</Button>
          </div>
          <div className="grid gap-4">
            {learningGoals.map((goal) => (
              <Card key={goal.id} className="learning-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{goal.title}</h3>
                      <p className="text-muted-foreground text-sm">{goal.description}</p>
                    </div>
                    <Badge variant="outline">{goal.category}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress: {goal.progress} / {goal.target}</span>
                      <span className="text-muted-foreground">
                        Due: {goal.deadline.toLocaleDateString()}
                      </span>
                    </div>
                    <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <h2 className="text-2xl font-heading font-semibold">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Achievement badges would go here */}
            <Card className="learning-card text-center p-6">
              <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Course Master</h3>
              <p className="text-sm text-muted-foreground">Complete 10 courses</p>
              <Badge className="mt-2">Earned</Badge>
            </Card>
            <Card className="learning-card text-center p-6 opacity-50">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Expert Learner</h3>
              <p className="text-sm text-muted-foreground">Complete 25 courses</p>
              <Badge variant="outline" className="mt-2">8/25</Badge>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}