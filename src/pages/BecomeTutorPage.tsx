import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import {
  GraduationCap, CheckCircle, Loader2, User, FileCheck, ShieldCheck,
  MapPin, BookOpen, ChevronRight, ChevronLeft, Upload, X, Plus, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const STEPS = [
  { label: 'Basic Info', icon: User },
  { label: 'Academic', icon: GraduationCap },
  { label: 'Identity', icon: ShieldCheck },
  { label: 'Location', icon: MapPin },
  { label: 'Profile', icon: BookOpen },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['08:00-10:00', '10:00-12:00', '12:00-14:00', '14:00-16:00', '16:00-18:00', '18:00-20:00'];

interface ModuleGrade {
  moduleId: string;
  moduleName: string;
  grade: string;
}

export default function BecomeTutorPage() {
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');

  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [moduleGrades, setModuleGrades] = useState<ModuleGrade[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);

  const [city, setCity] = useState('');
  const [campus, setCampus] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');

  const [bio, setBio] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  // Pre-fill from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.name || '');
      setEmail(profile.email || '');
    }
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  // Fetch universities
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const { data } = await supabase.from('universities').select('*').order('name');
      return data || [];
    },
  });

  // Fetch faculties for selected university
  const { data: faculties = [] } = useQuery({
    queryKey: ['faculties', university],
    queryFn: async () => {
      if (!university) return [];
      const uni = universities.find(u => u.name === university);
      if (!uni) return [];
      const { data } = await supabase.from('faculties').select('*').eq('university_id', uni.id).order('name');
      return data || [];
    },
    enabled: !!university && universities.length > 0,
  });

  // Fetch modules for selected faculty
  const { data: modules = [] } = useQuery({
    queryKey: ['modules', selectedFaculty],
    queryFn: async () => {
      if (!selectedFaculty) return [];
      const { data } = await supabase.from('modules').select('*').eq('faculty_id', selectedFaculty).order('name');
      return data || [];
    },
    enabled: !!selectedFaculty,
  });

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleAvailability = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter(s => s !== slot) };
      }
      return { ...prev, [day]: [...daySlots, slot] };
    });
  };

  const addModuleGrade = () => {
    if (!selectedModule || !selectedGrade) return;
    const mod = modules.find(m => m.id === selectedModule);
    if (!mod) return;
    if (moduleGrades.find(mg => mg.moduleId === selectedModule)) {
      toast.error('Module already added');
      return;
    }
    setModuleGrades(prev => [...prev, { moduleId: selectedModule, moduleName: mod.name, grade: selectedGrade }]);
    setSelectedModule('');
    setSelectedGrade('');
  };

  const removeModuleGrade = (moduleId: string) => {
    setModuleGrades(prev => prev.filter(mg => mg.moduleId !== moduleId));
  };

  const uploadFile = async (file: File, folder: string) => {
    const filePath = `${user!.id}/${folder}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('identity-documents')
      .upload(filePath, file, { upsert: true });
    if (error) throw error;
    return filePath;
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 0:
        if (!fullName || !email || !phone || !university || !yearOfStudy) {
          toast.error('Please fill in all required fields');
          return false;
        }
        return true;
      case 1:
        if (!studentIdFile) {
          toast.error('Please upload your student ID');
          return false;
        }
        if (moduleGrades.length === 0) {
          toast.error('Please add at least one module you can tutor');
          return false;
        }
        return true;
      case 2:
        if (!governmentIdFile) {
          toast.error('Please upload your government-issued ID');
          return false;
        }
        return true;
      case 3:
        if (!city || !campus) {
          toast.error('Please fill in city and campus');
          return false;
        }
        return true;
      case 4:
        if (!bio) {
          toast.error('Please write a short bio');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep() || !user) return;
    setSubmitting(true);

    try {
      // Upload files
      let studentIdUrl = '';
      let governmentIdUrl = '';
      let transcriptUrl = '';

      if (studentIdFile) studentIdUrl = await uploadFile(studentIdFile, 'student-id');
      if (governmentIdFile) governmentIdUrl = await uploadFile(governmentIdFile, 'government-id');
      if (transcriptFile) transcriptUrl = await uploadFile(transcriptFile, 'transcript');

      // Update profile
      const subjects = moduleGrades.map(mg => mg.moduleName);
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: fullName,
          phone_number: phone,
          university,
          year_of_study: yearOfStudy,
          subjects,
          bio,
          teaching_style: teachingStyle,
          city,
          campus,
          neighbourhood,
          student_id_url: studentIdUrl,
          government_id_url: governmentIdUrl,
          availability: availability,
          status: 'pending',
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Upload transcript to payment-proofs bucket (existing bucket)
      if (transcriptFile && transcriptUrl) {
        // Already uploaded to identity-documents bucket above
      }

      // Insert module grades
      if (moduleGrades.length > 0) {
        const { error: gradesError } = await supabase
          .from('tutor_module_grades' as any)
          .insert(
            moduleGrades.map(mg => ({
              user_id: user.id,
              module_id: mg.moduleId,
              grade: mg.grade,
            }))
          );
        if (gradesError) throw gradesError;
      }

      // Also insert tutor_modules entries
      const { error: tmError } = await supabase
        .from('tutor_modules')
        .insert(
          moduleGrades.map(mg => ({
            user_id: user.id,
            module_id: mg.moduleId,
          }))
        );
      if (tmError && !tmError.message.includes('duplicate')) throw tmError;

      // Notify admin
      try {
        await supabase.functions.invoke('notify-admin-tutor-signup', {
          body: { tutorName: fullName, tutorEmail: email, university, subjects },
        });
      } catch {
        console.warn('Admin notification failed');
      }

      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="max-w-md text-center animate-fade-in">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">Application Submitted!</h1>
            <p className="mt-2 text-muted-foreground">
              Our admin team will review your application and get back to you shortly. You'll receive an email notification once approved.
            </p>
            <div className="mt-6 rounded-xl border bg-card p-4 text-left text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="font-medium">Privacy Notice</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                All personal data submitted is securely stored and used strictly for verification and platform services. Your information will remain confidential and will not be shared without your permission.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Become a Tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete all steps to submit your application</p>
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s.label}
                  onClick={() => i < step && setStep(i)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 text-xs transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : isDone
                      ? 'text-success cursor-pointer hover:bg-muted'
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                    isActive ? 'border-primary bg-primary text-primary-foreground'
                    : isDone ? 'border-success bg-success text-success-foreground'
                    : 'border-muted-foreground/30'
                  }`}>
                    {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </button>
              );
            })}
          </div>
          <Progress value={progress} className="mt-3 h-2" />
        </div>

        {/* Form Card */}
        <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in">
          {/* Step 1: Basic Information */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Basic Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+264 81 234 5678" required />
                </div>
                <div>
                  <Label htmlFor="yearOfStudy">Year of Study *</Label>
                  <Select value={yearOfStudy} onValueChange={setYearOfStudy}>
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>
                      {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'].map(y => (
                        <SelectItem key={y} value={y}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="university">University *</Label>
                <Select value={university} onValueChange={setUniversity}>
                  <SelectTrigger><SelectValue placeholder="Select university" /></SelectTrigger>
                  <SelectContent>
                    {universities.map(u => (
                      <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Academic Verification */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" /> Academic Verification
              </h2>
              <div>
                <Label>Student ID *</Label>
                <div className="mt-1">
                  {studentIdFile ? (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                      <FileCheck className="h-4 w-4 text-success" />
                      <span className="flex-1 truncate text-sm">{studentIdFile.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => setStudentIdFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/30">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload student ID</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG or PDF</span>
                      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setStudentIdFile(e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              </div>
              <div>
                <Label>Academic Transcript (optional)</Label>
                <div className="mt-1">
                  {transcriptFile ? (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                      <FileCheck className="h-4 w-4 text-success" />
                      <span className="flex-1 truncate text-sm">{transcriptFile.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => setTranscriptFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/30">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload transcript</span>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={e => setTranscriptFile(e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              </div>

              {/* Module + Grade selector */}
              <div>
                <Label>Modules You Can Tutor *</Label>
                <div className="mt-2 space-y-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                      <SelectTrigger><SelectValue placeholder="Faculty" /></SelectTrigger>
                      <SelectContent>
                        {faculties.map(f => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedModule} onValueChange={setSelectedModule} disabled={!selectedFaculty}>
                      <SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger>
                      <SelectContent>
                        {modules.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                        <SelectContent>
                          {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'].map(g => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" size="icon" onClick={addModuleGrade} disabled={!selectedModule || !selectedGrade}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {moduleGrades.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {moduleGrades.map(mg => (
                        <Badge key={mg.moduleId} variant="secondary" className="gap-1 py-1.5 pl-3 pr-1.5">
                          {mg.moduleName} ({mg.grade})
                          <button onClick={() => removeModuleGrade(mg.moduleId)} className="ml-1 rounded-full p-0.5 hover:bg-foreground/10">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Identity Verification */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Identity Verification
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload a clear photo of your government-issued ID (Namibian ID card, passport, or driver's license).
              </p>
              <div>
                <Label>Government ID *</Label>
                <div className="mt-1">
                  {governmentIdFile ? (
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                      <FileCheck className="h-4 w-4 text-success" />
                      <span className="flex-1 truncate text-sm">{governmentIdFile.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => setGovernmentIdFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 transition-colors hover:border-primary/50 hover:bg-muted/30">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Click to upload government ID</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG or PDF — Max 10MB</span>
                      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setGovernmentIdFile(e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Lock className="h-4 w-4 text-primary" />
                  Your data is secure
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  All personal data submitted to Campus Connect is securely stored and used strictly for verification and platform services. Your information will remain confidential and will not be shared without your permission.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Location
              </h2>
              <p className="text-sm text-muted-foreground">Help students find tutors near them.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Windhoek" required />
                </div>
                <div>
                  <Label htmlFor="campus">Campus *</Label>
                  <Input id="campus" value={campus} onChange={e => setCampus(e.target.value)} placeholder="e.g. Main Campus" required />
                </div>
              </div>
              <div>
                <Label htmlFor="neighbourhood">Residence / Neighbourhood</Label>
                <Input id="neighbourhood" value={neighbourhood} onChange={e => setNeighbourhood(e.target.value)} placeholder="e.g. Pioneerspark" />
              </div>
            </div>
          )}

          {/* Step 5: Tutor Profile */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Tutor Profile
              </h2>
              <div>
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell students about your tutoring experience and approach..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="teachingStyle">Teaching Style</Label>
                <Select value={teachingStyle} onValueChange={setTeachingStyle}>
                  <SelectTrigger><SelectValue placeholder="Select your style" /></SelectTrigger>
                  <SelectContent>
                    {['Interactive & Hands-on', 'Visual & Diagram-based', 'Step-by-step Problem Solving', 'Discussion & Concept-based', 'Practice-heavy / Past Papers'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div>
                <Label>Availability</Label>
                <p className="mb-2 text-xs text-muted-foreground">Select the time slots you're typically available</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="p-1 text-left font-medium text-muted-foreground">Day</th>
                        {TIME_SLOTS.map(slot => (
                          <th key={slot} className="p-1 text-center font-medium text-muted-foreground">{slot}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day}>
                          <td className="p-1 font-medium">{day.slice(0, 3)}</td>
                          {TIME_SLOTS.map(slot => {
                            const active = (availability[day] || []).includes(slot);
                            return (
                              <td key={slot} className="p-1">
                                <button
                                  type="button"
                                  onClick={() => toggleAvailability(day, slot)}
                                  className={`h-7 w-full rounded transition-colors ${
                                    active
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted hover:bg-muted-foreground/10'
                                  }`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={prevStep} disabled={step === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={nextStep}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            )}
          </div>
        </div>

        {/* Privacy notice */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Lock className="mr-1 inline h-3 w-3" />
          All personal data is securely stored and used strictly for verification and platform services.
        </p>
      </div>
      <Footer />
    </div>
  );
}
