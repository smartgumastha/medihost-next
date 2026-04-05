// API Integration: Replace mock data when backend endpoints are available
// Mock data serves as UI reference for the Next.js rebuild
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error';

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      <span>{type === 'success' ? '\u2713' : '\u2717'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100" aria-label="Close">
        {'\u00d7'}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface Review {
  id: string;
  name: string;
  initial: string;
  rating: number;
  date: string;
  text: string;
  replied: boolean;
  replyText?: string;
  aiReplied?: boolean;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Priya S.',
    initial: 'PS',
    rating: 5,
    date: '2 days ago',
    text: 'Excellent diagnostic service! Results were quick and accurate. The staff was very professional and helpful.',
    replied: true,
    replyText: 'Thank you so much, Priya! We are glad you had a great experience. Looking forward to serving you again.',
    aiReplied: true,
  },
  {
    id: '2',
    name: 'Ravi K.',
    initial: 'RK',
    rating: 4,
    date: '5 days ago',
    text: 'Good clinic overall. Waiting time was a bit long but the doctor was very thorough with the consultation.',
    replied: false,
  },
  {
    id: '3',
    name: 'Anitha M.',
    initial: 'AM',
    rating: 5,
    date: '1 week ago',
    text: 'Best healthcare experience in the city. Clean facility and caring staff. Highly recommend!',
    replied: true,
    replyText: 'Thank you, Anitha! Your kind words mean a lot to our team.',
  },
  {
    id: '4',
    name: 'Suresh R.',
    initial: 'SR',
    rating: 3,
    date: '2 weeks ago',
    text: 'Decent service but could improve on appointment scheduling. Had to wait for 40 minutes past my scheduled time.',
    replied: false,
  },
];

interface SocialPost {
  id: string;
  title: string;
  description: string;
  status: 'ready' | 'draft' | 'scheduled';
  platform: string;
  emoji: string;
  bgColor: string;
}

