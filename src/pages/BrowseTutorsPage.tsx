import { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TutorCard } from '@/components/TutorCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { mockTutors } from '@/lib/mock-data';

interface University { id: string; name: string; }
interface Faculty { id: string; name: string; university_id: string; }
interface Module { id: string; name: string; faculty_id: string; }
interface TutorProfile {
  id: string; user_id: string; name: string; email: string; university?: string;
  subjects?: string[]; bio?: string; rating?: number; review_count?: number; status: string;
  hourly_rate?: number; teaching_style?: string;
  student_id_url?: string | null; government_id_url?: string | null;
}

const mockToProfile = (m: any): TutorProfile => ({
  id: m.id,
  user_id: m.id,
  name: m.name,
  email: m.email,
  university: m.university,
  subjects: m.subjects,
  bio: m.bio,
  rating: m.rating,
  review_count: m.reviewCount,
  status: 'approved',
  hourly_rate: m.hourly_rate,
  teaching_style: m.teaching_style,
  student_id_url: m.student_id_url,
  government_id_url: m.government_id_url,
});

export default function BrowseTutorsPage() {
  const [search, setSearch] = useState('');
  const [universityId, setUniversityId] = useState('all');
  const [facultyId, setFacultyId] = useState('all');
  const [moduleId, setModuleId] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [usingMock, setUsingMock] = useState(false);
  const [tutorModuleMap, setTutorModuleMap] = useState<Record<string, string[]>>({});
  const [tutorSubjectMap, setTutorSubjectMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [uniRes, facRes, modRes, tutorRolesRes, tmRes, sessionRes] = await Promise.all([
        supabase.from('universities').select('*').order('name'),
        supabase.from('faculties').select('*').order('name'),
        supabase.from('modules').select('*').order('name'),
        supabase.from('user_roles').select('user_id').eq('role', 'tutor'),
        supabase.from('tutor_modules').select('user_id, module_id, modules!tutor_modules_module_id_fkey ( name )'),
        supabase.from('sessions').select('tutor_id, subject, module_id').eq('status', 'active').gte('date', new Date().toISOString().split('T')[0]),
      ]);
      setUniversities(uniRes.data || []);
      setFaculties(facRes.data || []);
      setModules(modRes.data || []);

      // Only fetch profiles for users with tutor role; fall back to mock tutors
      // while the platform has no real approved tutors yet.
      const tutorUserIds = (tutorRolesRes.data || []).map((r: any) => r.user_id);
      let dbTutors: TutorProfile[] = [];
      if (tutorUserIds.length > 0) {
        const { data: tutorProfiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('status', 'approved')
          .in('user_id', tutorUserIds);
        dbTutors = (tutorProfiles as TutorProfile[]) || [];
      }
      const isMock = dbTutors.length === 0;
      setUsingMock(isMock);
      setTutors(isMock ? mockTutors.map(mockToProfile) : dbTutors);

      const map: Record<string, string[]> = {};
      const subjects: Record<string, Set<string>> = {};
      (tmRes.data || []).forEach((tm: any) => {
        if (!map[tm.user_id]) map[tm.user_id] = [];
        map[tm.user_id].push(tm.module_id);
        if (!subjects[tm.user_id]) subjects[tm.user_id] = new Set();
        if (tm.modules?.name) subjects[tm.user_id].add(tm.modules.name);
      });
      (sessionRes.data || []).forEach((session: any) => {
        if (!map[session.tutor_id]) map[session.tutor_id] = [];
        if (session.module_id) map[session.tutor_id].push(session.module_id);
        if (!subjects[session.tutor_id]) subjects[session.tutor_id] = new Set();
        if (session.subject) subjects[session.tutor_id].add(session.subject);
      });
      setTutorModuleMap(map);
      setTutorSubjectMap(Object.fromEntries(Object.entries(subjects).map(([userId, names]) => [userId, Array.from(names).sort()])));
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredFaculties = useMemo(() =>
    universityId === 'all' ? faculties : faculties.filter(f => f.university_id === universityId),
    [universityId, faculties]
  );

  const filteredModules = useMemo(() =>
    facultyId === 'all' ? modules : modules.filter(m => m.faculty_id === facultyId),
    [facultyId, modules]
  );

  // Reset dependent filters
  useEffect(() => { setFacultyId('all'); setModuleId('all'); }, [universityId]);
  useEffect(() => { setModuleId('all'); }, [facultyId]);

  const filtered = useMemo(() => {
    let list = tutors;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.subjects?.some(s => s.toLowerCase().includes(q)) ||
        tutorSubjectMap[t.user_id]?.some(s => s.toLowerCase().includes(q))
      );
    }

    if (moduleId !== 'all') {
      list = list.filter(t => tutorModuleMap[t.user_id]?.includes(moduleId));
    } else if (facultyId !== 'all') {
      const modIds = modules.filter(m => m.faculty_id === facultyId).map(m => m.id);
      list = list.filter(t => tutorModuleMap[t.user_id]?.some(id => modIds.includes(id)));
    } else if (universityId !== 'all') {
      const facIds = faculties.filter(f => f.university_id === universityId).map(f => f.id);
      const modIds = modules.filter(m => facIds.includes(m.faculty_id)).map(m => m.id);
      list = list.filter(t => tutorModuleMap[t.user_id]?.some(id => modIds.includes(id)));
    }

    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'reviews') list = [...list].sort((a, b) => (b.review_count || 0) - (a.review_count || 0));

    return list;
  }, [search, universityId, facultyId, moduleId, sortBy, tutors, tutorModuleMap, tutorSubjectMap, faculties, modules]);

  // Map tutor profile to TutorCard-compatible shape
  const toUser = (t: TutorProfile) => ({
    id: t.user_id,
    name: t.name,
    email: t.email,
    role: 'tutor' as const,
    status: t.status as 'approved',
    university: t.university,
    subjects: tutorSubjectMap[t.user_id]?.length ? tutorSubjectMap[t.user_id] : t.subjects,
    bio: t.bio,
    rating: t.rating ? Number(t.rating) : undefined,
    reviewCount: t.review_count ?? undefined,
    createdAt: '',
    student_id_url: (t as any).student_id_url,
    government_id_url: (t as any).government_id_url,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Browse Tutors</h1>
          <p className="mt-1 text-muted-foreground">Find the perfect tutor for your needs</p>
        </div>

        <div className="mb-8 grid gap-3 rounded-xl border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tutors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={universityId} onValueChange={setUniversityId}>
            <SelectTrigger><SelectValue placeholder="University" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {universities.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={facultyId} onValueChange={setFacultyId}>
            <SelectTrigger><SelectValue placeholder="Faculty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {filteredFaculties.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={moduleId} onValueChange={setModuleId}>
            <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {filteredModules.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
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

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading tutors...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">No tutors found matching your criteria.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(tutor => <TutorCard key={tutor.user_id} tutor={toUser(tutor)} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
