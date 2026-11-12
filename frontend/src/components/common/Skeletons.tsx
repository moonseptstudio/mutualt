import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '../../context/ThemeContext';

export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    return (
        <SkeletonTheme 
            baseColor={isDark ? '#1e293b' : '#f1f5f9'} 
            highlightColor={isDark ? '#334155' : '#ffffff'}
        >
            {children}
        </SkeletonTheme>
    );
};

export const DashboardSkeleton = () => (
    <ThemeWrapper>
        <div className="animate-in fade-in duration-700 pb-10">
            <div className="mb-6 lg:mb-8">
                <Skeleton width={250} height={40} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass-card p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border-(--border-main) bg-(--bg-card)">
                                <Skeleton circle width={48} height={48} className="mb-4" />
                                <Skeleton width="60%" height={16} className="mb-2" />
                                <Skeleton width="40%" height={32} />
                            </div>
                        ))}
                    </div>
                    <div className="glass-card rounded-3xl sm:rounded-[40px] p-6 sm:p-10 border border-(--border-main) bg-(--bg-card)">
                        <Skeleton height={200} className="rounded-2xl" />
                    </div>
                    <div className="glass-card rounded-3xl sm:rounded-[40px] p-6 sm:p-8 border border-(--border-main) bg-(--bg-card)">
                         <Skeleton width={180} height={28} className="mb-6" />
                         <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} height={80} className="rounded-[24px]" />
                            ))}
                         </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="glass-card rounded-[40px] p-8 border border-(--border-main) bg-(--bg-card)">
                        <Skeleton circle width={64} height={64} className="mb-6" />
                        <Skeleton count={4} className="mb-3" />
                    </div>
                    <div className="glass-card rounded-[40px] p-8 border border-(--border-main) bg-(--bg-card) h-64">
                         <Skeleton height="100%" className="rounded-[24px]" />
                    </div>
                </div>
            </div>
        </div>
    </ThemeWrapper>
);

export const ProfileSkeleton = () => (
    <ThemeWrapper>
        <div className="pb-10 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="glass-card rounded-[40px] p-8 sm:p-12 relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
                <Skeleton circle width={140} height={140} />
                <div className="flex-1 w-full text-center sm:text-left">
                    <Skeleton width={240} height={40} className="mb-3" />
                    <Skeleton width={180} height={24} className="mb-6" />
                    <Skeleton width={120} height={36} className="rounded-full" />
                </div>
            </div>
            <div className="glass-card rounded-[40px] p-8 border border-(--border-main) bg-(--bg-card)">
                <Skeleton width={200} height={32} className="mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i}>
                            <Skeleton width={120} height={18} className="mb-3" />
                            <Skeleton height={56} className="rounded-2xl" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </ThemeWrapper>
);

export const ListSkeleton = () => (
    <ThemeWrapper>
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <Skeleton width={220} height={48} className="rounded-xl" />
                <Skeleton width={140} height={48} className="rounded-xl" />
            </div>
            {[...Array(5)].map((_, i) => (
                <div key={i} className="glass-card p-6 rounded-[24px]">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                        <Skeleton circle width={64} height={64} />
                        <div className="flex-1 w-full">
                            <Skeleton width="50%" height={24} className="mb-3" />
                            <Skeleton width="70%" height={18} />
                        </div>
                        <Skeleton width={120} height={48} className="rounded-xl mt-4 sm:mt-0 w-full sm:w-auto" />
                    </div>
                </div>
            ))}
        </div>
    </ThemeWrapper>
);

export const CardGridSkeleton = () => (
    <ThemeWrapper>
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <Skeleton width={220} height={48} className="rounded-xl" />
                <Skeleton width={140} height={48} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card rounded-[32px] overflow-hidden">
                        <div className="p-6">
                           <div className="flex items-center justify-between mb-6">
                               <Skeleton circle width={56} height={56} />
                               <Skeleton width={60} height={24} className="rounded-full" />
                           </div>
                           <Skeleton width="80%" height={28} className="mb-4" />
                           <Skeleton count={2} className="mb-6" />
                           <Skeleton height={48} className="rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </ThemeWrapper>
);
