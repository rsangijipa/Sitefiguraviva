
"use client";

import { Post } from '@/types/community';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { MessageSquare, Heart, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostCardProps {
    post: Post;
    onClick?: () => void;
}

export const PostCard = ({ post, onClick }: PostCardProps) => {

    const date = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt || Date.now());
    const timeAgo = new Intl.RelativeTimeFormat('pt-BR', { style: 'short' }).format(
        -Math.ceil((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)),
        'day'
    );

    return (
        <div
            onClick={onClick}
            className="bg-white p-5 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <Avatar className="shrink-0">
                    <AvatarImage src={post.author.photoURL} alt={post.author.displayName} />
                    <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">{post.author.displayName}</span>
                            {post.author.role === 'admin' && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">ADMIN</span>
                            )}
                            <span className="text-xs text-stone-400">• {timeAgo}</span>
                        </div>
                        {post.isPinned && <Pin size={14} className="text-stone-400 rotate-45" />}
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-stone-800 mb-2 leading-tight group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-3 mb-4">
                        {post.content}
                    </p>

                    {/* Footer / Stats */}
                    <div className="flex items-center gap-6 text-stone-400 text-xs font-medium">
                        <div className="flex items-center gap-1.5 hover:text-stone-600">
                            <MessageSquare size={14} />
                            {post.commentsCount} comentários
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                            <Heart size={14} />
                            {post.likesCount} curtidas
                        </div>
                        <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-100 capitalize">
                            #{post.channel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
