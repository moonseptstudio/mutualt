import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { User, FileText } from 'lucide-react';

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return (
        <SkeletonTheme 
            baseColor={isDark ? '#1e293b' : '#e2e8f0'} 
            highlightColor={isDark ? '#334155' : '#f8fafc'}
        >
            {children}
        </SkeletonTheme>
    );
};

// 1. Dashboard Content Skeleton (rendered below the welcome heading)
export const DashboardSkeleton = () => (
    <ThemeWrapper>
        <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-(--border-main) bg-(--bg-card)">
                                <Skeleton circle width={40} height={40} className="mb-3" />
                                <Skeleton width="50%" height={14} className="mb-2" />
                                <Skeleton width="35%" height={26} />
                            </div>
                        ))}
                    </div>
                    {/* Featured / Banner card */}
                    <div className="glass-card rounded-3xl sm:rounded-[40px] p-6 sm:p-10 border border-(--border-main) bg-(--bg-card)">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <Skeleton width={180} height={24} className="rounded-lg" />
                            <Skeleton width={100} height={32} className="rounded-xl" />
                        </div>
                        <Skeleton height={140} className="rounded-2xl" />
                    </div>
                    {/* Recent Requests Section */}
                    <div className="glass-card rounded-3xl sm:rounded-[40px] p-6 sm:p-8 border border-(--border-main) bg-(--bg-card)">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton width={160} height={24} className="rounded-lg" />
                            <Skeleton width={80} height={20} className="rounded-lg" />
                        </div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="p-4 rounded-2xl border border-(--border-main) bg-(--bg-card)/50 flex items-center justify-between">
                                    <div className="flex items-center space-x-3 w-full">
                                        <Skeleton circle width={48} height={48} />
                                        <div className="flex-1">
                                            <Skeleton width="40%" height={18} className="mb-2" />
                                            <Skeleton width="60%" height={14} />
                                        </div>
                                        <Skeleton width={90} height={36} className="rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Right Sidebar */}
                <div className="space-y-8">
                    <div className="glass-card rounded-[40px] p-8 border border-(--border-main) bg-(--bg-card)">
                        <div className="flex items-center space-x-4 mb-6">
                            <Skeleton circle width={64} height={64} />
                            <div className="flex-1">
                                <Skeleton width="70%" height={20} className="mb-2" />
                                <Skeleton width="50%" height={14} />
                            </div>
                        </div>
                        <Skeleton count={3} height={16} className="mb-3" />
                        <Skeleton height={42} className="rounded-2xl mt-4" />
                    </div>
                    <div className="glass-card rounded-[40px] p-8 border border-(--border-main) bg-(--bg-card)">
                        <Skeleton width={150} height={22} className="mb-4" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} height={48} className="rounded-2xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ThemeWrapper>
);

// 2. Preferences Content Skeleton (rendered below the title and subtitle)
export const PreferencesSkeleton = () => (
    <ThemeWrapper>
        <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Ranked Selection list */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card rounded-[32px] p-6 sm:p-8 border border-(--border-main) bg-(--bg-card)/40 shadow-xl shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-(--border-main)/50">
                            <Skeleton width={180} height={24} className="rounded-lg" />
                            <Skeleton width={110} height={42} className="rounded-xl" />
                        </div>
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="p-4 sm:p-5 rounded-2xl border border-(--border-main) bg-(--bg-card) flex items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <Skeleton circle width={36} height={36} />
                                        <div className="flex-1">
                                            <Skeleton width="45%" height={18} className="mb-1.5" />
                                            <Skeleton width="25%" height={13} />
                                        </div>
                                    </div>
                                    <Skeleton width={32} height={32} className="rounded-lg" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Right side: Preferences Info/Tips */}
                <div className="space-y-6">
                    <div className="rounded-[32px] p-8 border border-(--border-main) bg-(--bg-card)">
                        <Skeleton circle width={44} height={44} className="mb-4" />
                        <Skeleton width="60%" height={22} className="mb-3" />
                        <Skeleton count={3} height={14} className="mb-4" />
                        <div className="space-y-3 pt-3 border-t border-(--border-main)/50">
                            <Skeleton width="85%" height={14} />
                            <Skeleton width="80%" height={14} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ThemeWrapper>
);

