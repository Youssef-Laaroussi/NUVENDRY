import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { 
  User, Mail, MapPin, Calendar as CalendarIcon, Edit3, Shield, Bell, 
  Sliders, BookOpen, Award, CheckCircle2, Circle, Camera, 
  ChevronRight, Key, ShieldCheck, Download, Play, Clock, Sparkles,
  Layers, Database, BarChart2, Tv, Monitor, Binary, Check, Loader2, AlertCircle, Zap
} from 'lucide-react';
import heroMountainsAi from '../../assets/hero-mountains-ai.jpg';
import profileCompletionMountains from '../../assets/profile-completion-mountains.png';
import workshopLanggraph from '../../assets/workshop-langgraph.jpg';
import workshopMlops from '../../assets/workshop-mlops.jpg';
import workshopSpatial from '../../assets/workshop-spatial.jpg';

interface CourseProgress {
  id: string;
  title: string;
  tag: string;
  image: string;
  progressPercent: number;
  duration: string;
  level: string;
}

const SAVED_COURSES: CourseProgress[] = [
  {
    id: 'c-langgraph',
    title: 'Build AI Agents with LangGraph',
    tag: 'AI & LLMs',
    image: workshopLanggraph,
    progressPercent: 42,
    duration: '6 hours',
    level: 'Intermediate',
  },
  {
    id: 'c-mlops',
    title: 'Production MLOps: Serving & Monitoring',
    tag: 'MLOps',
    image: workshopMlops,
    progressPercent: 65,
    duration: '6 hours',
    level: 'Intermediate',
  },
  {
    id: 'c-spatial',
    title: 'Spatial Data Science with Python',
    tag: 'Data Science',
    image: workshopSpatial,
    progressPercent: 21,
    duration: '4 hours',
    level: 'Beginner',
  },
];

// Custom svg icons matching exact mockup for Learning Interests:
// Python logo representation, MLOps 3d cube, etc.
const PythonIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.9 2C6.9 2 7.2 4.1 7.2 4.1l.01 2.2h4.8v.7H5.2S2 6.6 2 11.6s2.8 4.9 2.8 4.9h1.7v-2.4s-.1-2.8 2.8-2.8h4.7s2.7.1 2.7-2.6V4.6S17 2 11.9 2zm-1.4 1.5c.5 0 .9.4.9.9s-.4.9-.9.9-.9-.4-.9-.9.4-.9.9-.9zM12.1 22c5 0 4.7-2.1 4.7-2.1l-.01-2.2H12v-.7h6.8s3.2.4 3.2-4.6-2.8-4.9-2.8-4.9h-1.7v2.4s.1 2.8-2.8 2.8H10s-2.7-.1-2.7 2.6v4.1s-.3 2.6 4.8 2.6zm1.4-1.5c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
  </svg>
);

const CubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 16-9 5-9-5V8l9-5 9 5v8Z" />
    <path d="M3.27 6.96 12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

const CloudDevOpsIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);

const LEARNING_INTERESTS = [
  { name: 'Artificial Intelligence', icon: Sparkles, isSvg: false },
  { name: 'Data Science', icon: BarChart2, isSvg: false },
  { name: 'MLOps', icon: CubeIcon, isSvg: true },
  { name: 'Python', icon: PythonIcon, isSvg: true },
  { name: 'Generative AI', icon: Sparkles, isSvg: false },
  { name: 'Cloud & DevOps', icon: CloudDevOpsIcon, isSvg: true },
];

