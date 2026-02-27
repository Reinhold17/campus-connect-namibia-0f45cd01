import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TutorCard } from '@/components/TutorCard';
import { mockTutors } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export default function BrowseTutorsPage() {
  const [search, setSearch] = useState('');
  const [university, setUniversity] = useState('all');
  const [subject, setSubject] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const universities = [...new Set(mockTutors.map(t => t.university).filter(Boolean))];
  const subjects = [...new Set(mockTutors.flatMap(t => t.subjects || []))];

  const filtered = useMemo(() => {
    let list = mockTutors.filter(t => t.status === 'approved');
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.subjects?.some(s => s.toLowerCase().includes(search.toLowerCase())));
    if (university !== 'all') list = list.filter(t => t.university === university);
    if (subject !== 'all') list = list.filter(t => t.subjects?.includes(subject));
    if (sortBy === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'reviews') list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    return list;
  }, [search, university, subject, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Browse Tutors</h1>
          <p className="mt-1 text-muted-foreground">Find the perfect tutor for your needs</p>
        </div>

        <div className="mb-8 grid gap-3 rounded-xl border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tutors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={university} onValueChange={setUniversity}>
            <SelectTrigger><SelectValue placeholder="University" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map(u => <SelectItem key={u} value={u!}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rating</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No tutors found matching your criteria.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
