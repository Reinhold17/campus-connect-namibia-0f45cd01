import { DashboardLayout } from '@/components/DashboardLayout';
import { AIChat } from '@/components/AIChat';
import { CalendarPlus, Calendar, Users, Star, Bell, User, Sparkles } from 'lucide-react';

const sidebarItems = [
  { label: 'My Sessions', icon: Calendar, to: '/tutor' },
  { label: 'Create Session', icon: CalendarPlus, to: '/tutor/create' },
  { label: 'AI Lesson Planner', icon: Sparkles, to: '/tutor/lesson-planner' },
  { label: 'Enrolled Students', icon: Users, to: '/tutor/students' },
  { label: 'Ratings', icon: Star, to: '/tutor/ratings' },
  { label: 'Notifications', icon: Bell, to: '/tutor/notifications' },
  { label: 'Profile', icon: User, to: '/tutor/profile' },
];

export default function TutorLessonPlanner() {
  return (
    <DashboardLayout title="AI Lesson Planner" items={sidebarItems}>
      <AIChat
        mode="lesson-planner"
        welcomeMessage="Your AI Lesson Planner Assistant"
        placeholder="e.g. Help me plan a 2-hour group session on Financial Accounting for 10 students..."
        suggestions={[
          "Plan a 1-hour intro session on calculus",
          "Create engaging group activities for accounting",
          "Design a revision session for exam prep",
          "How to assess student understanding effectively",
        ]}
      />
    </DashboardLayout>
  );
}