const MOCK_POSTS: SocialPost[] = [
  { id: '1', title: 'World Health Day Special', description: 'Free health checkup campaign post for your social channels', status: 'ready', platform: 'Instagram, Facebook', emoji: '\ud83c\udf0d', bgColor: 'bg-emerald-100' },
  { id: '2', title: '5 Signs You Need Thyroid Test', description: 'Educational carousel post about thyroid health awareness', status: 'draft', platform: 'Instagram', emoji: '\ud83e\udea8', bgColor: 'bg-purple-100' },
  { id: '3', title: 'Monsoon Health Tips', description: 'Seasonal health tips to keep your audience engaged', status: 'scheduled', platform: 'Facebook, WhatsApp', emoji: '\ud83c\udf27\ufe0f', bgColor: 'bg-blue-100' },
  { id: '4', title: 'Happy Independence Day', description: 'Festive greeting post with your branding', status: 'scheduled', platform: 'Instagram, Facebook', emoji: '\ud83c\uddee\ud83c\uddf3', bgColor: 'bg-orange-100' },
  { id: '5', title: 'New Lab Test: Vitamin D+B12', description: 'Announcement post for new test packages', status: 'draft', platform: 'WhatsApp, Facebook', emoji: '\ud83e\uddea', bgColor: 'bg-green-100' },
  { id: '6', title: 'Patient Testimonial Spotlight', description: 'Share real patient stories to build trust', status: 'ready', platform: 'Instagram', emoji: '\u2b50', bgColor: 'bg-yellow-100' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MarketingDashboard({ user }: { user: AuthUser | null }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_POSTS);
  const [generatingReply, setGeneratingReply] = useState<string | null>(null);
  const [draftReply, setDraftReply] = useState<{ id: string; text: string } | null>(null);
  const [autoRequest, setAutoRequest] = useState(false);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);
  const clearToast = useCallback(() => setToast(null), []);

  const handleAiReply = (reviewId: string) => {
    setGeneratingReply(reviewId);
    setTimeout(() => {
      const review = reviews.find((r) => r.id === reviewId);
      const reply =
        review && review.rating >= 4
          ? `Thank you for your wonderful feedback, ${review.name.split('.')[0]}! We truly appreciate your trust in us and are delighted to know you had a great experience. We look forward to serving you again!`
          : `Thank you for sharing your experience, ${review?.name.split('.')[0]}. We sincerely apologize for the inconvenience. Your feedback helps us improve. We would love to make it right — please reach out to us directly.`;
      setGeneratingReply(null);
      setDraftReply({ id: reviewId, text: reply });
    }, 1500);
  };

  const postReply = (reviewId: string) => {
    if (!draftReply) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, replied: true, replyText: draftReply.text, aiReplied: true } : r,
      ),
    );
    setDraftReply(null);
    showToast('Reply posted successfully!', 'success');
  };

  const handleGenerateContent = () => {
    showToast('AI is generating new content... Check back shortly!', 'success');
    setTimeout(() => {
      setPosts((prev) => [...prev]);
    }, 2000);
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Post deleted', 'success');
  };

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  if (!user) {
    return (
      <Card>
        <CardContent>
          <p className="py-8 text-center text-gray-500">Not authenticated. Please log in again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing & Online Presence</h1>
          <p className="text-sm text-gray-500">Manage your digital marketing channels and content</p>
        </div>
        <Button
          onClick={handleGenerateContent}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
        >
          <SparklesIcon className="mr-2 h-4 w-4" />
          AI Generate Content
        </Button>
      </div>

      {/* Channel Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Google Business Profile */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-600">
                  G
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Google Business Profile</h3>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Setup Required</Badge>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <StatMini label="Views" value="0" />
              <StatMini label="Clicks" value="0" />
              <StatMini label="Calls" value="0" />
            </div>
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={() => showToast('Google Business setup initiated!', 'success')}>
              One-Click Setup
            </Button>
          </CardContent>
        </Card>

        {/* Facebook & Instagram */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
                  f
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Facebook & Instagram</h3>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Setup Required</Badge>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <StatMini label="Likes" value="0" />
              <StatMini label="Posts" value="0" />
              <StatMini label="Reach" value="0" />
            </div>
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={() => showToast('Facebook & Instagram setup initiated!', 'success')}>
              One-Click Setup
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp Marketing */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <ChatIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp Marketing</h3>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2 text-center">
              <StatMini label="Connected" value="1" />
              <StatMini label="Sent" value="0" />
              <StatMini label="Open Rate" value="0%" />
            </div>
            <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => showToast('Opening campaign configurator...', 'success')}>
              Configure Campaigns
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Patient Reviews */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Patient Reviews</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-gray-900">{avgRating}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(Number(avgRating))
                          ? 'text-amber-400'
                          : 'text-gray-200'
                      }`}
                      filled={star <= Math.round(Number(avgRating))}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => showToast('Review request sent via WhatsApp!', 'success')}
              >
                <ChatIcon className="mr-1 h-3.5 w-3.5" />
                Send Review Requests via WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAutoRequest(!autoRequest);
                  showToast(`Auto-Request ${!autoRequest ? 'enabled' : 'disabled'}`, 'success');
                }}
                className={autoRequest ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}
              >
                Auto-Request: {autoRequest ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {review.initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{review.name}</span>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="mt-0.5 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-3.5 w-3.5 ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
                          filled={star <= review.rating}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{review.text}</p>

                    {review.replied && review.replyText && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="font-medium">Your reply</span>
                          {review.aiReplied && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{review.replyText}</p>
                      </div>
                    )}

                    {!review.replied && generatingReply === review.id && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-purple-600">
                        <Spinner /> Generating AI reply...
                      </div>
                    )}

                    {!review.replied && draftReply?.id === review.id && (
                      <div className="mt-3 space-y-2 rounded-lg bg-purple-50 p-3">
                        <p className="text-xs font-medium text-purple-700">AI Draft Reply:</p>
                        <p className="text-sm text-gray-700">{draftReply.text}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => postReply(review.id)}
                          >
                            Post Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDraftReply(null)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}

                    {!review.replied && generatingReply !== review.id && draftReply?.id !== review.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                        onClick={() => handleAiReply(review.id)}
                      >
                        <SparklesIcon className="mr-1 h-3.5 w-3.5" />
                        AI Reply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* AI Social Posts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Social Media Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.id} className="overflow-hidden rounded-lg border">
                <div className={`flex h-32 items-center justify-center ${post.bgColor}`}>
                  <span className="text-4xl">{post.emoji}</span>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 text-sm">{post.title}</h4>
                    <Badge
                      className={
                        post.status === 'ready'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : post.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                      }
                    >
                      {post.status === 'ready' ? 'Ready' : post.status === 'scheduled' ? 'Scheduled' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs text-gray-500">{post.description}</p>
                  <p className="mb-3 text-xs text-gray-400">{post.platform}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => showToast(`Publishing "${post.title}"...`, 'success')}
                    >
                      Publish
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-500 hover:bg-red-50"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SEO Section */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SeoItem label="Page Title" value={`${user.name} | Trusted Healthcare Partner`} />
            <SeoItem label="Meta Description" value={`Visit ${user.name} for quality healthcare services. Book appointments online, view lab reports, and more.`} />
            <SeoItem label="Primary URL" value={user.hospitalId ? `https://${user.hospitalId}.medihost.co.in` : 'Not configured'} />
            <SeoItem label="Schema Markup" value="LocalBusiness + MedicalOrganization" />
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">SEO Tip</p>
            <p className="mt-1 text-sm text-emerald-700">
              Keep your Google Business Profile updated with photos and respond to reviews regularly.
              Businesses that respond to reviews get 35% more clicks on average.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function SeoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm text-gray-900 line-clamp-2">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function StarIcon({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}
