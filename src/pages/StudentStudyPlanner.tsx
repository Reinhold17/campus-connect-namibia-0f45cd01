import { DashboardLayout } from '@/components/DashboardLayout';
import { AIChat } from '@/components/AIChat';
import { Search, Bell, User, Calendar, Sparkles } from 'lucide-react';

const sidebarItems = [
  { label: 'My Bookings', icon: Calendar, to: '/student' },
  { label: 'Browse Tutors', icon: Search, to: '/browse' },
  { label: 'AI Study Planner', icon: Sparkles, to: '/student/study-planner' },
  { label: 'Profile Settings', icon: User, to: '/student/profile' },
];

export default function StudentStudyPlanner() {
  return (
    <DashboardLayout title="AI Study Planner" items={sidebarItems}>
      <AIChat
        mode="study-plan"
        welcomeMessage="Your AI Study Plan Assistant"
        placeholder="e.g. Help me create a study plan for my Financial Accounting exam next week..."
        suggestions={[
          "Create a 2-week study plan for my exams",
          "Help me balance 5 modules this semester",
          "Best study techniques for accounting",
          "Plan my revision schedule for finals",
        ]}
      />
    </DashboardLayout>
  );
}