// 3. Matches Content Skeleton (rendered below the title and subtitle)
export const MatchesSkeleton = () => (
    <ThemeWrapper>
        <div className="animate-in fade-in duration-500 space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="glass-card rounded-2xl sm:rounded-[32px] p-4 sm:p-8 border border-(--border-main) bg-(--bg-card) flex flex-col sm:flex-row items-center sm:space-x-6 space-y-2 sm:space-y-0">
                        <Skeleton circle width={48} height={48} />
                        <div className="flex-1 text-center sm:text-left">
                            <Skeleton width={40} height={24} className="mb-1" />
                            <Skeleton width={80} height={12} />
                        </div>
                    </div>
                ))}
                <div className="col-span-2 glass-card rounded-2xl sm:rounded-[32px] p-4 sm:p-8 border border-(--border-main) bg-(--bg-card) flex items-center justify-between">
                    <div className="flex-1">
                        <Skeleton width={160} height={20} className="mb-2" />
                        <Skeleton width={220} height={14} />
                    </div>
                    <Skeleton width={100} height={36} className="rounded-xl hidden sm:block" />
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <Skeleton width={100} height={36} className="rounded-xl" />
                        <Skeleton width={80} height={24} className="rounded-lg" />
                    </div>
                    <div className="flex items-center space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} width={70} height={36} className="rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Match Cards List */}
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card rounded-[28px] p-5 sm:p-6 border border-(--border-main) bg-(--bg-card)">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <Skeleton circle width={54} height={54} />
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1.5">
                                            <Skeleton width={140} height={20} />
                                            <Skeleton width={60} height={18} className="rounded-full" />
                                        </div>
                                        <Skeleton width={180} height={14} />
                                    </div>
                                </div>
                                <div className="flex-1 max-w-md">
                                    <Skeleton height={44} className="rounded-2xl" />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Skeleton width={110} height={42} className="rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </ThemeWrapper>
);

// 4. Requests Content Skeleton (rendered below title, subtitle, and tabs)
export const RequestsSkeleton = () => (
    <ThemeWrapper>
        <div className="animate-in fade-in duration-500 space-y-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-5 sm:p-6 rounded-[24px] border border-(--border-main) bg-(--bg-card)">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <Skeleton circle width={52} height={52} />
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Skeleton width={150} height={20} />
                                    <Skeleton width={70} height={20} className="rounded-full" />
                                </div>
                                <Skeleton width={200} height={14} />
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 self-end sm:self-center">
                            <Skeleton width={90} height={38} className="rounded-xl" />
                            <Skeleton width={90} height={38} className="rounded-xl" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </ThemeWrapper>
);

// 5. Chat Rooms Skeleton (rendered in the Messages sidebar room list)
export const ChatRoomsSkeleton = () => (
    <ThemeWrapper>
        <div className="divide-y divide-(--border-main)/50">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 sm:p-5 flex items-center space-x-3.5">
                    <Skeleton circle width={44} height={44} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                            <Skeleton width="55%" height={16} />
                            <Skeleton width={35} height={12} />
                        </div>
                        <Skeleton width="80%" height={13} />
                    </div>
                </div>
            ))}
        </div>
    </ThemeWrapper>
);

// 6. Chat History Skeleton (rendered inside the active chat message thread)
export const ChatHistorySkeleton = () => (
    <ThemeWrapper>
        <div className="space-y-4 p-2 sm:p-4">
            {/* Incoming message */}
            <div className="flex justify-start">
                <div className="max-w-[70%] space-y-1">
                    <Skeleton width={70} height={12} className="ml-1" />
                    <Skeleton width={220} height={44} className="rounded-2xl rounded-tl-none" />
                </div>
            </div>
            {/* Outgoing message */}
            <div className="flex justify-end">
                <div className="max-w-[70%] space-y-1 items-end flex flex-col">
                    <Skeleton width={180} height={40} className="rounded-2xl rounded-tr-none" />
                </div>
            </div>
            {/* Incoming message */}
            <div className="flex justify-start">
                <div className="max-w-[70%] space-y-1">
                    <Skeleton width={60} height={12} className="ml-1" />
                    <Skeleton width={280} height={52} className="rounded-2xl rounded-tl-none" />
                </div>
            </div>
            {/* Outgoing message */}
            <div className="flex justify-end">
                <div className="max-w-[70%] space-y-1 items-end flex flex-col">
                    <Skeleton width={240} height={48} className="rounded-2xl rounded-tr-none" />
                </div>
            </div>
            {/* Incoming message */}
            <div className="flex justify-start">
                <div className="max-w-[70%] space-y-1">
                    <Skeleton width={80} height={12} className="ml-1" />
                    <Skeleton width={160} height={38} className="rounded-2xl rounded-tl-none" />
                </div>
            </div>
        </div>
    </ThemeWrapper>
);