export const LearnerSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  
  // Navigation sub-tabs inside Settings
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'learning'>('profile');
  const [courseTab, setCourseTab] = useState<'saved' | 'certificates'>('saved');

  // Edit Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || 'yassirL');
  const [locationStr, setLocationStr] = useState('Rabat, Morocco');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user?.full_name]);

  const displayName = fullName || user?.full_name || 'yassirL';
  const initial = displayName.charAt(0).toUpperCase() || 'Y';
  const email = user?.email || 'yassirl@nuvendry.com';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateProfile({ full_name: fullName.trim() });
      await refreshUser();
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
      setIsEditingProfile(false);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs animate-in fade-in ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#EBF9EA] border-[#C5DFD0] text-[#0E6636] font-medium'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0E6636]" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-700 text-xs font-semibold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Header Banner matching mockup */}
      <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] px-6 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between min-h-[84px]">
        {/* Right Mountain Background with smooth fade */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_20%)]">
          <img
            src={heroMountainsAi}
            alt="Mountain backdrop"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Left Hero Text Content */}
        <div className="relative z-10 space-y-0.5 max-w-sm sm:max-w-md">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2621] tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-gray-500 leading-snug">
            Manage your profile, account security, learning preferences, and how you experience NUVENDRY Learner Hub.
          </p>
        </div>
      </div>

      {/* 2. Horizontal Settings Tabs (Profile, Security, Notifications, Preferences, Learning) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#036E3A] text-white shadow-xs'
              : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#036E3A] text-white shadow-xs'
              : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'notifications'
              ? 'bg-[#036E3A] text-white shadow-xs'
              : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'preferences'
              ? 'bg-[#036E3A] text-white shadow-xs'
              : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('learning')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'learning'
              ? 'bg-[#036E3A] text-white shadow-xs'
              : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Learning</span>
        </button>
      </div>

      {/* 3. Main Body: Center 2-Column Content + Right Sidebar */}
      <div className="flex flex-col xl:flex-row gap-3.5 items-start">
        
        {/* CENTER CONTENT COLUMN */}
        <div className="flex-1 min-w-0 space-y-3 w-full">
          
          {/* User Profile Card with Mountain Backdrop & Large Avatar */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Smooth mountain backdrop on right side */}
            <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_30%)]">
              <img
                src={heroMountainsAi}
                alt="Mountains backdrop"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Left: Avatar with Camera badge + User Metadata */}
            <div className="relative z-10 flex items-center gap-4">
              {/* Large Avatar Circle with Camera badge */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#18923B] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-sm border-2 border-white">
                  {initial}
                </div>
                <button
                  type="button"
                  aria-label="Add profile photo"
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#5EBA65] hover:bg-[#489E4E] text-white flex items-center justify-center shadow-xs border border-white transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* User details */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#1A2621] leading-none">
                    {displayName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#EBF9EA] border border-[#C5DFD0] text-[#0E6636] text-[10px] font-bold">
                    Learner
                  </span>
                </div>

                <div className="space-y-0.5 text-xs text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{locationStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>Member since Nov 19, 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Edit Profile Button */}
            <div className="relative z-10 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E2ECE4] bg-white hover:bg-[#F6F8F7] text-xs font-semibold text-[#0E6636] shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#0E6636]" />
                <span>{isEditingProfile ? 'Close Edit' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Inline Edit Profile Form (if toggled) */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[#E5E7E0] p-4 space-y-3 shadow-xs animate-in fade-in">
              <h3 className="font-bold text-xs text-[#1A2621]">Edit Your Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E5E7E0] text-xs text-[#1A2621] focus:border-[#0E6636] outline-none"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1">Location</label>
                  <input
                    type="text"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#E5E7E0] text-xs text-[#1A2621] focus:border-[#0E6636] outline-none"
                    placeholder="e.g. Rabat, Morocco"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E7E0] text-xs font-semibold text-gray-600 hover:bg-[#F6F8F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-xl bg-[#036E3A] hover:bg-[#025628] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* 2-Card Row: Learning Interests + Learning Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Learning Interests Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">Learning Interests</h3>
                </div>
                <button type="button" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E6636] hover:underline">
                  <Edit3 className="w-3 h-3 text-[#0E6636]" />
                  <span>Edit</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Topics and skills you're most interested in learning.
              </p>
              
              {/* Pills Grid - exact pale green background #ECF8EC and icons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                {LEARNING_INTERESTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#D5EED8] bg-[#ECF8EC] hover:border-[#0E6636]/50 transition-colors text-[10.5px] font-medium text-[#1A2621]"
                    >
                      <Icon className="w-3 h-3 text-[#0E6636] shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning Preferences Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7E0] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">Learning Preferences</h3>
                </div>
                <button type="button" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0E6636] hover:underline">
                  <Edit3 className="w-3 h-3 text-[#0E6636]" />
                  <span>Edit</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                Customize your learning experience on NUVENDRY.
              </p>

              {/* Preference rows - exact icons from mockup */}
              <div className="space-y-1.5 pt-0.5 text-xs">
                <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Monitor className="w-3.5 h-3.5 text-[#0E6636]" />
                    <span>Preferred learning format</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1A2621] font-semibold text-[11px]">
                    <span>Live & Self-paced</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <BarChart2 className="w-3.5 h-3.5 text-[#0E6636]" />
                    <span>Skill level</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1A2621] font-semibold text-[11px]">
                    <span>Intermediate</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#0E6636]" />
                    <span>Weekly learning time</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1A2621] font-semibold text-[11px]">
                    <span>4 – 6 hours</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Saved Courses & My Certificates Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCourseTab('saved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    courseTab === 'saved'
                      ? 'bg-[#006130] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Saved Courses (3)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseTab('certificates')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    courseTab === 'certificates'
                      ? 'bg-[#006130] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F6F8F7] text-[#333F39] border border-[#E5E7E0]'
                  }`}
                >
                  <Award className={`w-3.5 h-3.5 ${courseTab === 'certificates' ? 'text-white' : 'text-[#0E6636]'}`} />
                  <span>My Certificates (4)</span>
                </button>
              </div>

              <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E6636] hover:underline">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#0E6636]" />
              </button>
            </div>

            {/* Courses 3-Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SAVED_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#E5E7E0] overflow-hidden hover:border-[#0E6636]/40 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between group"
                >
                  {/* Top Thumbnail with Tag & Heart */}
                  <div className="relative h-28 w-full overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#DFF6DA] text-[#000E18] text-[8.5px] font-bold shadow-xs border border-[#C5DFD0]">
                      {course.tag}
                    </span>
                    <button
                      type="button"
                      aria-label="Favorite"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
                    >
                      <span className="text-[11px]">♡</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#1A2621] leading-snug line-clamp-2">
                        {course.title}
                      </h4>
                      <div className="text-[10px] text-gray-500 font-medium mt-1">
                        {course.progressPercent}% complete
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#18923B] rounded-full transition-all duration-500"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Metadata & Play Pill */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#0E6636]" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#0E6636]" />
                          <span>{course.level}</span>
                        </div>
                      </div>

                      {/* Play Action Button */}
                      <button
                        type="button"
                        aria-label={`Continue ${course.title}`}
                        className="w-6 h-6 rounded-lg bg-[#E1FBD4] hover:bg-[#D2F7C2] text-[#0E6636] flex items-center justify-center transition-colors shadow-2xs"
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN: Profile Completion + Quick Actions */}
        <div className="w-full xl:w-[260px] 2xl:w-[276px] shrink-0 space-y-3">
          
          {/* Card 1: Profile Completion Widget with Mountain graphic from exact mockup */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3 pb-8">
            {/* Mountain backdrop bottom - strictly the mountains graphic, without text */}
            <div className="absolute bottom-0 left-0 right-0 h-14 pointer-events-none select-none overflow-hidden">
              <img
                src={profileCompletionMountains}
                alt="Mountains"
                className="w-full h-full object-cover object-bottom"
              />
            </div>

            {/* Top row: Title + Radial Gauge */}
            <div className="relative z-10 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#0E6636]" />
                  <h3 className="font-bold text-xs text-[#1A2621]">Profile Completion</h3>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug mt-1">
                  Complete your profile to get more relevant workshop recommendations and opportunities.
                </p>
              </div>

              {/* 92% Ring Chart */}
              <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#0A6E38]"
                    strokeDasharray="92, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-[11px] text-[#1A2621]">
                  92%
                </span>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="relative z-10 space-y-1.5 text-[11px] pt-1">
              <div className="flex items-center justify-between p-1 rounded-lg hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-[#056E0F] shrink-0" />
                  <span className="font-medium text-[#1A2621]">Basic information (name, email)</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div className="flex items-center justify-between p-1 rounded-lg hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-[#056E0F] shrink-0" />
                  <span className="font-medium text-[#1A2621]">Add location</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div className="flex items-center justify-between p-1 rounded-lg hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-[#056E0F] shrink-0" />
                  <span className="font-medium text-[#1A2621]">Set learning interests</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div className="flex items-center justify-between p-1 rounded-lg hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-[#056E0F] shrink-0" />
                  <span className="font-medium text-[#1A2621]">Configure learning preferences</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <div className="flex items-center justify-between p-1 rounded-lg hover:bg-[#F6F8F7] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <Circle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-600">Add a profile photo</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Quick Actions - Exact card-based list styling from image 1 */}
          <div className="bg-white rounded-2xl border border-[#E5E7E0] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#0E6636]" />
              <h3 className="font-bold text-xs text-[#1A2621]">Quick Actions</h3>
            </div>

            <div className="space-y-2 text-xs pt-0.5">
              {/* Change Password Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all cursor-pointer group shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-[#0E6636] shrink-0" />
                  <div>
                    <div className="font-bold text-[11.5px] text-[#1A2621]">Change Password</div>
                    <div className="text-[9.5px] text-gray-400">Update your account password securely.</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Update Email Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all cursor-pointer group shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#0E6636] shrink-0" />
                  <div>
                    <div className="font-bold text-[11.5px] text-[#1A2621]">Update Email</div>
                    <div className="text-[9.5px] text-gray-400">Change your email address.</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Two-Factor Authentication Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#0E6636] shrink-0" />
                  <div>
                    <div className="font-bold text-[11.5px] text-[#1A2621]">Two-Factor Authentication</div>
                    <div className="text-[9.5px] text-gray-400">Add an extra layer of security to your account.</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                    twoFactorEnabled
                      ? 'bg-[#EBF9EA] text-[#0E6636] border-[#C5DFD0]'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {twoFactorEnabled ? 'On' : 'Off'}
                </button>
              </div>

              {/* Download My Data Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#E5E7E0] hover:border-[#0E6636]/50 hover:bg-[#F6F8F7] transition-all cursor-pointer group shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-[#0E6636] shrink-0" />
                  <div>
                    <div className="font-bold text-[11.5px] text-[#1A2621]">Download My Data</div>
                    <div className="text-[9.5px] text-gray-400">Get a copy of your learning data and activity.</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LearnerSettings;