// 7. Profile Content Skeleton (rendered below the profile header/banner or for profile details)
export const ProfileSkeleton: React.FC<{ userName?: string }> = ({ userName }) => {
    const { t } = useTranslation();
    return (
        <ThemeWrapper>
            <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
                {/* Profile Header Banner Skeleton */}
                <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 pb-8 sm:pb-10 border-b border-(--border-main)">
                    <Skeleton circle width={130} height={130} className="rounded-[32px] sm:rounded-[48px]" />
                    <div className="text-center md:text-left grow space-y-2">
                        {userName ? (
                            <h1 className="text-2xl sm:text-4xl font-semibold text-(--text-main) tracking-tight leading-none">
                                {userName}
                            </h1>
                        ) : (
                            <Skeleton width={220} height={36} />
                        )}
                        <Skeleton width={240} height={16} />
                        <div className="flex items-center justify-center md:justify-start space-x-6 pt-3">
                            <div>
                                <Skeleton width={60} height={20} className="mb-1" />
                                <Skeleton width={50} height={12} />
                            </div>
                            <div className="w-px h-8 bg-(--border-main)/50" />
                            <div>
                                <Skeleton width={60} height={20} className="mb-1" />
                                <Skeleton width={50} height={12} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Two Columns Content with Real Section Topics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="px-2">
                            <h3 className="text-base sm:text-lg font-semibold text-(--text-main) tracking-tight mb-4 sm:mb-6 flex items-center space-x-3">
                                <User size={20} className="text-primary-600" />
                                <span>{t('profile.personal_config')}</span>
                            </h3>
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="p-4 sm:p-5 rounded-3xl border border-(--border-main) bg-(--bg-card) flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton circle width={42} height={42} />
                                            <div>
                                                <Skeleton width={100} height={12} className="mb-1.5" />
                                                <Skeleton width={180} height={18} />
                                            </div>
                                        </div>
                                        <Skeleton width={70} height={28} className="rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="px-2">
                            <h3 className="text-base sm:text-lg font-semibold text-(--text-main) tracking-tight mb-4 sm:mb-6 flex items-center space-x-3">
                                <FileText size={20} className="text-primary-600" />
                                <span>{t('profile.verification_pipeline')}</span>
                            </h3>
                            <div className="glass-card rounded-2xl sm:rounded-[32px] p-6 sm:p-8 border border-(--border-main) bg-(--bg-card) space-y-6">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="flex items-start space-x-4">
                                        <Skeleton circle width={38} height={38} />
                                        <div className="flex-1">
                                            <Skeleton width="45%" height={16} className="mb-1.5" />
                                            <Skeleton width="85%" height={13} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeWrapper>
    );
};

// 8. Settings Content Skeleton (rendered below the settings title & subtitle)
export const SettingsSkeleton = () => {
    const { t } = useTranslation();
    return (
        <ThemeWrapper>
            <div className="animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Column 1: Notifications */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-medium text-(--text-muted) uppercase tracking-wider mb-6 px-2">
                                {t('settings.section_notifications')}
                            </h3>
                            <div className="space-y-4">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="glass-card rounded-[24px] p-5 sm:p-6 border border-(--border-main) bg-(--bg-card) flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Skeleton circle width={42} height={42} />
                                            <div>
                                                <Skeleton width={150} height={18} className="mb-1.5" />
                                                <Skeleton width={220} height={13} />
                                            </div>
                                        </div>
                                        <Skeleton width={48} height={26} className="rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Security */}
                    <div className="space-y-8">
                        <div className="glass-card rounded-[32px] p-8 border border-(--border-main) bg-(--bg-card)/40">
                            <h3 className="text-lg font-semibold text-(--text-main) tracking-tight mb-8">
                                {t('settings.section_security')}
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Skeleton circle width={40} height={40} />
                                        <div>
                                            <Skeleton width={140} height={18} className="mb-1" />
                                            <Skeleton width={180} height={13} />
                                        </div>
                                    </div>
                                    <Skeleton width={90} height={34} className="rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeWrapper>
    );
};

// Generic fallback skeletons for backward compatibility
export const ListSkeleton = RequestsSkeleton;
export const CardGridSkeleton = MatchesSkeleton;
